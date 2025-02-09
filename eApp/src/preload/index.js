import { electronAPI } from '@electron-toolkit/preload'
const { contextBridge } = require('electron');



if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    // contextBridge.exposeInMainWorld('api', {
    //   send: (channel, data) => {
    //     // Whitelist channels
    //     let validChannels = ['toMain']
    //     if (validChannels.includes(channel)) {
    //       ipcRenderer.send(channel, data)
    //     } else {
    //       console.error(`toMain Invalid channel: ${channel}`)
    //     }
    //   },
    //   receive: (channel, func) => {
    //     let validChannels = ['fromMain']
    //     if (validChannels.includes(channel)) {
    //       // Deliberately strip event as it includes `sender`
    //       ipcRenderer.on(channel, (event, ...args) => func(...args));
    //     } else {
    //       console.error(`fromMain Invalid channel: ${channel}`)
    //     }
    //   }
    // })
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  // window.api = apiX
}

console.log('[Perload][1][initServer]')
console.log('[Perload][2][initServer]')
