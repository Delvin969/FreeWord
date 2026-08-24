const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const mammoth = require('mammoth');
const HTMLtoDOCX = require('html-to-docx');

let mainWindow;
let currentFilePath = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 850,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: 'FreeWord',
  });

  mainWindow.loadFile('index.html');
  buildMenu();
}

function buildMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { label: 'New', accelerator: 'CmdOrCtrl+N', click: () => mainWindow.webContents.send('doc:new') },
        { label: 'Open .docx / .html / .txt...', accelerator: 'CmdOrCtrl+O', click: openFile },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => saveFile(false) },
        { label: 'Save As .docx...', accelerator: 'CmdOrCtrl+Shift+S', click: () => saveFile(true) },
        { type: 'separator' },
        { label: 'Exit', role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [{ role: 'reload' }, { role: 'toggleDevTools' }, { role: 'togglefullscreen' }],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

async function openFile() {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Documents', extensions: ['docx', 'html', 'htm', 'txt'] },
      { name: 'Word Document', extensions: ['docx'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });
  if (canceled || !filePaths.length) return;
  const filePath = filePaths[0];
  currentFilePath = filePath;
  const ext = path.extname(filePath).toLowerCase();

  try {
    let html;
    if (ext === '.docx') {
      const result = await mammoth.convertToHtml({ path: filePath });
      html = result.value;
    } else if (ext === '.html' || ext === '.htm') {
      html = fs.readFileSync(filePath, 'utf8');
    } else {
      const text = fs.readFileSync(filePath, 'utf8');
      html = text
        .split(/\r?\n/)
        .map((line) => `<p>${escapeHtml(line) || '<br>'}</p>`)
        .join('');
    }
    mainWindow.webContents.send('doc:load', { html, filePath });
    mainWindow.setTitle(`FreeWord - ${path.basename(filePath)}`);
  } catch (err) {
    dialog.showErrorBox('Open failed', String(err));
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function saveFile(forceDialog) {
  mainWindow.webContents.send('doc:requestContent', { forceDialog });
}

ipcMain.on('doc:contentReply', async (event, { html, forceDialog }) => {
  let targetPath = currentFilePath;
  if (forceDialog || !targetPath || !targetPath.toLowerCase().endsWith('.docx')) {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: targetPath ? targetPath.replace(/\.[^/.]+$/, '.docx') : 'Untitled.docx',
      filters: [{ name: 'Word Document', extensions: ['docx'] }],
    });
    if (canceled || !filePath) return;
    targetPath = filePath;
  }

  try {
    const buffer = await HTMLtoDOCX(html, null, {
      table: { row: { cantSplit: true } },
      footer: false,
      pageNumber: false,
    });
    fs.writeFileSync(targetPath, buffer);
    currentFilePath = targetPath;
    mainWindow.setTitle(`FreeWord - ${path.basename(targetPath)}`);
    mainWindow.webContents.send('doc:saved', { filePath: targetPath });
  } catch (err) {
    dialog.showErrorBox('Save failed', String(err));
  }
});

ipcMain.on('doc:openRequest', () => openFile());

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
