/*
 * DECADE.TW(c) All Rights Reserved.
 */
import {
    Image,
    Flex,
    Typography,
    FloatButton,
    Space,
    Card,
    Avatar,
    Divider,
    Timeline,
    Layout,
    Breadcrumb,
    Menu,
    theme,
    ConfigProvider,
    Alert,
    Tag,
    Button, Slider, Input,

} from 'antd';
const { Search } = Input;
const { Header, Content, Footer } = Layout;
import sacoSvgLogo3 from '../assets/sacoSvgLogo3.svg'
import {AppOutline, StarFill, UnorderedListOutline,} from "antd-mobile-icons";
import {MenuUnfoldOutlined,AudioOutlined} from "@ant-design/icons";
import Marquee from "react-fast-marquee";
import { createStyles } from 'antd-style';
import {UploadX} from "./UploadX.jsx";

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
const items2 = new Array(3).fill(null).map((_, index) => ({
    key: index + 1,
    label: `nav ${index + 1}`,
}));
const items = [
    {
        key: '/tab1',
        title: 'saco-greenPoly',
        label: 'saco-greenPoly',
        icon: <AppOutline />
    },
    {
        key: '/tab2',
        title: 'saco-blueTrend',
        label: 'saco-blueTrend',
        icon: <UnorderedListOutline />
    },
    {
        key: '/tab3',
        title: 'saco-redCalc',
        label: 'saco-redCalc',
        icon: <MenuUnfoldOutlined />
    },
    {
        key: '/tab4',
        title: 'App Setup',
        label: 'App Setup',
        icon: <StarFill />
    }
]

function AntDesignOutlined() {
    return null;
}
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
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const { Meta } = Card;
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
        <Layout style={{ height:'100vh', width:'100vw', margin:'0px',padding: '3px' }}>
            <Header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <Image src={sacoSvgLogo3} width="200px" className=" logo-spin react"/>
                <Menu
                    theme="dark"
                    mode="horizontal"
                    // defaultSelectedKeys={['/tab2']}
                    items={items}
                    style={{
                        flex: 1,
                        minWidth: 0,
                    }}
                />

            </Header>
            {/*<Alert className="contentHeader"*/}
            {/*       banner*/}
            {/*       message={*/}
            {/*           <Marquee pauseOnHover speed={90} gradient={false} gradientColor={'#444'}>*/}
            {/*               <Tag color="blue" style={{ fontSize: '14px' }}>*/}
            {/*                   AI_MODEL: v5i.medium*/}

            {/*               </Tag>*/}
            {/*               <Tag color="blue" style={{ fontSize: '14px' }}>*/}


            {/*               </Tag>*/}


            {/*           </Marquee>*/}
            {/*       }*/}
            {/*/>*/}
            <Content style={{  margin:'0px',padding: '30px' }}>

                <Breadcrumb
                    style={{
                        margin: '16px 0',
                    }}
                >
                    <Breadcrumb.Item>Home</Breadcrumb.Item>
                    <Breadcrumb.Item>Saco Control Center</Breadcrumb.Item>
                    <Breadcrumb.Item>Work1</Breadcrumb.Item>
                </Breadcrumb>
                <Card
                    hoverable
                    style={{
                        width: '95vw',
                    }}
                    // cover={<Image alt="example" src={sacoSvgLogo3} width="100px" />}
                >
                    <Space>
                    <Search
                        addonBefore="Trained ai-Model Select"
                        placeholder=" (default: best.pt)"
                        enterButton="Switch AI Model"
                        size="large"
                        suffix={<AudioOutlined
                            style={{
                                fontSize: 1,
                                color: '#1677ff',
                            }}
                        />}
                        onSearch={(value, _e, info) => console.log(info?.source, value)}
                    />
                    <Button type="primary" size="large" icon={<AntDesignOutlined />}>
                        [AI] Select saco Image
                    </Button>

                    </Space>
                    <Divider style={{borderColor: '#333'}} orientation="center" >Predict conferdence</Divider>
                    <Slider marks={marks} included={false} defaultValue={75} />
                    <Slider marks={marks} included={false} defaultValue={75} />
                    <Slider marks={marks} included={false} defaultValue={75} />
                    <Slider marks={marks} included={false} defaultValue={75} />
                    <Divider style={{borderColor: '#333'}} orientation="center" >Model Status</Divider>
                    <Meta title="Model Status" description="model size:86MB" />
                </Card>
                <Divider style={{borderColor: '#7cb305'}} >WorkingPanel</Divider>
                <Space direction="vertical" size={16}>
                    <Card hoverable title="Input">

                        <UploadX/>
                    </Card>
                    <Card hoverable title="Output">

                        <UploadX/>
                    </Card>
                </Space>

            </Content>
            <Footer
                style={{
                    textAlign: 'center',
                }}
            >
                ionis.com  ©{new Date().toLocaleString()} |  http://decade.tw
            </Footer>
        </Layout>
        </ConfigProvider>
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
