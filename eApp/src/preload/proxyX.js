import os from 'node:os'


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
console.log('[ProxyJS][2][initServer]', useStoreS)
// export default initServer
export let useStoreS = {
  BOX_IP: '192.168.88.154',
  APP_IP: '192.168.88.154',
  HOSTNAME: os.hostname(),
  APP_IPS: ['192.168.88.154']
}
