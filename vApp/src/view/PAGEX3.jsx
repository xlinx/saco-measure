import {
    Layout,
    Alert, Flex, Card, ConfigProvider, Space, Button, Divider,
    Radio,
    Slider, Input, Image, Breadcrumb,

} from 'antd';
import {HomeOutlined, UserOutlined} from '@ant-design/icons';
import {useEffect, useState} from 'react'


import Marquee from 'react-fast-marquee'
import {MenuUnfoldOutlined, AudioOutlined} from "@ant-design/icons";
// import { FileManager } from "@cubone/react-file-manager";
// import "@cubone/react-file-manager/dist/style.css";
import Flmngr from "@flmngr/flmngr-react";
import * as React from "react";

const {Search} = Input;
const {Content, Footer, Sider} = Layout
import GalleryX from "./GalleryX.jsx";
import sacoSvgLogo3 from "../assets/sacoSvgLogo3.svg";
import {Header} from "antd/es/layout/layout.js";

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
// import Flmngr from "flmngr";
// import Flmngr from "https://cdn.skypack.dev/flmngr";
function attachFileManager() {
    let elLoading = document.getElementsByClassName("loading-full-screen")[0];
    elLoading.parentElement.removeChild(elLoading);

    Flmngr.open({
        isMultiple: false,                                   // let selecting a single file
        acceptExtensions: ["png", "jpg", "jpeg", "gif", "webp"],
        onFinish: (files) => {
            console.log("User picked:");
            console.log(files);
        },
        // isMultiple: null,
        isMaximized: true,
        showCloseButton: false,
        showMaximizeButton: false,
        hideFiles: [
            "index.php",
            ".htaccess",
            ".htpasswd"
        ],
        hideDirs: [
            "vendor"
        ],
    });
}





const StaticHTML = () => {
    const [showHighlight, setShowHighlight] = useState(false)
    useEffect(() => {
        setShowHighlight(!showHighlight)
    }, [])
    useEffect(() => {
        const intervalId = setInterval(() => {  //assign interval to a variable to clear it.
            window.electron?.ipcRenderer.invoke('toMain',
                {WHO: 'p3'}).then(
                (r) => {
                    console.log('[][P3][invoke][then]r=', r)
                    setFiles(r.dirTree_SacoMeasure)
                }
            )

        }, 1000)

        return () => clearInterval(intervalId); //This is important

    }, [useState])
    const [files, setFiles] = useState([
        {
            name: "2Input",
            isDirectory: true, // Folder
            path: "/Input", // Located in Root directory
            updatedAt: "2024-09-09T10:30:00Z", // Last updated time
        },
        {
            name: "2Output",
            isDirectory: true, // Folder
            path: "/Output", // Located in Root directory
            updatedAt: "2024-09-09T10:30:00Z", // Last updated time
        },
        {
            name: "2SatoTool",
            isDirectory: true, // Folder
            path: "/SatoTool", // Located in Root directory
            updatedAt: "2024-09-09T10:30:00Z", // Last updated time
        },
        {
            name: "2Pictures",
            isDirectory: true,
            path: "/Pictures", // Located in Root directory as well
            updatedAt: "2024-09-09T11:00:00Z",
        },
        {
            name: "2Pic.png",
            isDirectory: false, // File
            path: "/Pictures/Pic.png", // Located inside the "Pictures" folder
            updatedAt: "2024-09-08T16:45:00Z",
            size: 2048, // File size in bytes (example: 2 KB)
        },
    ]);

    const CustomImagePreviewer = ({file}) => {
        return <img src={`${file.path}`} alt={file.name}/>;
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

                        <Divider variant="dashed" style={{ borderColor: '#333'}} orientation="center" ></Divider>

                        <Card
                            title={'AI.Model Information'}
                            hoverable
                            style={{
                                width: '95vw',
                            }}
                            // cover={<Image alt="example" src={sacoSvgLogo3} width="100px" />}
                        >
                            <Divider style={{borderColor: '#7cb305'}} orientation="center">Model Setting</Divider>
                            <Space>
                                <Radio.Group defaultValue="m" buttonStyle="solid">
                                    <Radio.Button value="n" disabled>nano|5Mb</Radio.Button>
                                    <Radio.Button value="s" disabled>small|30Mb</Radio.Button>
                                    <Radio.Button value="m">Medium|70Mb</Radio.Button>
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
                                                {case: 'handleFileOpen', value: val}).then(
                                                (r) => {
                                                    console.log('[][P1][invoke][then]r=', r)
                                                }
                                            )
                                        }
                                    }
                                />
                            </Space>
                            <Divider style={{borderColor: '#333'}} orientation="center">Predict conferdence</Divider>
                            <Slider marks={marks} included={false} defaultValue={75}/>
                            <Slider marks={marks} included={false} defaultValue={75}/>
                            <Slider marks={marks} included={false} defaultValue={75}/>
                            <Slider marks={marks} included={false} defaultValue={75}/>
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

