import {app, BrowserWindow, ipcMain, shell} from 'electron'
import {join} from 'path'
import {electronApp, is, optimizer} from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as fs from "node:fs";
import {initServer} from "./proxyX";
// require('@electron/remote/main').initialize()
// import {open, close} from 'node:fs';

let TX_JSON = {}
const nodePath = require('path');
const homedir = require("os").homedir();
const homedir_sacoMeasure = nodePath.join(homedir, 'sacoMeasure');
const dirTree = require("directory-tree");



const callback_dirTree = (item, PATH) => {
  console.log('[][][1]callback_dirTree item, nodePath=',item, PATH)
  item.children.map((e)=>{
    e.isDirectory = fs.lstatSync(e.path).isDirectory();
    e.thumbnail=e.path.replaceAll(homedir_sacoMeasure,'http://localhost:3128/ftp')
    e.image=e.path.replaceAll(homedir_sacoMeasure,'http://localhost:3128/ftp')
    e.id=e.path
  })

  console.log('[][][2]callback_dirTree item, nodePath=',item, PATH)

};
let dirTree_SacoMeasure = dirTree(homedir_sacoMeasure,
  {extensions: /\.(jpg|tif|png|jpeg|tiff|JPG|TIF|TIFF|PNG|JPEG)$/}, (item, PATH, stats) => {
    // console.log("[][][pathSacoMeasure]", item);
  }, callback_dirTree);
// console.log("[][1][pathSacoMeasure]", dirTree_SacoMeasure);


function createWindow() {
  // Create the browser window.
  initServer()
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? {icon} : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: is.dev,
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      enableRemoteModule: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.maximize()
    mainWindow.show()
  })
  mainWindow.webContents.openDevTools()

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return {action: 'deny', fileTree: dirTree_SacoMeasure}
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('tw.decade.sacoMeasure')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, 0))
  }

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.handle('toMain', async (event, ...args) => {
    TX_JSON['TS'] = new Date().toLocaleString()

    // let new_path=nodePath.normalize(nodePath.join(homedir_sacoMeasure.toString(), args.targetFolder))
    let new_path='/Users/xlinx/sacoMeasure/processed'
    console.log('new_path',new_path)
    // let new_path='/Users/xlinx/sacoMeasure/processed'
    TX_JSON['dirTree_SacoMeasure'] = dirTree(new_path,
      {extensions: /\.(jpg|tif|png|jpeg|tiff|JPG|TIF|TIFF|PNG|JPEG)$/}, (item, PATH, stats) => {
        // console.log("[][][pathSacoMeasure]", item);
      }, callback_dirTree)
    TX_JSON['RX_JSON'] = [...args]
    console.log('[fromIpcRender]@[ipcMain.handle][main][handle]TX_JSON=', TX_JSON)
    return (TX_JSON)
  })
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()

  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})



// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
