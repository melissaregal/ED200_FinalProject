const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const fs = require('fs');


app.disableHardwareAcceleration();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false 
    }
  });

  mainWindow.loadFile('index.html');


 //mainWindow.webContents.openDevTools();


  ipcMain.on('close-window', () => {
  
    if (mainWindow) {

      mainWindow.close();
    }
  });

  //path for tasks.json 
  ipcMain.on('get-save-path',(event) => {
    const savePath = path.resolve(__dirname, 'tasks.json');
    console.log("Save path requested:", savePath);
    event.returnValue = savePath;
  });

  //save tasks.json file 
  ipcMain.on('save-file',(event,{path: filePath, data}) => {
    console.log("Received save-file event");
    console.log("Saving to:", filePath);
    console.log("Data:", data);
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        console.log("Directory does not exist. Creating:", dir);
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, data,'utf-8');
      console.log("File written successfully");
    } catch (err) {
      console.error("Error saving file:", err);
    }

  });

  ipcMain.on('load-file', (event, filePath) => {
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        event.returnValue = data;
      } else {
        event.returnValue = null;


      }


    } catch (err) {
      console.error('Error loading file', err);
      event.returnValue = null;

    }


  });



}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('save-journal', (event, { path: filePath, data }) => {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, data, 'utf-8');
    console.log("Journal file saved:", filePath);
  } catch (err) {
    console.error("Error saving journal file:", err);
  }
});





