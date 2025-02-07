import {create} from "zustand";

export const alignOptions = Object.freeze({
    flexstart: 'flex-start',
    center: 'center',
    flexend: 'flex-end'
});

export const justifyOptions = Object.freeze({
    flexstart: 'flex-start',
    center: 'center',
    flexend: 'flex-end',
    spacebetween: 'space-between',
    spacearound: 'space-around',
    spaceevenly: 'space-evenly',
});
export const useStoreXMulti = (...items) => useMulti(useStoreX, ...items)

function useMulti(store, ...items) {
    return items.reduce((carry, item) => ({
        ...carry,
        [item]: store(state => state[item]),
    }), {})
}

export const useStoreX = create((set, get) => ({
    APP_IP: window.location.host.toString().split(':')[0],
    HOSTNAME:'localhost',
    APP_IPS:["0.0.0.0"],
    UDP_PORT:62202,
    TCP_PORT:62203,
    RX_TS: '',

    TX_JSON: {WHO: "WSC", CMD: "DECADE.TW",TS:''},
    RX_JSON:{},


}));
