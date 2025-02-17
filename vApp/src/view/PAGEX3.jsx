import {
    Layout,

    Alert, Flex, Card, Image, theme, ConfigProvider, Space, Button,

} from 'antd'

import  {useEffect, useState} from 'react'

const {Content, Footer, Sider} = Layout

import Marquee from 'react-fast-marquee'

// import { FileManager } from "@cubone/react-file-manager";
// import "@cubone/react-file-manager/dist/style.css";
import Flmngr from "@flmngr/flmngr-react";
import * as React from "react";

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


export class MyButton extends React.Component {

    render() {
        let fm_url='http://'+window.location.hostname+':3128/fm'
        console.log("MyButton fm_url=",fm_url)
        return  <>
        

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
                    urlFileManager: 'http://'+window.location.hostname+':3128/fm', // demo server
                    urlFiles: 'http://'+window.location.hostname+':3128/ftp',
                    isMultiple: false,                                   // let selecting a single file
                    acceptExtensions: ["png", "jpg", "jpeg", "tif","tiff", "webp"],
                    onFinish: (files) => {
                        console.log("User picked:");
                        console.log(files);
                    }
                });
            }}
        >
            Open file manager
        </Button>
        </>
    }

}


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
                    setFiles(r.dirTree_SacoMeasure)
                }
            )

        }, 1000)

        return () => clearInterval(intervalId); //This is important

    }, [ useState])
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
                                <Card style={{width: '100%', height: '100%'}}>
                                    {/*<FileManager files={files}*/}
                                    {/*    // filePreviewComponent={(file) => <CustomImagePreviewer file={file} />}*/}
                                    {/*/>*/}
                                    <MyButton></MyButton>
                                    <div className="loading-full-screen">
                                        <div id="loading">Loading folder listing...</div>
                                    </div>
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

