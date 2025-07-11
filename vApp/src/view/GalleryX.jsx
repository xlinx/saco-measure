import React, {useEffect, useState} from 'react';
import {
    Card,
    Divider,
    Image,
    Input,
    List,
    Space,
    Typography,
    Modal,
    Table,
    Button,
    Tag,
    Tooltip,
    Carousel,
    Flex
} from 'antd';
import {UploadX} from "./UploadX.jsx";
import {FileTextOutlined, PictureOutlined, FileExcelOutlined, FilePdfOutlined, FolderOpenOutlined, DownloadOutlined} from '@ant-design/icons';

import * as path from "path";
import {useStoreX} from "../model/StoreX.jsx";

export function GalleryX(props) {
    const {EXPRESS_REPONSE_200}=useStoreX();
    const [filter, setfilter] = useState(props.filter);
    const [folderName, setFolderName] = useState(props.folderName);
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [csvData, setCsvData] = useState(null);
    const [csvModalVisible, setCsvModalVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [searchText, setSearchText] = useState('');

    const hostname = window.location.hostname;
    let expressUrl = window.location.protocol+"//"+hostname+(hostname.startsWith('192')?":7777":"");
    let expressHttpUrl = expressUrl;
    // Function to get file icon based on extension or directory
    const getFileIcon = (item) => {
        if (item.isDirectory) return <FolderOpenOutlined style={{color: '#faad14'}} />;
        const filename = item.filename;
        const ext = filename.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return <PictureOutlined style={{color: '#1890ff'}} />;
        if (['csv'].includes(ext)) return <FileExcelOutlined style={{color: '#52c41a'}} />;
        if (['pdf'].includes(ext)) return <FilePdfOutlined style={{color: '#ff4d4f'}} />;
        return <FileTextOutlined style={{color: '#666'}} />;
    };

    // Function to fetch files from Express server
    const fetchFiles = async () => {
        try {
            console.log('window.location.protocol=',window.location.protocol)
            // setLoading(true);
            const response = await fetch(`${expressUrl}/files?foldername=${folderName}&filter=${searchText}&sort=modified&order=desc`);

            const data = await response.json();
            
            if (data.success) {
                setDataSource(data.files);
            } else {
                console.error('Failed to fetch files:', data.message);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
        } finally {
            setLoading(false);
        }
    };

    // Function to preview CSV file
    const previewCsv = async (filename) => {
        try {
            const response = await fetch(`${expressUrl}/preview-csv/${encodeURIComponent(filename)}`);
            const data = await response.json();
            
            if (data.success) {
                setCsvData(data);
                setSelectedFile(filename);
                setCsvModalVisible(true);
            } else {
                console.error('Failed to preview CSV:', data.message);
            }
        } catch (error) {
            console.error('Error reading CSV:', error);
        }
    };

    // Function to download file
    const downloadFile = (filename) => {
        window.open(`${expressUrl}/${folderName}/${filename}`, '_blank');
    };

    // Function to delete file
    const deleteFile = async (filename) => {
        let delTarget=`${expressUrl}/delete-folder/${encodeURIComponent(filename)}`
        if (!confirm(`${delTarget} Are you sure you want to delete folder ${delTarget} ?`)) return;
        
        try {
            const response = await fetch(delTarget, {
                method: 'DELETE'
            });
            const data = await response.json();
            
            if (data.success) {
                fetchFiles(); // Refresh the list
            } else {
                console.error('Failed to delete file:', data.message);
            }
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    useEffect(() => {
        fetchFiles().then(r => {

        });
        const intervalId = setInterval(fetchFiles, 2000); // Refresh every 2 seconds
        return () => clearInterval(intervalId);
    }, [searchText]);

    // CSV table columns for preview
    const csvColumns = csvData?.headers.map(header => ({
        title: header,
        dataIndex: header,
        key: header,
        ellipsis: true,
        render: (text) => (
            <Tooltip title={text}>
                <span>{text}</span>
            </Tooltip>
        )
    })) || [];
    const contentStyle = {
        width: '100px',
        // height: '160px',
        color: '#fff',
        // lineHeight: '160px',
        textAlign: 'center',
        background: '#364d79',
    };
    return (
        <div>
            <Divider dashed={true} style={{fontSize:'1em',borderColor: '#575757'}} >
                <Input.Search
                    addonBefore={`${folderName}`}
                    style={{width: '100%'}}
                    placeholder={`Search in ${folderName}`}
                    onSearch={(value) => setSearchText(value)}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </Divider>

            <div
                // style={{width: '100%'}}
                direction='horizontal'>
                {props.upload === true ? <UploadX></UploadX> : null}
                
                <List
                    loading={loading}
                    // dataSource={dataSource}
                    dataSource={dataSource.filter(item => !item.filename.startsWith('.'))}
                    grid={{xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4}}
                    // style={{width:'100%'}}
                    renderItem={(item) => {
                        const isImage = item.isImage;
                        const isCsv = item.extension === '.csv';
                        const isPdf = item.extension === '.pdf';
                        const isDirectory = item.isDirectory;
                        
                        return (
                            <Card
                                key={item.filename}
                                title={
                                    <div
                                        // style={{display: 'flex', alignItems: 'center', gap: 8}}
                                    >
                                        {getFileIcon(item)} &nbsp;
                                        <span style={{fontSize: '1em'}}>{item.filename}</span>
                                    </div>
                                }
                                // style={{width:'100%',margin: 12}}
                                hoverable
                                actions={
                                    isDirectory ? [
                                        <Tooltip title="Download as ZIP">
                                            <Button

                                                type="text"
                                                size="small"
                                                icon={<DownloadOutlined />}
                                                onClick={() => window.open(`${expressUrl}/download-zip/${item.filename}`, '_blank')}
                                            >
                                                Download ZIP
                                            </Button>
                                        </Tooltip>
                                    ] : [
                                        <Tooltip title="Download">
                                            <Button 
                                                type="text" 
                                                size="small" 
                                                onClick={() => downloadFile(item.filename)}
                                            >
                                                Download
                                            </Button>
                                        </Tooltip>,
                                        <Tooltip title="Delete">
                                            <Button 
                                                type="text" 
                                                size="small" 
                                                danger
                                                onClick={() => deleteFile(item.filename)}
                                            >
                                                Delete
                                            </Button>
                                        </Tooltip>
                                    ]
                                }
                            >
                                <div style={{textAlign: 'center'}}>
                                    {isDirectory ? (
                                        <div
                                            style={{}}
                                        >
                                            <FolderOpenOutlined style={{fontSize: '48px'}} />
                                            <div style={{marginTop: '8px'}}>
                                                <Tag color="gold">FOLDER</Tag>
                                                <div style={{fontSize: '12px', color: '#666'}}>
                                                    Directory
                                                </div>
                                            </div>
                                            {/*{filter !== 'csv' ?<>*/}
                                            {/*    <FolderOpenOutlined style={{fontSize: '48px'}} />*/}
                                            {/*<div style={{marginTop: '8px'}}>*/}
                                            {/*    <Tag color="gold">FOLDER</Tag>*/}
                                            {/*    <div style={{fontSize: '12px', color: '#666'}}>*/}
                                            {/*        Directory*/}
                                            {/*    </div>*/}
                                            {/*</div></>*/}
                                            {/*:<>*/}
                                            {/*    <div onClick={() => previewCsv(item.filename)}>*/}
                                            {/*        <FileExcelOutlined style={{fontSize: '48px', color: '#52c41a'}} />*/}
                                            {/*        <div style={{marginTop: '8px'}}>*/}
                                            {/*            <Tag color="green">CSV</Tag>*/}
                                            {/*            <div style={{fontSize: '12px', color: '#666'}}>*/}
                                            {/*                Click to preview*/}
                                            {/*            </div>*/}
                                            {/*        </div>*/}
                                            {/*    </div>*/}
                                            {/*    <div onClick={() => previewCsv(item.filename)}>*/}
                                            {/*        <FileExcelOutlined style={{fontSize: '48px', color: '#52c41a'}} />*/}
                                            {/*        <div style={{marginTop: '8px'}}>*/}
                                            {/*            <Tag color="green">CSV</Tag>*/}
                                            {/*            <div style={{fontSize: '12px', color: '#666'}}>*/}
                                            {/*                Click to preview*/}
                                            {/*            </div>*/}
                                            {/*        </div>*/}
                                            {/*    </div>*/}
                                            {/*    <div onClick={() => previewCsv(item.filename)}>*/}
                                            {/*        <FileExcelOutlined style={{fontSize: '48px', color: '#52c41a'}} />*/}
                                            {/*        <div style={{marginTop: '8px'}}>*/}
                                            {/*            <Tag color="green">CSV</Tag>*/}
                                            {/*            <div style={{fontSize: '12px', color: '#666'}}>*/}
                                            {/*                Click to preview*/}
                                            {/*            </div>*/}
                                            {/*        </div>*/}
                                            {/*    </div>*/}
                                            {/*    </>*/}
                                            {/*}*/}
                                        </div>
                                    ) : isImage ? (
                                        <>
                                        <Image
                                            src={`${expressHttpUrl}/${folderName}/${item.filename}`}
                                            alt={item.filename}
                                            // style={{maxWidth: '100vw', height: 'auto'}}
                                            preview={{
                                                src: `${expressHttpUrl}/${folderName}/${item.filename}`
                                            }}

                                        />
                                            {folderName !== 'processed' ?<></>:
                                                <div
                                                    // style={{ height: '160px' }}
                                                >
                                                    <Carousel
                                                        // style={{ height: '160px' }}
                                                        arrows autoplay={{ dotDuration: true }}
                                                        infinite={false}
                                                    >
                                                        <div>
                                                        <Image
                                                            src={`${expressHttpUrl}/output/${item.filename.split('.')[0]}/redSpace/predict_redSpace__${item.filename}`}
                                                            style={{height: '160px',}}
                                                        />
                                                        </div>
                                                        <div>
                                                        <Image
                                                            src={`${expressHttpUrl}/output/${item.filename.split('.')[0]}/redSpace/result_All_ID_0__${item.filename}`}
                                                            style={{height: '160px',}}
                                                        />
                                                        </div>
                                                        <div>
                                                        <Image
                                                            src={`${expressHttpUrl}/output/${item.filename.split('.')[0]}/greenPoly/result_All_ID_0__${item.filename}`}
                                                            style={{height: '160px',}}
                                                        />
                                                        </div>
                                                        <div>
                                                        <Image
                                                            src={`${expressHttpUrl}/output/${item.filename.split('.')[0]}/yellowRectangle/result_All_ID_0__${item.filename}`}
                                                            style={{height: '160px',}}
                                                        />
                                                        </div>

                                                    </Carousel>
                                                </div>
                                            }

                                        </>
                                    ) : isCsv ? (
                                        <div 
                                            style={{
                                                padding: '20px',
                                                border: '2px dashed #d9d9d9',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                backgroundColor: '#fafafa'
                                            }}
                                            onClick={() => previewCsv(item.filename)}
                                        >
                                            <FileExcelOutlined style={{fontSize: '48px', color: '#52c41a'}} />
                                            <div style={{marginTop: '8px'}}>
                                                <Tag color="green">CSV</Tag>
                                                <div style={{fontSize: '12px', color: '#666'}}>
                                                    Click to preview
                                                </div>
                                            </div>
                                        </div>
                                    ) : isPdf ? (
                                        <div 
                                            style={{
                                                padding: '20px',
                                                border: '2px dashed #d9d9d9',
                                                borderRadius: '8px',
                                                backgroundColor: '#fafafa'
                                            }}
                                        >
                                            <FilePdfOutlined style={{fontSize: '48px', color: '#ff4d4f'}} />
                                            <div style={{marginTop: '8px'}}>
                                                <Tag color="red">PDF</Tag>
                                                <div style={{fontSize: '12px', color: '#666'}}>
                                                    {item.sizeFormatted}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div 
                                            style={{
                                                padding: '20px',
                                                border: '2px dashed #d9d9d9',
                                                borderRadius: '8px',
                                                backgroundColor: '#fafafa'
                                            }}
                                        >
                                            <FileTextOutlined style={{fontSize: '48px', color: '#666'}} />
                                            <div style={{marginTop: '8px'}}>
                                                <Tag color="default">{item.extension?.toUpperCase() || 'FILE'}</Tag>
                                                <div style={{fontSize: '12px', color: '#666'}}>
                                                    {item.sizeFormatted}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div style={{marginTop: '8px', fontSize: '11px', color: '#999'}}>
                                        Modified: {new Date(item.modified).toLocaleDateString()}
                                    </div>
                                </div>
                            </Card>
                        );
                    }} 
                />
            </div>

            {/* CSV Preview Modal */}
            <Modal
                title={`CSV Preview: ${selectedFile}`}
                open={csvModalVisible}
                onCancel={() => setCsvModalVisible(false)}
                width="90%"
                footer={[
                    <Button key="download" type="primary" onClick={() => downloadFile(selectedFile)}>
                        Download Full CSV
                    </Button>,
                    <Button key="close" onClick={() => setCsvModalVisible(false)}>
                        Close
                    </Button>
                ]}
            >
                {csvData && (
                    <div>
                        <div style={{marginBottom: '16px'}}>
                            <Typography.Text strong>
                                Showing first 20 rows of {csvData.totalRows} total rows
                            </Typography.Text>
                        </div>
                        <Table
                            dataSource={csvData.rows}
                            columns={csvColumns}
                            pagination={false}
                            scroll={{ x: true }}
                            size="small"
                            bordered
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default GalleryX;