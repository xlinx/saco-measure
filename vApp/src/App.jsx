
import './App.css'
import { InferenceEngine } from "inferencejs";

import './App.css'
import {
    Breadcrumb,
    Col,
    ConfigProvider,
    Divider,
    Flex,
    Layout,
    Menu,
    QRCode,
    Row,
    Space,
    Tabs,
    Tag,
    theme
} from 'antd'
// import p5 from 'p5'
import { alignOptions, justifyOptions, useStoreX } from './model/StoreX.jsx'
import {
    AppOutline, HeartOutline,
    MessageOutline,
    MoreOutline,
    SearchOutline, StarFill,
    UnorderedListOutline,
    UserOutline
} from 'antd-mobile-icons'
import PAGEX1 from './view/PAGEX1.jsx'
import PAGEX2 from './view/PAGEX2.jsx'
import PAGEX3 from './view/PAGEX3.jsx'
import PAGEX4 from './view/PAGEX4.jsx'
import { WebsocketClientR } from './model/WebsocketClientR.js'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AlertFilled, LeftOutlined, MenuUnfoldOutlined, SwapOutlined } from '@ant-design/icons'
import {Content, Header} from "antd/es/layout/layout.js";

// const inferEngine = new InferenceEngine();
// const workerId = await inferEngine.startWorker(
//     "sacomeasure/3",
//     "v3",
//     "rf_DLCJVk5y9DOuBZefmaw6dEDRcc93");
const tabs = [
    {
        key: '/tab1',
        title: '自定義拼接',
        label: '自定義拼接',
        icon: <AppOutline />
    },
    {
        key: '/tab2',
        title: '視訊盒快速參數',
        label: '視訊盒快速參數',
        icon: <UnorderedListOutline />
    },
    {
        key: '/tab3',
        title: '視訊盒設定',
        label: '視訊盒設定',
        icon: <MenuUnfoldOutlined />
    },
    {
        key: '/tab4',
        title: '程式設定',
        label: '程式設定',
        icon: <StarFill />
    }
]

function BoardX(InitPageID) {
    // console.log("[App][BoardX][useStoreX.getState()]",InitPageID);
    // const pageID = useStoreX((state) => state.pageID);

    switch (InitPageID) {
        case tabs[0].key:
            return (<PAGEX1 />)
        case tabs[1].key:
            return (<PAGEX2 />)
        case tabs[2].key:
            return (<PAGEX3 />)
        case tabs[3].key:
            return (<PAGEX4 />)
    }
}


export let websocketClientR = undefined

