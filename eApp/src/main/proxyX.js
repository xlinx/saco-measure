import os from 'node:os'
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import path from 'path'
import fs from 'node:fs'
import { bindFlmngr } from '@flmngr/flmngr-server-node-express'

const app = express()
const homedir = require('os').homedir()
let homedir_sacoMeasure = path.join(homedir, 'sacoMeasure')

let http = require('http')
const url = require('node:url')
const ip = require('ip')

function LaunchExe() {
  let child = require('child_process').execFile
  let executablePath = path.join(homedir, 'sacoMain.exe')
  let inputJSON = JSON.stringify({ classes: [0], conf: 0.5 })
  let parameters = [inputJSON]
  child(executablePath, parameters, function (err, data) {
    console.log(err)
    console.log(data.toString())
  })
}
function httpHandler(req, res) {
  // console.log('[][][httpHandler]req=',`${req.method} ${req.url}`);

  const parsedUrl = new url.URL(req.url, 'http://' + ip.address() + ':3128/ftp')
  const sanitizePath = parsedUrl.pathname.replace(/^(\.\.[/\\])+/, '')
  let pathname = path.join(homedir_sacoMeasure, sanitizePath)
  pathname = decodeURI(pathname)
  console.log('[][][httpHandler]pathname=', pathname)

  fs.open(pathname, 'r', (err, fd) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error('myfile does not exist', pathname)
        res.statusCode = 404
        res.end(`File ${pathname} not found!`)
        return
      }
      throw err
    }
    try {
      if (fs.statSync(pathname).isDirectory()) {
        pathname += '/index.html'
      }
      fs.readFile(pathname, function (err, data) {
        // console.log(`[][][fs.readFile]`);

        if (err) {
          res.statusCode = 500
          res.end(`Error getting the file: ${err}.`)
        } else {
          const ext = path.parse(pathname).ext
          res.setHeader('Content-type', mimeType[ext] || 'text/plain')
          res.end(data)
        }
      })
    } finally {
      fs.close(fd, (err) => {
        if (err) throw err
      })
    }
  })
}

async function initProxyServer(PORT_ProxyServer) {
  return new Promise((resolve, reject) => {
    try {
      app.use('/ftp', function (req, res, next) {
        httpHandler(req, res)
        // next();
      })
      bindFlmngr({
        app: app,
        apiKey: 'FLMN24RR1234123412341234',
        urlFileManager: '/fm',
        urlFiles: '/ftp/',
        dirFiles: homedir_sacoMeasure
      })

      app.use(
        '/magic',
        createProxyMiddleware({
          target: 'http://localhost',
          logLevel: 'debug',
          cookieDomainRewrite: 'localhost',
          changeOrigin: true,
          router: (req) => {
            return req.url.match(new RegExp('_startOfTarget_' + '(.*)' + '_endOfTarget_'))[1]
          },

          pathRewrite: function (path, req) {
            let p0 = req.url.match(new RegExp('_startOfTarget_' + '(.*)' + '_endOfTarget_'))[1] // protocol + host
            let p = path.match(new RegExp('_endOfTarget_' + '(.*)'))[1]
            console.log('[][ProxyServer][pathRewrite]', p0 + p)
            return p
          }
        })
      )

      app.get('/udp', (req, res) => {
        // res.send(UDP_RX_MSG);
        UDPServer.send('asdf', 12345, '127.0.0.1', (err) => {
          if (err) {
            console.log(`Error: ${err}`)
          } else {
            console.log('Message sent successfully!')
          }
        })
      })
      app.listen(PORT_ProxyServer, () => {
        console.log(`[DECADE-Proxy]server listening  ${PORT_ProxyServer}`)
      })
      return resolve(app)
    } catch (e) {
      return reject(e)
    }
  })
}

const mimeType = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.tif': 'image/tif',
  '.tiff': 'image/tiff',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.doc': 'application/msword',
  '.eot': 'application/vnd.ms-fontobject',
  '.ttf': 'application/x-font-ttf'
}

function timerX() {
  // setInterval(() => {
  // console.log(new Date(),'[][timerX][1000][]')
  // LoadXhtml();
  // wssBroadcast1000();//unicast it
  // }, 500);
  // setInterval(() => {
  // console.log(new Date(), '[][timerX][1000][]')
  // }, 1000)
  // setInterval(() => {}, 3000)
}
let lLOADED = false

export function initServer() {
  if (lLOADED) {
    console.log('[ProxyJS][IN-Call][initServer]has been loaded')
    return
  }
  const httpServer_nodejs = http
    .createServer((req, res) => {
      httpHandler(req, res)
      console.log(`[][][-DECADEHTTP-NODE-Module]Server listening on port 7777`)
    })
    .listen(7777)

  initProxyServer(3128).then((r) => {
    console.log('[][][DECADE-PROXY-Module][3]server listening ', 3128)
  })
  console.log(`[][][initServer][1]...startLoading`)
  // httpServer(8888).then(r => {
  //     console.log('[][][DECADE-httpServer-Module][3]server listening ',8888);
  // });
  timerX()
  lLOADED = true
}

console.log('[ProxyJS][1][initServer]')
if (lLOADED) console.log('[ProxyJS][base-Call][initServer]has been loaded')
else {
  console.log('[ProxyJS][base-Call][initServer]start loading')
  initServer()
}
// console.log('[ProxyJS][2][initServer]', useStoreS)
// export default initServer
export let useStoreS = {
  BOX_IP: '192.168.88.154',
  APP_IP: '192.168.88.154',
  HOSTNAME: os.hostname(),
  APP_IPS: ['192.168.88.154']
}
