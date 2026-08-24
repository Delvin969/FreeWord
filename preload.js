const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  onNew: (cb) => ipcRenderer.on('doc:new', cb),
  onLoad: (cb) => ipcRenderer.on('doc:load', (e, data) => cb(data)),
  onRequestContent: (cb) => ipcRenderer.on('doc:requestContent', (e, data) => cb(data)),
  onSaved: (cb) => ipcRenderer.on('doc:saved', (e, data) => cb(data)),
  sendContent: (html, forceDialog) => ipcRenderer.send('doc:contentReply', { html, forceDialog }),
  requestOpen: () => ipcRenderer.send('doc:openRequest'),
});
