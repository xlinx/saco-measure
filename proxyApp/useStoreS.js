import os from "node:os";
import ip from "ip";



export let useStoreS = {
    VictoriaVOICE:true,

    HOSTNAME:os.hostname(),
    APP_IPS:[ip.address()],
    APP_IP:ip.address(),
    UDP_PORT:62202,
    TCP_PORT:62203,

    WSC_COUNT:0,

    RX_JSON: {},
    TX_JSON:{WHO: "WSS",CMD:"DECADE.TW",TS:""},

    SERVER_TS:new Date().toLocaleString('en-GB'),
    TRIGGER_SAVE:false,

};
