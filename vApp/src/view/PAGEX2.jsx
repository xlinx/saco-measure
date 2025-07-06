import {
    Layout,

    Alert, Flex, Card, ConfigProvider, Breadcrumb, Divider, Button,

} from 'antd'

import {useEffect, useState} from 'react'

const {Content, Footer, Sider} = Layout

import Marquee from 'react-fast-marquee'
import * as React from "react";

import {HomeOutlined, UserOutlined} from "@ant-design/icons";
import Flmngr from "@flmngr/flmngr-react";


const StaticHTML = () => {
    const [showHighlight, setShowHighlight] = useState(false)
    useEffect(() => {
        setShowHighlight(!showHighlight)
    }, [])

    return (
        <>
            <Layout className={'mainLayout'}>
                <Content className="mainContent">

                    <Alert className='contentHeader'
                           banner
                           message={
                               <Marquee pauseOnHover speed={40} gradient={false} gradientColor={'#444'}>
                                   <p>Loading IP= ...(BOX狀態燈需為綠色；紅色鑒察IP與是否開機)</p>
                               </Marquee>
                           }
                    />
                    <Flex gap="middle" align="center" justify="center" vertical>
                        <Divider variant="dashed" style={{ borderColor: '#333'}} orientation="center" ></Divider>


                        <Card
                            hoverable
                            style={{
                                width: '95vw',
                            }}
                            // cover={<Image alt="example" src={sacoSvgLogo3} width="100px" />}
                        >
                            <Button
                                onClick={() => {
                                    // Flmngr.load({
                                    //     apiKey: "FLMN24RR1234123412341234",
                                    //     urlFileManager: 'http://'+window.location.hostname+':3128/fm', // demo server
                                    //     urlFiles: '/ftp',
                                    // }, {
                                    //     onFlmngrLoaded: () => {
                                    //     attachFileManager();
                                    // }
                                    // });
                                    // Flmngr.load({
                                    //     apiKey: "FLMN24RR1234123412341234",                  // default free key
                                    //     urlFileManager: 'http://127.0.0.1:3128/fm', // demo server
                                    //     urlFiles: 'http://localhost:3128/ftp/',
                                    // });
                                    Flmngr.open({
                                        apiKey: "wItxl0ctkVVg44EonzgNnMhP",
                                        urlFileManager: 'http://' + window.location.hostname + ':3128/fm', // demo server
                                        urlFiles: 'http://' + window.location.hostname + ':3128/ftp',
                                        isMultiple: false,                                   // let selecting a single file
                                        acceptExtensions: ["png", "jpg", "jpeg", "tif", "tiff", "webp"],
                                        onFinish: (files) => {
                                            console.log("User picked:");
                                            console.log(files);
                                        }
                                    });
                                }}
                            >
                                Open file manager
                            </Button>

                        </Card>


                        <Footer className="contentFooter">
                            saco-Measure | 2025
                        </Footer>
                    </Flex>
                </Content>
            </Layout>
        </>
    )
}
export default StaticHTML

