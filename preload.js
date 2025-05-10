




const { contextBridge, ipcRenderer} = require('electron');



contextBridge.exposeInMainWorld('electronAPI', {

    closeWindow: ()=> ipcRenderer.send('close-window'),
    saveFile: (filePath,data) => ipcRenderer.send('save-file', {path: filePath,data}),
    //saveFile: (filePath, data) => fs.writeFileSync(filePath, data),
    loadFile: (filePath) => ipcRenderer.sendSync('load-file', filePath),
    getSavePath: () => ipcRenderer.sendSync('get-save-path'),
    saveJournal: (filePath, data) => ipcRenderer.send('save-journal', { path: filePath, data })
});



