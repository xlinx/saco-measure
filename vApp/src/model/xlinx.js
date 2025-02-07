import {useStoreX} from "./StoreX.jsx";
// import * as iconB from 'react-bootstrap-icons';
//
//
//
// export const IconB = ({ iconName='', ...props }) => {
//   const BootstrapIcon = iconB[iconName];
//   return <BootstrapIcon {...props} />;
// }
export function xprint(msg1, obj, color,printOnce) {
  // let caller = arguments.callee.caller.name;
  // let whoCall=xprint.caller;
  //return;
  if(msg1.startsWith("[DEBUG]",0)&&!printOnce)
    return;
  color = color || "black";
  let bgc = "#777799";
  switch (color) {

    case "green": case "success":  color = "Green";      bgc = "LimeGreen";       break;
    case "info":     color = "Red";        bgc = "Turquoise";       break;
    case "red": case "error":    color = "Red";        bgc = "Black";           break;
    case "start":    color = "OliveDrab";  bgc = "PaleGreen";       break;
    case "warning":  color = "Tomato";     bgc = "Black";           break;
    case "end":      color = "Orchid";     bgc = "MediumVioletRed"; break;
    default: color ;
  }


  console.log("%c=START="  +" => "+ msg1, "color:" + color + ";font-weight:bold; background-color: " + bgc + ";");
  // if (typeof msg2 == "object") {
  // console.log("caller",whoCall);
  console.log(obj);
  // }
  console.log("%c=END="  +" => "+ msg1, "color:" + color + ";font-weight:bold; background-color: " + bgc + ";");

  // return obj;
}

// global.speakXsys = (msg) => {
//
//     u.lang = 'zh-TW';
//     u.text = msg;
//     synth.speak(u);
// };
let synth = window.speechSynthesis;
export const speakX = (msg) => {
  console.log("[VOICE]",msg);
  // const {VictoriaVOICE,setVictoriaVOICE}=useStoreX();

  if(!useStoreX.getState().VictoriaVOICE)
    return;
  let u = new SpeechSynthesisUtterance();
  //u.lang = 'zh-TW'; //這句絕對不要用
  u.text = msg;

  let voices = synth.getVoices();

  for(let index = 0; index < voices.length; index++) {
    /*
    "Google US English"
    "Google 日本語"
    "Google 普通话（中国大陆）"
    "Google 粤語（香港）"
    "Google 國語（臺灣）"
    */

    //console.log(voices[index].name);
    if(voices[index].name == "Microsoft HsiaoChen Online (Natural) - Chinese (Taiwan)"){ //HsiaoChen (Neural) - 曉臻 (MS Edge專用)
      u.voice = voices[index];
      break;
    }else if(voices[index].name == "Google 國語（臺灣）"){ //Chrome專用
      u.voice = voices[index];
      break;
    }else{
      //u.lang = 'zh-TW'; //這邊可能會有語音又被切回系統語音的問題
    }

    //當最後一個都還沒找到時才設u.lang
    if(index+1 === voices.length){
      u.lang = 'zh-TW';
    }
  }

  synth.speak(u);
};


export function nextModeX(m_now, all_models, nxt_pre=true) {
  let r={};
  if(!Array.isArray(all_models)){
    let keys=Object.keys(all_models);
    let nowIndex=keys.findIndex((e) => {return all_models[e].name===m_now.name});
    let nextIndex=0;
    if(nxt_pre)
      nextIndex=(nowIndex+1)%keys.length;
    else
      nextIndex=(nowIndex-1)<0?keys.length-1:(nowIndex-1);

    console.log("[switchANYMode][nowIndex=]",nowIndex,nextIndex);
    r=Reflect.get(all_models, keys[nextIndex]);

  }else{
    let length=all_models.length;
    r=all_models[0];
    for (let i=0;i<length;i++){
      if(JSON.stringify(all_models[i]) === JSON.stringify(m_now)){
        let nextIndex;
        if(nxt_pre)
          nextIndex=(i+1)%length;
        else{
          nextIndex=(i-1)<0?length-1:(i-1);
        }
        console.log("obj nextIndex",nextIndex,all_models[nextIndex]);
        r=all_models[nextIndex];
        break;
      }
    }
  }
  return r;
}
export function MODE_goto(all_models,mode_string) {
  let total=Object.keys(all_models).length;
  let result=undefined;
  Object.entries(all_models).forEach(([key, value]) => {
    if(key===mode_string){
      result=Reflect.get(all_models, key);
    }
  });
  return result;
}