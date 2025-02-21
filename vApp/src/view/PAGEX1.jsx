/*
 * DECADE.TW(c) All Rights Reserved.
 */
import {
    Image,

    Space,
    Card,

    Divider,
    Radio,
    Layout,
    Breadcrumb,
    Menu,
    theme,
    ConfigProvider,
    Slider, Input, Row, Col,

} from 'antd';
import { HomeOutlined, UserOutlined } from '@ant-design/icons';

// import remote from '@electron/remote';
// const { BrowserWindow } = require('@electron/remote')

const { Search } = Input;
const { Header, Content, Footer } = Layout;
import sacoSvgLogo3 from '../assets/sacoSvgLogo3.svg'
import {AppOutline, StarFill, UnorderedListOutline,} from "antd-mobile-icons";
import {MenuUnfoldOutlined,AudioOutlined} from "@ant-design/icons";
// import Marquee from "react-fast-marquee";
import {UploadX} from "./UploadX.jsx";
import GalleryX from "./GalleryX.jsx";





const marks = {
    0: '0%',
    50: '50%',
    75: '75%',
    100: {
        style: {
            color: '#f50',
        },
        label: <strong>100%</strong>,
    },
};
const StaticHTML = () => {
    // const navigate = useNavigate();

    return (

            <Layout >
                <Header
                    style={{
                        display: 'flex',
                        width:"100%",
                        alignItems: 'center',
                    }}
                >
                    <Image src={sacoSvgLogo3} width="200px" className=" logo-spin react"/>


                </Header>

                <Content style={{  margin:'0px',padding: '20px' }}>

                    <Breadcrumb
                        style={{
                            margin: '16px 0',
                        }}
                        items={[
                            {
                                href: '',
                                title: <HomeOutlined />,
                            },
                            {
                                href: '',
                                title: (
                                    <>
                                        <UserOutlined />
                                        <span>Work</span>
                                    </>
                                ),
                            },
                            {
                                title: 'saco-greenPoly Feature',
                            },
                        ]}
                    />

                    <Card
                        hoverable
                        style={{
                            width: '95vw',
                        }}
                        // cover={<Image alt="example" src={sacoSvgLogo3} width="100px" />}
                    >
                        <Divider style={{borderColor: '#7cb305'}}  orientation="center" >Model Setting</Divider>

                        <Space>
                            <Radio.Group defaultValue="m" buttonStyle="solid">
                                <Radio.Button value="n" disabled>nano|5Mb</Radio.Button>
                                <Radio.Button value="s" disabled>small|30Mb</Radio.Button>
                                <Radio.Button value="m"         >Medium|70Mb</Radio.Button>
                                <Radio.Button value="l" disabled>Large|150Mb</Radio.Button>
                                <Radio.Button value="x" disabled>Xtra|350Mb</Radio.Button>
                            </Radio.Group>
                            <Search
                                addonBefore="Model Select"
                                placeholder=" (default: best.pt)"
                                enterButton="Switch Model"
                                size="large"
                                suffix={<AudioOutlined
                                    style={{
                                        fontSize: 1,
                                        color: '#1677ff',
                                    }}
                                />}
                                onSearch={
                                    (val) => {
                                        console.log('[][P1][onSearch]val=', val)
                                        // let indexMain=new remote.BrowserWindow({width:200})
                                        // indexMain.loadURL('http://localhost:3000/#/tab1')
                                        window.electron?.ipcRenderer.invoke('toMain',
                                            { case: 'handleFileOpen',value: val}).then(
                                            (r) => {
                                                console.log('[][P1][invoke][then]r=', r)
                                            }
                                        )
                                    }
                                }
                            />



                        </Space>
                        <Divider style={{borderColor: '#333'}} orientation="center" >Predict conferdence</Divider>
                        <Slider marks={marks} included={false} defaultValue={75} />
                        <Slider marks={marks} included={false} defaultValue={75} />
                        <Slider marks={marks} included={false} defaultValue={75} />
                        <Slider marks={marks} included={false} defaultValue={75} />
                    </Card>
                    <Divider variant="dashed" style={{ borderColor: '#333'}} orientation="center" ></Divider>
                    <Row gutter={16}>
                        <Col className="gutter-row" span={12}>
                            <Card>
                                <Divider style={{fontSize:'2em',borderColor: '#7cb305'}} >Input</Divider>
                                {/*<UploadX/>*/}
                                <GalleryX upload={true} folderName={'input'}/>
                            </Card>
                        </Col>
                        <Col className="gutter-row" span={12}>
                            <Card>
                                <Divider style={{fontSize:'2em',borderColor: '#7cb305'}} >output</Divider>
                                <GalleryX folderName={'output'}/>
                            </Card>
                        </Col>
                    </Row>
                    <Divider variant="dashed" style={{borderColor: '#333'}} orientation="center" ></Divider>
                    <Card>
                        <Divider style={{fontSize:'2em',borderColor: '#7cb305'}} >Processed</Divider>
                          <GalleryX folderName={'processed'}/>
                    </Card>
                    <Divider variant="dashed" style={{borderColor: '#333'}} orientation="center" ></Divider>
                    <Card>
                    <Divider style={{fontSize:'2em',borderColor: '#7cb305'}} >SotaTool</Divider>
                      <GalleryX folderName={'sota'}/>
                    </Card>
                    {/*<Divider style={{borderColor: '#7cb305'}} >WorkingPanel</Divider>*/}
                    {/*<Space direction="vertical" size={16}>*/}
                    {/*    <Card hoverable title="Input">*/}

                    {/*        <UploadX/>*/}
                    {/*    </Card>*/}
                    {/*    <Card hoverable title="Output">*/}

                    {/*        <UploadX/>*/}
                    {/*    </Card>*/}
                    {/*</Space>*/}

                </Content>
                <Footer
                    style={{
                        textAlign: 'center',
                    }}
                >
                    ionis.com  ©{new Date().toLocaleString()} |  http://decade.tw
                </Footer>
            </Layout>
        // <Layout>
        //
        //     <Content style={{ width:'100vw', padding: '0px' }}>
        //     <Flex wrap vertical gap="middle"
        //           justify={justifyOptions.center} align={alignOptions.center}
        //           style={{height: '100vh', border: '0px solid #f00', background: '#aaa'}}>
        //         {/*<div data-anchor="part-1" id="part-1" style={{boxSizing: 'border-box', height: '100vh', background: 'rgba(255,255,255,1)'}}>*/}
        //         <Flex justify={justifyOptions.center} align={alignOptions.center} vertical
        //               style={{border: '0px solid #40a9ff'}}>
        //             {/*<Image src={"https://decade.tw/logo.png"}/>*/}
        //
        //             <Space>
        //                 <div>
        //                     <a >
        //                         {/*<IconB.BanFill size={111} color={'#ff0000'} className="logo logo-spin react"/>*/}
        //                         <img src={sacoSvgLogo3} width="500px" className=" logo-spin react"/>
        //                     </a>
        //                 </div>
        //             </Space>
        //
        //             <span style={{fontSize: '22px'}}>saco Measure（App,iPad Version）</span>
        //             <span style={{fontSize: '30px'}}>saco Measure Center</span>
        //             <span style={{fontSize: '32px'}}></span>
        //             <span style={{fontSize: '32px'}}>saco | Measure</span>
        //             <span style={{fontSize: '22px'}}>saco｜Measure</span>
        //             <span style={{fontSize: '22px'}}>decade.tw</span>
        //             {/*<span style={{fontSize: '10px'}}>帝凱科技 ｜ decade.tw</span>*/}
        //             <span style={{fontSize: '10px'}}>{window.location.href}</span>
        //
        //         </Flex>
        //         {/*<TimeLineX/>*/}
        //         {/*</div>*/}
        //     </Flex>
        //     <FloatButton.BackTop visibilityHeight={0} description="進入控制畫面" shape="square"
        //         // onClick={() => navigate(useStoreX.getState().isMobileX ? "/app" : "/notfound")}
        //         // href={"#p1"}
        //                          onClick={() => navigate( "/app")}
        //                          icon={<ThunderboltOutlined style={{fontSize: '42px'}}/>}
        //                          style={{fontSize: '32px', bottom: 110, width:'20vw'}}/>
        //     </Content>
        // </Layout>
    )
}
export default StaticHTML;
