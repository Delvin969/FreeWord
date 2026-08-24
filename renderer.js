const editor = document.getElementById('editor');
const statusText = document.getElementById('statusText');
const wordCount = document.getElementById('wordCount');

editor.focus();

// --- Simple toolbar commands via execCommand (still supported in Chromium/Electron) ---
document.querySelectorAll('button[data-cmd]').forEach((btn) => {
  btn.addEventListener('click', () => {
    editor.focus();
    document.execCommand(btn.dataset.cmd, false, null);
  });
});

document.getElementById('fontName').addEventListener('change', (e) => {
  editor.focus();
  document.execCommand('fontName', false, e.target.value);
});

document.getElementById('fontSize').addEventListener('change', (e) => {
  editor.focus();
  // execCommand fontSize only takes 1-7, so wrap selection in a span with pt size instead
  const size = e.target.value;
  const sel = window.getSelection();
  if (!sel.rangeCount || sel.isCollapsed) return;
  const range = sel.getRangeAt(0);
  const span = document.createElement('span');
  span.style.fontSize = size + 'pt';
  range.surroundContents(span);
});

document.getElementById('blockFormat').addEventListener('change', (e) => {
  editor.focus();
  document.execCommand('formatBlock', false, e.target.value);
});

document.getElementById('foreColor').addEventListener('input', (e) => {
  editor.focus();
  document.execCommand('foreColor', false, e.target.value);
});

document.getElementById('hiliteColor').addEventListener('input', (e) => {
  editor.focus();
  document.execCommand('hiliteColor', false, e.target.value);
});

document.getElementById('insertTableBtn').addEventListener('click', () => {
  const rows = parseInt(prompt('Rows?', '3'), 10) || 3;
  const cols = parseInt(prompt('Columns?', '3'), 10) || 3;
  let html = '<table>';
  for (let r = 0; r < rows; r++) {
    html += '<tr>';
    for (let c = 0; c < cols; c++) html += '<td>&nbsp;</td>';
    html += '</tr>';
  }
  html += '</table><p><br></p>';
  editor.focus();
  document.execCommand('insertHTML', false, html);
});

document.getElementById('insertLinkBtn').addEventListener('click', () => {
  const url = prompt('URL?', 'https://');
  if (url) {
    editor.focus();
    document.execCommand('createLink', false, url);
  }
});

// --- Word count ---
function updateWordCount() {
  const text = editor.innerText.trim();
  const count = text ? text.split(/\s+/).length : 0;
  wordCount.textContent = `${count} word${count === 1 ? '' : 's'}`;
}
editor.addEventListener('input', updateWordCount);
updateWordCount();

// --- File menu / IPC wiring ---
window.api.onNew(() => {
  editor.innerHTML = '<p>Start typing your document here...</p>';
  statusText.textContent = 'Untitled document';
  updateWordCount();
});

window.api.onLoad(({ html, filePath }) => {
  editor.innerHTML = html;
  statusText.textContent = filePath;
  updateWordCount();
});

window.api.onRequestContent(({ forceDialog }) => {
  window.api.sendContent(editor.innerHTML, forceDialog);
});

window.api.onSaved(({ filePath }) => {
  statusText.textContent = `Saved: ${filePath}`;
});

document.getElementById('newBtn').addEventListener('click', () => {
  editor.innerHTML = '<p>Start typing your document here...</p>';
  updateWordCount();
});
document.getElementById('openBtn').addEventListener('click', () => {
  window.api.requestOpen();
});
document.getElementById('saveBtn').addEventListener('click', () => {
  window.api.sendContent(editor.innerHTML, false);
});
document.getElementById('saveAsBtn').addEventListener('click', () => {
  window.api.sendContent(editor.innerHTML, true);
});
