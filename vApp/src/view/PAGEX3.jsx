import {
    Layout,

    Alert, Flex, Card, Image, theme, ConfigProvider, Space,

} from 'antd'

import  {useEffect, useState} from 'react'

const {Content, Footer, Sider} = Layout

import Marquee from 'react-fast-marquee'

import { FileManager } from "@cubone/react-file-manager";
import "@cubone/react-file-manager/dist/style.css";


import * as React from 'react';
const StaticHTML = () => {
    const [showHighlight, setShowHighlight] = useState(false)
    useEffect(() => {
        setShowHighlight(!showHighlight)
    }, [])
    useEffect(() => {
        const intervalId = setInterval(() => {  //assign interval to a variable to clear it.
            window.electron?.ipcRenderer.invoke('toMain',
                { WHO:'p3'}).then(
                (r) => {
                    console.log('[][P3][invoke][then]r=', r)
                    setFiles(r.dirTree_SacoMeasure.children)
                }
            )

        }, 1000)

        return () => clearInterval(intervalId); //This is important

    }, [ useState])
    const [files, setFiles] = useState([
        {
            name: "Input",
            isDirectory: true, // Folder
            path: "/Input", // Located in Root directory
            updatedAt: "2024-09-09T10:30:00Z", // Last updated time
        },
        {
            name: "Output",
            isDirectory: true, // Folder
            path: "/Output", // Located in Root directory
            updatedAt: "2024-09-09T10:30:00Z", // Last updated time
        },
        {
            name: "SatoTool",
            isDirectory: true, // Folder
            path: "/SatoTool", // Located in Root directory
            updatedAt: "2024-09-09T10:30:00Z", // Last updated time
        },
        {
            name: "Pictures",
            isDirectory: true,
            path: "/Pictures", // Located in Root directory as well
            updatedAt: "2024-09-09T11:00:00Z",
        },
        {
            name: "Pic.png",
            isDirectory: false, // File
            path: "/Pictures/Pic.png", // Located inside the "Pictures" folder
            updatedAt: "2024-09-08T16:45:00Z",
            size: 2048, // File size in bytes (example: 2 KB)
        },
    ]);

    const CustomImagePreviewer = ({ file }) => {
        return <img src={`${file.path}`} alt={file.name} />;
    };
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
                        <Card title={'Saco File Manager'} style={{width:'100%', height:'100%'}}>
                            <div className="control-section">
fff
                            </div>
                        </Card>
                        <Card title={'Saco File Manager'} style={{width:'100%', height:'100%'}}>
                            <ConfigProvider
                                theme={{
                                    token: {
                                        colorText: '#f00',
                                        colorPrimaryBg: '#111',
                                        colorTextBase: '#0f0',
                                        colorBgMask: '#0f0',
                                        background:'#00f',
                                    },
                                    components: {
                                        button: {
                                            background:'#00f',
                                            algorithm: false,
                                        },
                                        Button: {
                                            colorPrimary: '#00b96b',
                                            algorithm: false,
                                        },
                                        Input: {
                                            colorPrimary: '#eb2f96',
                                            algorithm: false,
                                        }
                                    },
                                }}
                            >
                                <Card style={{width:'100%', height:'100%'}}>
                                    <FileManager files={files}
                                                 // filePreviewComponent={(file) => <CustomImagePreviewer file={file} />}
                                    />
                                </Card>


                            </ConfigProvider>
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

