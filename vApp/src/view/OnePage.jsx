/*
 * DECADE.TW(c) All Rights Reserved.
 */
import {
    Image, Flex,
    Typography,
    FloatButton, Space, Card, Avatar, Divider, Timeline,

} from 'antd';
import {
    ThunderboltOutlined,ClockCircleOutlined
} from '@ant-design/icons';
import {useNavigate} from "react-router-dom";
import {alignOptions, justifyOptions} from "../model/StoreX.jsx";
import Meta from "antd/es/card/Meta.js";
import sacoSvgLogo from '../assets/sacoSvgLogo.svg'
import sacoSvgLogo3 from '../assets/sacoSvgLogo3.svg'
import * as IconB from 'react-bootstrap-icons';


const TimeLineX = () => {

    return (
        <Flex wrap vertical gap="middle"
              justify={justifyOptions.spacebetween} align={alignOptions.flexend}
              style={{ border: '0px solid #f00', background: '#ccc'}}
        >
            <Meta
                title="IPAD 版本" style={{textAlign:"center"}}
                description={
                    <>
                        <Divider></Divider>
                        <Timeline
                            mode={'right'}
                            pending="等待中..."
                            items={[
                                {
                                    label: '2020-09-01',
                                    children: '連線1'
                            },
                                {

                                    color: 'red',
                                    label: '2024-05-01 09:12:11',
                                    children: `連線2`,
                                },
                                {

                                    color: 'green',
                                    label: '2024-05-01 09:12:11',
                                    children: `連線2`,
                                },
                                {
                                    color: 'green',
                                    label: '2024-07-23 05:55:00',
                                    children: `連線版本（2024-07-23 05:55:00）`,
                                },


                            ]}
                        />
                    </>
                }
            />

        </Flex>)
};

const StaticHTML = () => {
    const navigate = useNavigate();

    return (
        <>
            <Flex wrap vertical gap="middle"

                  justify={justifyOptions.center} align={alignOptions.center}
                  style={{height: '100vh', border: '1px solid #f00', background: '#aaa'}}>
                {/*<div data-anchor="part-1" id="part-1" style={{boxSizing: 'border-box', height: '100vh', background: 'rgba(255,255,255,1)'}}>*/}
                <Flex justify={justifyOptions.center} align={alignOptions.center} vertical
                      style={{border: '0px solid #40a9ff'}}>
                    {/*<Image src={"https://decade.tw/logo.png"}/>*/}

                    <Space>

                        <div>
                            {/*<a href="https://decade.tw" target="_blank">*/}
                            {/*    /!*<IconB.BanFill size={111} color={'#ff0000'} className="logo logo-spin react"/>*!/*/}
                            {/*    <img src={sacoSvgLogo} width="500px" />*/}
                            {/*</a>*/}
                            <a >
                                {/*<IconB.BanFill size={111} color={'#ff0000'} className="logo logo-spin react"/>*/}
                                <img src={sacoSvgLogo3} width="500px" className=" logo-spin react"/>
                            </a>
                            {/*<a href="https://decade.tw" target="_blank">*/}
                            {/*    <img src={reactLogo} className="logo logo-spin react" />*/}
                            {/*</a>*/}
                            {/*<a href="https://decade.tw" target="_blank">*/}
                            {/*    <IconB.BandaidFill*/}
                            {/*        iconName="Stopwatch"*/}
                            {/*        color="royalblue"*/}
                            {/*        size={96}*/}

                            {/*    />*/}
                            {/*</a>*/}
                        </div>
                        {/*<ArrowRight color="royalblue" size={96} />*/}
                        {/*<i className="bi-bandaid-fill"></i>*/}
                    </Space>

                    <span style={{fontSize: '22px'}}>saco Measure（App,iPad Version）</span>

                    <span style={{fontSize: '30px'}}>saco Measure Center</span>
                    <span style={{fontSize: '32px'}}></span>
                    <span style={{fontSize: '32px'}}>saco | Measure</span>
                    <span style={{fontSize: '22px'}}>saco｜Measure</span>
                    <span style={{fontSize: '22px'}}>decade.tw</span>
                    {/*<span style={{fontSize: '10px'}}>帝凱科技 ｜ decade.tw</span>*/}
                    <span style={{fontSize: '10px'}}>{window.location.href}</span>

                </Flex>
                {/*<TimeLineX/>*/}
                {/*</div>*/}
            </Flex>
            <FloatButton.BackTop visibilityHeight={0} description="進入控制畫面" shape="square"
                // onClick={() => navigate(useStoreX.getState().isMobileX ? "/app" : "/notfound")}
                // href={"#p1"}
                                 onClick={() => navigate( "/app")}
                                 icon={<ThunderboltOutlined style={{fontSize: '42px'}}/>}
                                 style={{fontSize: '32px', bottom: 110, width:'20vw'}}/>
        </>
    )
}
export default StaticHTML;
