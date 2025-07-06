
import './App.css'

import './App.css'
import {
    Col,
    ConfigProvider, Image,
    Layout,
    Row,
    Tabs,
    Tag,
    theme
} from 'antd'
import {  useStoreX } from './model/StoreX.jsx'
import {
    AppOutline,  StarFill,
    UnorderedListOutline,
} from 'antd-mobile-icons'
import PAGEX1 from './view/PAGEX1.jsx'
import PAGEX2 from './view/PAGEX2.jsx'
import PAGEX3 from './view/PAGEX3.jsx'
import PAGEX4 from './view/PAGEX4.jsx'
// import { WebsocketClientR } from './model/WebsocketClientR.js'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AlertFilled, LeftOutlined, MenuUnfoldOutlined, SwapOutlined } from '@ant-design/icons'
const { Header, Content, Footer } = Layout;

import { createStyles } from 'antd-style';
import sacoSvgLogo3 from "./assets/sacoSvgLogo3.svg";

const useStyle = createStyles(({ prefixCls, css }) => ({
    linearGradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
      > span {
        position: relative;
      }

      &::before {
        content: '';
        background: linear-gradient(135deg, #6253e1, #04befe);
        position: absolute;
        inset: -1px;
        opacity: 1;
        transition: all 0.3s;
        border-radius: inherit;
      }

      &:hover::before {
        opacity: 0;
      }
    }
  `,
}));
const tabs = [
    {
        key: '/tab1',
        title: 'predict & measure',
        label: 'predict & measure',
        icon: <AppOutline />
    },
    {
        key: '/tab2',
        title: 'sarco-setting',
        label: 'sarco-setting',
        icon: <UnorderedListOutline />
    },
    {
        key: '/tab3',
        title: 'model-setting',
        label: 'model-setting',
        icon: <MenuUnfoldOutlined />
    },
    {
        key: '/tab4',
        title: 'App Setup',
        label: 'App Setup',
        icon: <StarFill />
    }
]

function BoardX(prop) {
    // console.log("[App][BoardX][useStoreX.getState()]",InitPageID);
    // const pageID = useStoreX((state) => state.pageID);

    switch (prop.whichid) {
        case tabs[0].key:
            return (<PAGEX1/>)
        case tabs[1].key:
            return (<PAGEX2/>)
        case tabs[2].key:
            return (<PAGEX3/>)
        case tabs[3].key:
            return (<PAGEX4/>)
    }
}


export let websocketClientR = undefined

function App() {

    const [InitPageID, setInitPageID] = useState('/tab1')
    // const {RX_STR,TX_JSON,TX_STR,setRX_STR,setRX_JSON} = useStoreXMulti('RX_STR','TX_JSON','TX_STR','setRX_STR','setRX_JSON');
    const { APP_IP, RX_TS, BOX_TS, } = useStoreX()

    const [showHighlight, setShowHighlight] = useState(false)
    const [showHighlight2, setShowHighlight2] = useState(false)
    useEffect(() => {
        // console.log('[][useEffect][RX_TS]',RX_TS)

        setShowHighlight(!showHighlight)

    }, [RX_TS ])
    useEffect(() => {
        // console.log('[][useEffect][BOX_TS]',BOX_TS)
        setShowHighlight2(!showHighlight2)
    }, [BOX_TS])

    const HeaderLeft = () => {
        return (
            <Image src={sacoSvgLogo3} height={'200px'} style={{padding:'-0px'}} className=" logo-spin "/>
        )
    }
    const HeaderCenter = () => {
        return (
            <span style={{ fontWeight: 'bold', fontSize: '20px', padding: '0px', margin: '0px' }}>
                Sarco Measure Center
            </span>
        )
    }

    const HeaderRight = (s1) => {

        return (<>

                    <Tag color="blue" style={{ fontSize: '14px' }}>
                        <AlertFilled style={{
                            animation: s1 ? 'specialFade 2s forwards ease' : 'specialFadeRed 4s forwards ease'

                        }} />
                        &nbsp; AI.Model.Server.info
                        <SwapOutlined style={{
                            // "-webkit-transform": scale(-1,1),
                            transform: s1 ? 'scale(-1,1)' : 'scale(1,1)',
                            color: s1 ? '#fff' : '#fff'
                        }} />
                        &nbsp;{APP_IP}&nbsp;|&nbsp;{RX_TS}
                    </Tag>

            </>
        )
    }
    const { styles } = useStyle();
    return (

        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm
                // algorithm: theme.defaultAlgorithm
                // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
            }}
            button={{
                className: styles.linearGradientButton,
            }}
        >
            <Layout >
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
                    height: '99vh',
                    width: '99vw',
                    position: 'relative'
                    // textAlign: 'center',
                    // minHeight: '100%',
                    // border: '10px solid #f00',
                    // lineHeight: '120px',
                    // color: '#fff',
                    // backgroundColor: '#eee',
                }}>
                    {/*<PAGEX1 />*/}
                    <BoardX whichid={InitPageID} />
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
                </Tabs>
                {/*</Footer>*/}
            </Layout>
        </ConfigProvider>
    )
}

export default App