function App() {
  const [count, setCount] = useState(0)
    const image = document.getElementById("image"); // get image element with id `image`
    // const predictions = await inferEngine.infer(workerId, image); // infer on image
    const [InitPageID, setInitPageID] = useState('/tab1')
    // const {RX_STR,TX_JSON,TX_STR,setRX_STR,setRX_JSON} = useStoreXMulti('RX_STR','TX_JSON','TX_STR','setRX_STR','setRX_JSON');
    const { APP_IP, BOX_IP,RX_TS, BOX_TS, TX_JSON, RX_JSON, setRX_STR, setRX_JSON } = useStoreX()
    let WSS_ID_RANDOM = new Date().toISOString()

    const [showHighlight, setShowHighlight] = useState(false)
    const [showHighlight2, setShowHighlight2] = useState(false)
    useEffect(() => {
        // console.log('[][useEffect][RX_TS]',RX_TS)

        setShowHighlight(!showHighlight)

    }, [RX_TS])
    useEffect(() => {
        // console.log('[][useEffect][BOX_TS]',BOX_TS)
        setShowHighlight2(!showHighlight2)
    }, [BOX_TS])
    useEffect(() => {
        const ws_timer1000 = setInterval(() => {
            if (websocketClientR === undefined) {
                WSS_ID_RANDOM = 'DECADE.TW_WSC_' + WSS_ID_RANDOM
                websocketClientR = new WebsocketClientR(setRX_STR, setRX_JSON)
                console.log('websocketClientR:::', websocketClientR.wss_server)
            } else {
                // const {password, allowIP} = useStoreX();
                TX_JSON.TS = new Date().toLocaleString('en-GB')
                let txx = JSON.stringify(TX_JSON)
                websocketClientR.sendMsgX(txx)
            }

        }, 1000)
        return () => {
            clearInterval(ws_timer1000)
        }
    }, [])
    const HeaderLeft = () => {
        return (
            <div><LeftOutlined /></div>
        )
    }
    const HeaderCenter = () => {
        return (
            <span style={{ fontWeight: 'bold', fontSize: '20px', padding: '0px', margin: '0px' }}>
                saco measure center
            </span>
        )
    }

    const HeaderRight = (s1,s2) => {

        return (<>
                <Flex gap="3px" align="flex-start" justify="flex-start" vertical
                      style={{ margin: '10px 10px 0 0', padding: '0px 10px 0 0', alignItems: 'right' }}
                >
                    <Tag color="blue" style={{ fontSize: '14px' }}>
                        <AlertFilled style={{
                            animation: s1 ? 'specialFade 2s forwards ease' : 'specialFadeRed 4s forwards ease'

                        }} />
                        &nbsp; App
                        <SwapOutlined style={{
                            // "-webkit-transform": scale(-1,1),
                            transform: s1 ? 'scale(-1,1)' : 'scale(1,1)',
                            color: s1 ? '#fff' : '#fff'
                        }} />
                        &nbsp;{APP_IP}&nbsp;|&nbsp;{RX_TS}
                    </Tag>
                    <Tag color="blue" style={{ fontSize: '14px' }}>
                        <AlertFilled style={{
                            animation: s2 ? 'specialFade 2s forwards ease' : 'specialFadeRed 4s forwards ease'
                        }} />
                        &nbsp; Box
                        <SwapOutlined style={{
                            // "-webkit-transform": scale(-1,1),
                            transform: s2 ? 'scale(-1,1)' : 'scale(1,1)',
                            color: s2 ? '#fff' : '#fff'

                        }} />
                        &nbsp;{BOX_IP}&nbsp;|&nbsp;{BOX_TS}

                    </Tag>
                </Flex>
            </>
        )
    }
    return (

        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm
                // algorithm: theme.defaultAlgorithm
                // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
            }}
        >
            <Layout
                style={{
                    width:'100vw',
                    //     // overflow: 'hidden',
                    //      width: 'calc(100% )',
                    //     // height: 'calc(100% )',
                    //     // maxWidth: 'calc(100vw - 8px)',
                }}
            >
                <Header id="app_header" className="appHeader">
                    <Row>
                        <Col span={7}> {HeaderLeft()}</Col>
                        <Col span={10}>{HeaderCenter()}</Col>
                        <Col span={7}>
                            {/*<HeaderRight s1={showHighlight} s2={showHighlight2}/>*/}
                            {HeaderRight(showHighlight,showHighlight2)}
                        </Col>

                    </Row>
                </Header>
                <Content id="app_content" style={{
                    // top: '48px',
                    // height: '100vh',
                    // width: '100vw',
                    position: 'relative'
                    // textAlign: 'center',
                    // minHeight: '100%',
                    // border: '10px solid #f00',
                    // lineHeight: '120px',
                    // color: '#fff',
                    // backgroundColor: '#eee',
                }}>
aaa
                    {/*<BoardX InitPageID={InitPageID} />*/}
                </Content>
                {/*<Footer >*/}
                <Tabs
                    // className={'bottomMenu'}
                    style={{
                        // display: 'flex',
                        // position: 'sticky',
                        position: 'fixed',
                        // zIndex: 1,
                        width: '100%',
                        // alignItems: 'center',
                        left: 0,
                        // height: '50px',
                        bottom: 0,
                        // top:0,
                        // borderTop: '1px solid #555',
                        /*z-index: 5;*/
                        background: '#111'
                        /*text-align: center;*/

                    }}
                    defaultActiveKey = {InitPageID}
                    tabBarGutter={88}
                    centered={true}
                    size={'large'}
                    type={'line'}
                    indicator={'center'}
                    items={tabs}
                    tabPosition={'bottom'}
                    // safeArea={true}
                    onChange={(e) => {
                        setInitPageID(e)
                    }
                    }>
                    {/*{tabs.map(item => (*/}
                    {/*    <TabBar.Item key={item.key} icon={item.icon} title={item.title}/>*/}
                    {/*))}*/}
                </Tabs>
                {/*</Footer>*/}
            </Layout>
        </ConfigProvider>
    )
}

export default App
