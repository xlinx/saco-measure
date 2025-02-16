import os from 'node:os'
import express from "express";
import {createProxyMiddleware} from 'http-proxy-middleware';
const app = express();
async function initProxyServer(PORT_ProxyServer) {

  return new Promise((resolve, reject) => {
    try {
      app.use('/gallery', require('../lib/gallery.js')({
        staticFiles : 'resources/photos',
        urlRoot : 'gallery',
        title : 'Example Gallery',
        render : false //
      }), function(req, res, next){
        return res.render('gallery', { galleryHtml : req.html });
      });

      app.use('/magic',
        createProxyMiddleware({
          target: 'http://localhost',
          logLevel: "debug",
          cookieDomainRewrite: "localhost",
          changeOrigin: true,
          router: (req) => {
            return req.url.match(new RegExp('_startOfTarget_' + "(.*)" + '_endOfTarget_'))[1];
          },

          pathRewrite: function (path, req) {
            let p0 = req.url.match(new RegExp('_startOfTarget_' + "(.*)" + '_endOfTarget_'))[1]; // protocol + host
            let p = path.match(new RegExp('_endOfTarget_' + "(.*)"))[1];
            console.log("[][ProxyServer][pathRewrite]", p0 + p);
            return p;
          },
        })
      );

      app.get('/udp', (req, res) => {
        // res.send(UDP_RX_MSG);
        UDPServer.send('asdf',12345,'127.0.0.1',(err) => {
          if (err) {
            console.log(`Error: ${err}`);
          } else {
            console.log('Message sent successfully!');
          }
        });
      });
      app.listen(PORT_ProxyServer, () => {
        console.log(`[DECADE-Proxy]server listening  ${PORT_ProxyServer}`);
      });
      return resolve(app)
    } catch (e) {
      return reject(e);
    }
  });
}
function timerX() {
  // setInterval(() => {
  // console.log(new Date(),'[][timerX][1000][]')
  // LoadXhtml();
  // wssBroadcast1000();//unicast it
  // }, 500);
  setInterval(() => {
    console.log(new Date(), '[][timerX][1000][]')
  }, 1000)
  setInterval(() => {}, 3000)
}
let lLOADED = false

export function initServer() {
  if (lLOADED) {
    console.log('[ProxyJS][IN-Call][initServer]has been loaded')
    return
  }
  initProxyServer(3128).then(r => {
    console.log('[][][DECADE-PROXY-Module][3]server listening ', 3128);
  });console.log(`[][][initServer][1]...startLoading`)
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
console.log('[ProxyJS][2][initServer]', useStoreS)
// export default initServer
export let useStoreS = {
  BOX_IP: '192.168.88.154',
  APP_IP: '192.168.88.154',
  HOSTNAME: os.hostname(),
  APP_IPS: ['192.168.88.154']
}
