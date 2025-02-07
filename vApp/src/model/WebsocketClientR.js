import {useStoreX} from "./StoreX.jsx";


export class WebsocketClientR {

    constructor(setRX_STR,setRX_JSON) {
        console.log("[WebsocketClientR][constructor]" );
        this.last_MSG_FROM_WSS="";
        // this.PAPA=papa;
        // this.callBack=callBack;
        this.maxReconnect=3;
        //this.connectInfo='ws://xwin.local:44444';//https://1922-42-72-107-66.ngrok-free.app/
        this.wss_server = window.location.host.toString().split(':')[0];
        this.wss_server=this.wss_server.length < 3 ? "localhost": this.wss_server;
        this.wss_server_port = 5555;
        var l = document.location;
        var scheme = l.protocol === 'https:' ? 'wss' : 'ws';
        this.connectInfo = scheme+'://' + this.wss_server + ':'+this.wss_server_port ;
        // this.connectInfo = scheme+'://localhost:'+this.wss_server_port ;
        this.ws=this.initWSC();
        this.setRX_STR=setRX_STR;
        this.setRX_JSON=setRX_JSON;

        // const {setRX_JSON} = useStoreX.getState();


    }


    readyStatusX(){

        if(this.ws===undefined||!(this.ws.readyState===this.ws.OPEN))
            return -1;
        else
            return this.ws.readyState;
    }
    sendMsgX(msg){
        if(this.ws===undefined||!(this.ws.readyState===this.ws.OPEN)){
            this.ws=this.initWSC();
        }else{
            this.ws.send(msg);
        }
    }

    initWSC(){
        this.maxReconnect--;
        if(this.maxReconnect<=0)
            return;
        // console.log("[WSC][on open]this.ss.maxReconnect=",this.maxReconnect);
        try {
            let ws=new WebSocket(this.connectInfo);
            ws.addEventListener("open",  (event) => {
                console.log("[WSC][on open]",event ,'orange');
            });
            ws.addEventListener("message", (event) => {
                this.last_MSG_FROM_WSS= event.data.toString();
                // setState({RAW_JSON: data})
                // setRX_JSON(this.last_MSG_FROM_WSS);
                // this.setRX_STR(this.last_MSG_FROM_WSS);
                // this.setRX_JSON(this.last_MSG_FROM_WSS);

                useStoreX.getState().setRX_JSON(this.last_MSG_FROM_WSS)
                // console.log(new Date(),"[RC][on_msg_from_WSS]",this.last_MSG_FROM_WSS,useStoreX.getState());
                // this.RX_STR=this.last_MSG_FROM_WSS;
                // this.setRX_JSON(this.last_MSG_FROM_WSS);//xlinx outside class compoment need getstate first.
                // useStoreX.setState({RX_STR:data});


            });
            ws.addEventListener("error", (event) => {
                console.log("[WSC][on error]",event ,'orange');
            });
            ws.addEventListener("close",function clear() {
                console.log("[WSC][on close]" );
                // clearTimeout(this.pingTimeout);
            });
            return ws;
        }catch (e) {

        }

    }


}
