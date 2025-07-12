
import './App.css'

import './App.css'
import {
    Button,
    Col,
    ConfigProvider, Flex, Image,
    Layout,
    Row, Space,
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
import {
    AlertFilled, FolderViewOutlined,
    FormOutlined, FundViewOutlined,
    LeftOutlined,
    MenuUnfoldOutlined,
    SwapOutlined, SyncOutlined,
    UserOutlined
} from '@ant-design/icons'
const { Header, Content, Footer } = Layout;

import { createStyles } from 'antd-style';
import sacoSvgLogo3 from "./assets/sacoSvgLogo3.svg";
// import { OAuth2Client } from 'google-auth-library';
import { jwtDecode } from "jwt-decode";
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
    const hostname = window.location.hostname;
    let expressUrl = window.location.protocol+"//"+hostname+(hostname.startsWith('192')||hostname.startsWith('local')?":7777":"");
    let expressHttpUrl = expressUrl;

    const google_oauth_client_id='977804593988-4kuovtd6l3s88ba2srcia3q8ok3cafqk.apps.googleusercontent.com';
    // const client = new OAuth2Client(google_oauth_client_id);
    const [InitPageID, setInitPageID] = useState('/tab1')
    // const {RX_STR,TX_JSON,TX_STR,setRX_STR,setRX_JSON} = useStoreXMulti('RX_STR','TX_JSON','TX_STR','setRX_STR','setRX_JSON');
    const { user, setUser, RX_TS, BOX_TS, } = useStoreX()
    // const [user, setUser] = useState(null);
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

    const googleButtonRef = useRef(null);

    useEffect(() => {
         function renderGoogleButton() {
        if (window.google && googleButtonRef.current) {
            window.google.accounts.id.initialize({
                client_id: google_oauth_client_id,
                callback: handleCredentialResponse,
            });
            window.google.accounts.id.renderButton(
                googleButtonRef.current,
                {
                    type: 'standard',
                    theme: 'filled_black',
                    size: 'medium',
                    shape: 'pill',
                    logo_alignment: 'left',
                    text: 'signin'
                }
            );
        }
    }

    // Try immediately
    renderGoogleButton();

    // If not loaded, poll until available
    const interval = setInterval(() => {
        // if (window.google && googleButtonRef.current) {
        //     renderGoogleButton();
        //     clearInterval(interval);
        // }
    }, 5000);

    // Cleanup
    return () => clearInterval(interval);
    }, []);



    useEffect(() => {
        const token = localStorage.getItem('google_id_token');
        if (token) {
            setUser(jwtDecode(token));
        }
    }, []);

    function handleCredentialResponse(response) {
        localStorage.setItem('google_id_token', response.credential);
        setUser(jwtDecode(response.credential));
    }

    const HeaderLeft = () => {
        return (<>

                <Image
                style={{maxHeight: '200px',minHeight:'140px'}}
                    src={(sacoSvgLogo3)} className=" logo-spin "/>
            </>

        )
    }
    const HeaderCenter = () => {
        return (
            <div style={{display:'inline',width:'100%', fontWeight: 'bold', fontSize: '2em', padding: '0px', margin: '0px' }}>
                Sarco Measure Center v.0710

            </div>
        )
    }

    const HeaderRight = (s1) => {

        return (<Flex gap="3px" align="flex-start" justify="flex-start" vertical
                      style={{ margin: '10px 10px 0 0', padding: '0px 10px 0 0', alignItems: 'right' }}
            >

                    <Tag color="blue" style={{ fontSize: '1em' }}>
                        <AlertFilled style={{
                            animation: s1 ? 'specialFade 2s forwards ease' : 'specialFadeRed 4s forwards ease'

                        }} />
                        &nbsp; httpService/AI
                        <SwapOutlined style={{
                            // "-webkit-transform": scale(-1,1),
                            transform: s1 ? 'scale(-1,1)' : 'scale(1,1)',
                            color: s1 ? '#fff' : '#fff'
                        }} />
                        &nbsp;{RX_TS.replaceAll('2025-','')}
                    </Tag>
                <Tag color="blue" style={{ fontSize: '1em' }}>
                    <AlertFilled style={{
                        animation: s1 ? 'specialFade 2s forwards ease' : 'specialFadeRed 4s forwards ease'

                    }} />
                    &nbsp; python/AI
                    <SwapOutlined style={{
                        // "-webkit-transform": scale(-1,1),
                        transform: s1 ? 'scale(-1,1)' : 'scale(1,1)',
                        color: s1 ? '#fff' : '#fff'
                    }} />
                    &nbsp;{RX_TS.replaceAll('2025-','')}
                </Tag>

            </Flex>
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
                <Header id="app_header" className="appHeader"
                        style={{width:'100vw'}}
                >
                    <Flex justify={'space-between'}
                          align={'flex-start'}
                          gap={'10px'} >
                        <div > {HeaderLeft()}</div>


                        <div >{HeaderCenter()}</div>



                        {/*<div >*/}
                        {/*    {user?(<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>*/}
                        {/*        <img src={user.picture} style={{ margin: '8px', height: '50px', borderRadius: '50%' }} alt="user" />*/}
                        {/*    </div>):(<Tag>ViewOnly</Tag>)}*/}
                        {/*</div>*/}
                        <div>
                            {HeaderRight(showHighlight,showHighlight2)}
                        </div>

                        <div>
                            {user?(
                                <>
                                <Tag color={'warning'} icon={<UserOutlined />}>
                                    <span>{user.name}</span>
                                </Tag>
                                    <Tag color={'warning'} icon={<UserOutlined />}>
                                        <span>{user.email}</span>
                                    </Tag>
                                <Tag color={'success'} icon={<SyncOutlined spin />}>
                                    read-write
                                </Tag>
                                    <Button size="small" type="primary" onClick={() => {
                                localStorage.removeItem('google_id_token');
                                setUser(null);
                                window.location.reload();
                            }}>
                                Logout
                            </Button></>):
                                (<Space>
                                    <Tag style={{fontSize:'1.2em'}} color={'default'} icon={<FolderViewOutlined />} >
                                        view-only
                                    </Tag>

                                    <div style={{display: `${user}? 'none' : ''`,margin:'1em',colorScheme: 'light'}}
                                             ref={googleButtonRef}
                            /></Space>)}
                        </div>



                    </Flex>
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
