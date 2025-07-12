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
    Slider, Input, Row, Col, Timeline, Tag,

} from 'antd';
import {ClockCircleOutlined, HomeOutlined, UserOutlined} from '@ant-design/icons';

// import remote from '@electron/remote';
// const { BrowserWindow } = require('@electron/remote')

const { Search } = Input;
const { Header, Content, Footer } = Layout;
import sacoSvgLogo3 from '../assets/sacoSvgLogo3.svg'
import {AppOutline, StarFill, UnorderedListOutline,} from "antd-mobile-icons";
import {MenuUnfoldOutlined,AudioOutlined} from "@ant-design/icons";
// import Marquee from "react-fast-marquee";
// import {UploadX} from "./UploadX.jsx";
import GalleryX from "./GalleryX.jsx";
import {useStoreX} from "../model/StoreX.jsx";






const StaticHTML = () => {
    // const navigate = useNavigate();
    const { user } = useStoreX()
    console.log('JWTuser',user)
    return (
            <Layout >
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
                                    <Tag color={'warning'} icon={<UserOutlined />}>

                                        {user.name?<span>{user.name}</span>:<span>ViewOnly</span>}
                                    </Tag>
                                ),
                            },
                            {
                                title: 'saco-greenPoly Feature',
                            },
                        ]}
                    />


                    <Divider variant="dashed" style={{ borderColor: '#333'}} orientation="center" ></Divider>

                    <Row gutter={16}>
                        <Col className="gutter-row" span={12}>
                            <Card>
                                <Divider style={{fontSize:'1.5em',borderColor: '#7cb305'}} >Upload</Divider>
                                {/*<UploadX/>*/}
                                <GalleryX upload={true} folderName={'upload'}/>
                            </Card>
                        </Col>
                        <Col className="gutter-row" span={12}>
                            <Card>
                                <Divider style={{fontSize:'1.5em',borderColor: '#7cb305'}} >Input</Divider>
                                <GalleryX folderName={'input'}/>
                            </Card>
                        </Col>
                    </Row>
                    <Divider variant="dashed" style={{borderColor: '#333'}} orientation="center" ></Divider>
                    <Card>

                        <Divider style={{fontSize:'2em',borderColor: '#7cb305'}} >Processing </Divider>

                        <GalleryX folderName={'processed'}/>


                    </Card>
                    <Divider variant="dashed" style={{borderColor: '#333'}} orientation="center" ></Divider>
                    {/*<Card>*/}
                    {/*    <Divider style={{fontSize:'2em',borderColor: '#7cb305'}} >CSV Preview</Divider>*/}
                    {/*    <GalleryX folderName={'output'} filter={'csv'}/>*/}
                    {/*</Card>*/}
                    <Divider variant="dashed" style={{borderColor: '#333'}} orientation="center" ></Divider>
                    <Card>
                        <Divider style={{fontSize:'2em',borderColor: '#7cb305'}} >Output (Image|CSV)</Divider>
                          <GalleryX folderName={'output'}/>
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
