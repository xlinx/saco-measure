import { parse } from 'node-html-better-parser';
// import pkg from 'node-html-better-parser';
// const {parseHtml} = pkg;
// import {createProxyMiddleware} from 'http-proxy-middleware';
// import {createProxyMiddleware} from 'http-proxy-middleware';
// import * as child_process from 'child_process';
// import { InterByteTimeoutParser, SerialPort} from 'serialport'

import {WebSocket, WebSocketServer} from 'ws';
import dgram from 'node:dgram';
import {homedir} from 'os';
import express from "express";
import multer from "multer";
// const multer = require('multer');

import {useStoreS} from "./useStoreS.js";

import * as fs from 'node:fs';
import * as path from "node:path";
import * as http from 'http';
import * as url from "node:url";
import archiver from "archiver";
import https from 'https';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


let auto_update=false;
let wss = undefined;
// let UDPServer = undefined;
const app = express();
// const Readline = require("@serialport/parser-readline");
const folder_home_sarcoMeasure = path.join(homedir(), 'sarcoMeasure');
const folder_home_sarcoMeasure_input = path.join(folder_home_sarcoMeasure, 'input');
const folder_home_sarcoMeasure_output = path.join(folder_home_sarcoMeasure, 'output');
const folder_home_sarcoMeasure_processed = path.join(folder_home_sarcoMeasure, 'processed');
const folder_home_sarcoMeasure_upload = path.join(folder_home_sarcoMeasure, 'upload');
const folder_home_sarcoMeasure_dist = path.join(__dirname, 'dist');
const folder_home_sarcoMeasure_www = path.join(folder_home_sarcoMeasure, 'www');
const configFilePath = path.join(folder_home_sarcoMeasure_www, 'config.txt');

let last_CMD = "";
let CMD_QUEUE = []
const sslOptions = {//openssl req -nodes -new -x509 -keyout cert/key.pem -out cert/cert.pem -days 365
    key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
  };
const directories = [
    folder_home_sarcoMeasure,
    folder_home_sarcoMeasure_www,
    folder_home_sarcoMeasure_upload,
];

async function initDirectories() {
    try {
        for (const targetDir of directories) {
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, {recursive: true});
                console.log('Created Directory: ' + targetDir);
            }
        }
    } catch (err) {
        console.log(err);
    }
};


const mimeType = {
    '.mp4': 'video/mp4',
    '.mov': 'video/mov',
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
    '.doc': 'application/msword',
    '.eot': 'application/vnd.ms-fontobject',
    '.ttf': 'application/x-font-ttf',
};

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
//# Single file upload
// curl -X POST -F "file=@image.jpg" http://localhost:20021/upload

// # Multiple files upload
// curl -X POST -F "files=@file1.jpg" -F "files=@file2.png" http://localhost:20021/upload-multiple

// # List uploaded files
// curl http://localhost:20021/files
async function multerServer(port){
    // Set up storage for uploaded files
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            // Use the configured upload directory
            cb(null, folder_home_sarcoMeasure_upload);
        },
        filename: function (req, file, cb) {
            // Save with original filename
            cb(null, file.originalname);
        }
    });

    // Configure multer with file filtering
    const upload = multer({ 
        storage: storage,
        limits: {
            fileSize: 10 * 1024 * 1024, // 50MB limit
            files: 2 // Max 10 files
        },
        fileFilter: function (req, file, cb) {
            // Accept images, videos, and common file types
            const allowedTypes = /jpeg|jpg|png|gif|bmp|tiff|tif/;
            const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = allowedTypes.test(file.mimetype);
            
            if (mimetype && extname) {
                return cb(null, true);
            } else {
                cb(new Error('Only specific file types are allowed!'));
            }
        }
    });

    // CORS middleware to handle cross-origin requests
    app.use((req, res, next) => {
        // Allow specific origins or use '*' for development
        // const allowedOrigins = [
        //     'http://localhost:5173',  // Vite dev server
        //     'http://localhost:3000',  // React dev server
        //     'http://localhost:8080',  // Vue dev server
        //     'http://127.0.0.1:5173',
        //     'http://127.0.0.1:3000',
        //     'http://127.0.0.1:8080'
        // ];
        
        // const origin = req.headers.origin;
        // if (allowedOrigins.includes(origin)) {
        //     res.header('Access-Control-Allow-Origin', origin);
        // } else {
        res.header('Access-Control-Allow-Origin', '*');
        // }
        
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');
        
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
        } else {
            next();
        }
    });

    // Middleware for parsing JSON and URL-encoded bodies


    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Test endpoint to verify CORS is working
    app.get('/test-cors', (req, res) => {
        res.json({ 
            success: true, 
            message: 'CORS is working!',
            timestamp: new Date().toISOString(),
            origin: req.headers.origin
        });
    });

    // Serve static files
    app.use(express.static(folder_home_sarcoMeasure_www));
    app.use('/input', express.static(folder_home_sarcoMeasure_input));
    app.use('/output', express.static(folder_home_sarcoMeasure_output));
    app.use('/processed', express.static(folder_home_sarcoMeasure_processed));
    app.use('/uploads', express.static(folder_home_sarcoMeasure_upload));
    app.use('/', express.static(folder_home_sarcoMeasure_dist));

    // GET route to serve upload form
    app.get('/upload-form', (req, res) => {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>File Upload</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .upload-form { max-width: 500px; margin: 0 auto; }
                    .form-group { margin-bottom: 20px; }
                    label { display: block; margin-bottom: 5px; }
                    input[type="file"] { width: 100%; padding: 10px; }
                    button { background: #007bff; color: white; padding: 10px 20px; border: none; cursor: pointer; }
                    button:hover { background: #0056b3; }
                    .result { margin-top: 20px; padding: 10px; border-radius: 5px; }
                    .success { background: #d4edda; color: #155724; }
                    .error { background: #f8d7da; color: #721c24; }
                </style>
            </head>
            <body>
                <div class="upload-form">
                    <h2>File Upload</h2>
                    <form action="/upload" method="post" enctype="multipart/form-data">
                        <div class="form-group">
                            <label for="file">Select File:</label>
                            <input type="file" name="file" id="file" multiple>
                        </div>
                        <button type="submit">Upload</button>
                    </form>
                    <div id="result"></div>
                </div>
                <script>
                    document.querySelector('form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const resultDiv = document.getElementById('result');
                        
                        try {
                            const response = await fetch('/upload', {
                                method: 'POST',
                                body: formData
                            });
                            const result = await response.text();
                            resultDiv.innerHTML = '<div class="success">' + result + '</div>';
                        } catch (error) {
                            resultDiv.innerHTML = '<div class="error">Upload failed: ' + error.message + '</div>';
                        }
                    });
                </script>
            </body>
            </html>
        `);
    });

    // POST route to handle single file upload
    app.post('/upload', upload.single('file'), (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'No file uploaded.' 
                });
            }
            // Move file to input folder
            const srcPath = req.file.path;
            const destPath = path.join(folder_home_sarcoMeasure_input, req.file.filename);
            fs.renameSync(srcPath, destPath);
            console.log(`[UPLOAD] File uploaded and moved to input: ${destPath}`);
            res.json({ 
                success: true, 
                message: 'File uploaded and moved to input folder!',
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Upload failed: ' + error.message 
            });
        }
    });

    // POST route to handle multiple file uploads
    app.post('/upload-multiple', upload.array('files', 10), (req, res) => {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'No files uploaded.' 
                });
            }
            
            const uploadedFiles = req.files.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype
            }));
            
            res.json({ 
                success: true, 
                message: `${uploadedFiles.length} files uploaded successfully!`,
                files: uploadedFiles
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Upload failed: ' + error.message 
            });
        }
    });

    // GET route to list uploaded files with enhanced features
    app.get('/files', (req, res) => {
        const base_folder=folder_home_sarcoMeasure
        const folderName=req.query.foldername
        const now_folder=path.join(base_folder, folderName);
        try {
            const { sort = 'modified', order = 'desc', filter = '', page = 1, limit = 50 } = req.query;
            const files = fs.readdirSync(now_folder);
            
            let fileList = files
                .filter(filename => {
                    // Apply filter if provided
                    if (filter) {
                        return filename.toLowerCase().includes(filter.toLowerCase()) ||
                               path.extname(filename).toLowerCase().includes(filter.toLowerCase());
                    }
                    return true;
                })
                .map(filename => {
                    const filePath = path.join(now_folder, filename);
                    const stats = fs.statSync(filePath);
                    const ext = path.extname(filename).toLowerCase();
                    
                    return {
                        filename,
                        originalName: filename,
                        size: stats.size,
                        sizeFormatted: formatFileSize(stats.size),
                        created: stats.birthtime,
                        modified: stats.mtime,
                        extension: ext,
                        mimetype: mimeType[ext] || 'application/octet-stream',
                        url: `/uploads/${filename}`,
                        isImage: /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(filename),
                        isVideo: /\.(mp4|mov|avi|mkv|wmv|flv)$/i.test(filename),
                        isDocument: /\.(pdf|doc|docx|txt|csv|xls|xlsx)$/i.test(filename),
                        isDirectory: stats.isDirectory(),
                    };
                });

            // Sort files
            fileList.sort((a, b) => {
                let aValue, bValue;
                switch (sort) {
                    case 'name':
                        aValue = a.filename.toLowerCase();
                        bValue = b.filename.toLowerCase();
                        break;
                    case 'size':
                        aValue = a.size;
                        bValue = b.size;
                        break;
                    case 'created':
                        aValue = new Date(a.created);
                        bValue = new Date(b.created);
                        break;
                    case 'modified':
                    default:
                        aValue = new Date(a.modified);
                        bValue = new Date(b.modified);
                        break;
                }
                
                if (order === 'asc') {
                    return aValue > bValue ? 1 : -1;
                } else {
                    return aValue < bValue ? 1 : -1;
                }
            });

            // Pagination
            const totalFiles = fileList.length;
            const totalPages = Math.ceil(totalFiles / limit);
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + parseInt(limit);
            const paginatedFiles = fileList.slice(startIndex, endIndex);

            res.json({
                TS:new Date().toISOString(),
                success: true, 
                files: paginatedFiles,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalFiles,
                    filesPerPage: parseInt(limit),
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                },
                filters: {
                    sort,
                    order,
                    filter,
                    appliedFilters: {
                        sort: sort,
                        order: order,
                        filter: filter || 'none'
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Failed to list files: ' + error.message 
            });
        }
    });

    // GET route to serve a file browser interface
    app.get('/file-browser', (req, res) => {
        res.sendFile(path.join(process.cwd(), 'fileBrowser.html'));
    });

    // GET route to preview CSV file content
    app.get('/preview-csv/:filename', (req, res) => {
        try {
            const filename = req.params.filename;
            const filePath = path.join(folder_home_sarcoMeasure_upload, filename);
            
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'File not found' 
                });
            }
            
            const ext = path.extname(filename).toLowerCase();
            if (ext !== '.csv') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'File is not a CSV' 
                });
            }
            
            const csvContent = fs.readFileSync(filePath, 'utf8');
            const lines = csvContent.split('\n').filter(line => line.trim()); // Remove empty lines
            
            if (lines.length === 0) {
                return res.json({ 
                    success: true, 
                    headers: [], 
                    rows: [], 
                    totalRows: 0 
                });
            }
            
            // Parse CSV with better handling of quoted fields
            const parseCSVLine = (line) => {
                const result = [];
                let current = '';
                let inQuotes = false;
                
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        result.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                result.push(current.trim());
                return result;
            };
            
            const headers = parseCSVLine(lines[0]);
            const rows = lines.slice(1, 21).map(line => { // Show first 20 rows
                const values = parseCSVLine(line);
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                return row;
            });
            
            res.json({ 
                success: true, 
                headers, 
                rows, 
                totalRows: lines.length - 1,
                filename
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Failed to read CSV: ' + error.message 
            });
        }
    });
    app.delete('/delete-folder/:foldername', (req, res) => {

        try {
            const filename = req.params.foldername;
            const foldername = req.params.foldername.split('.')[0];
            const filePath = path.join(folder_home_sarcoMeasure_output, foldername);
            console.log('/delete-folder/:foldername',filePath)
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({
                    success: false,
                    message: 'File not found'
                });
            }
            fs.unlinkSync(path.join(folder_home_sarcoMeasure_processed, filename));
            fs.rmSync(filePath, { recursive: true, force: true });

            // fs.rmdirSync(filePath);
            res.json({
                success: true,
                message: 'folder deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete folder: ' + error.message
            });
        }
    });
    // DELETE route to delete a file
    app.delete('/delete-file/:filename', (req, res) => {
        try {
            const filename = req.params.filename;
            const filePath = path.join(folder_home_sarcoMeasure_output, filename);
            
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'File not found' 
                });
            }
            
            fs.unlinkSync(filePath);
            res.json({ 
                success: true, 
                message: 'File deleted successfully' 
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Failed to delete file: ' + error.message 
            });
        }
    });

    // Download a folder as ZIP
    app.get('/download-zip/:foldername', (req, res) => {
        const base_folder = folder_home_sarcoMeasure_output;
        const folderName = req.params.foldername;
        const folderPath = path.join(base_folder, folderName);
        // Prevent directory traversal
        if (folderName.includes('..') || folderName.includes('/')) {
            return res.status(400).json({ success: false, message: 'Invalid folder name' });
        }
        console.log('[][][1]Download zip file: ' + folderPath);
        if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
            return res.status(404).json({ success: false, message: 'Folder not found:'+folderPath });
        }
        console.log('[][][2]Download zip file: ' + folderPath);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=${folderName}.zip`);

        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.directory(folderPath, false);
        archive.pipe(res);
        archive.finalize();
    });

    // Error handling middleware
    app.use((error, req, res, next) => {
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'File too large. Maximum size is 50MB.' 
                });
            }
        }
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    });

    // Start HTTPS server
    return new Promise((resolve, reject) => {
        const expressServer = https.createServer(sslOptions, app);
        expressServer.listen(port, () => {
            console.log(`multerServer (HTTPS) listening at port:${port}`);
            console.log(`CORS test endpoint: https://localhost:${port}/test-cors`);
            console.log(`Upload form available at: https://localhost:${port}/upload-form`);
            console.log(`File browser available at: https://localhost:${port}/file-browser`);
            console.log(`Upload endpoint: https://localhost:${port}/upload`);
            console.log(`Multiple upload endpoint: https://localhost:${port}/upload-multiple`);
            console.log(`Files list endpoint: https://localhost:${port}/files`);
            console.log(`CSV preview endpoint: https://localhost:${port}/preview-csv/:filename`);
            console.log(`CORS enabled for: localhost:5173, localhost:3000, localhost:8080`);
            resolve(expressServer);
        });
        expressServer.on('error', (error) => {
            console.error('multerServer HTTPS error:', error);
            reject(error);
        });
    });
}
async function httpServer(port){

    // http.createServer(function (req, res) {
        https.createServer(sslOptions, function (req, res) {
        console.log(`${req.method} ${req.url}`);
        const parsedUrl = url.parse(req.url);
        // extract URL path
        // Avoid https://en.wikipedia.org/wiki/Directory_traversal_attack
        // e.g curl --path-as-is http://localhost:9000/../fileInDanger.txt
        // by limiting the path to current directory only
        const sanitizePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
        let pathname = path.join(folder_home_sarcoMeasure, sanitizePath);

        fs.exists(pathname, function (exist) {
            if(!exist) {
                // if the file is not found, return 404
                res.statusCode = 404;
                res.end(`File ${pathname} not found!`);
                return;
            }

            // if is a directory, then look for index.html
            if (fs.statSync(pathname).isDirectory()) {
                pathname += '/index.html';
            }

            // read file from file system
            fs.readFile(pathname, function(err, data){
                if(err){
                    res.statusCode = 500;
                    res.end(`Error getting the file: ${err}.`);
                } else {
                    // based on the URL path, extract the file extention. e.g. .js, .doc, ...
                    const ext = path.parse(pathname).ext;
                    // if the file is found, set Content-type and send data
                    res.setHeader('Content-type', mimeType[ext] || 'text/plain' );
                    res.end(data);
                }
            });
        });


    }).listen(parseInt(port));
}


function onMessage(wss, ws, data_raw) {
    try {
        // console.log(new Date(), wss.clients.size, '[WSS][on message]', data_raw.toString());
        let data2JSON = JSON.parse(data_raw);
        let RX_WHO = data2JSON.WHO;
        // useStoreS.SERVER_TS = new Date().toLocaleString('en-GB')
        // ws.send(JSON.stringify(useStoreS));
        // console.log(new Date(),"[][WSS][onMsg]","data2JSON[\"CMD\"]=", data2JSON["CMD"] , ws._socket.remoteAddress)
        // console.table([{input:"Input1",output:"output1"},{input:"Input1",output:"output1"}]);
        console.log('TS:%s IP:%s\tRAW:%s',  new Date().valueOf(),ws._socket.remoteAddress,data_raw)
        if (last_CMD !== data2JSON["CMD"]) {
            last_CMD = data2JSON["CMD"];
            switch (RX_WHO) {
                case 'WSC':
                    if (data2JSON["CMD"].startsWith("/cue/box/udp_now/")) {


                    } else if (last_CMD !== data2JSON["CMD"] && data2JSON["CMD"].startsWith("/cue/config/del/")) {
                        delConfigFile();
                    }else if (data2JSON["CMD"].startsWith("/cue/box/update_win1234/")) {

                         auto_update=true;
                    }
                    break;
                // case 'ARGOD':
                //     fromARGOD(ws,data2JSON,data);
                //     break;
            }
        }else{
            // console.log("same CMD", last_CMD, data2JSON["CMD"])
        }

    } catch (e) {
        return console.error("[X]JSON.parse", data_raw.toString(), e); // error in the above string (in this case, yes)!
    }

}

async function initWSS(PORT_WSS) {
    // const server = http.createServer();
    // const serverx = express().listen(PORT_WSS, () => {
    //     console.log(`Listening on ${PORT_WSS}`)
    // })
    // wss = new WebSocketServer({server:serverx});
    // const WebSocketServer = require('ws').Server;
    return new Promise((resolve, reject) => {
        try {
            wss = new WebSocketServer({host: "0.0.0.0", port: PORT_WSS});
            wss.on('connection', (ws, req) => {
                ws.isAlive = true;
                ws.WHO = "DECADE";
                console.log(new Date().toLocaleString() + '[]New connection from', ws._socket.remoteAddress, req.socket.remoteAddress, "total clients=", wss.clients.size);

                ws.on('open', function open() {
                    console.log('[on open]')
                });
                ws.on('close', () => {
                    console.log('[on close]')
                    ws.terminate();
                });
                ws.on('error', () => {
                    console.log('[on Error]')
                });
                ws.on('message', (data) => {
                    if (ws.readyState === WebSocket.OPEN)
                        ws.isAlive = true;
                    onMessage(wss, ws, data);
                });

            });
            return resolve(wss);
        } catch (e) {
            return reject(wss);
        }


    });
}




function checkFileExists(file) {
    return fs.promises.access(file, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false)
}

async function loadConfigFile(folder, configFilePath) {
    let resultData = {};
    initDirectories();

    if (await checkFileExists(configFilePath)) {
        const resultBuffer = fs.readFileSync(configFilePath);
        try {
            resultData = JSON.parse(resultBuffer.toString().trim());

            useStoreS.BOX_IP = resultData.BOX_IP;

            // useStoreS.BOX_IP.split(',').map((e,i)=>{
            //     useStoreS.BOX_IPs.push(TEMPLATE_BOX_IPs)
            // })
            useStoreS.UDP_PORT = resultData.UDP_PORT;
            useStoreS.TCP_PORT = resultData.TCP_PORT;

        } catch (e) {
            console.error(`[X][loadConfigFile]= ${e}`);
            // useStoreS.TRIGGER_SAVE = true;
            // console.error(`[X][Restart][loadConfigFile]= ${e}`);

        }
    } else {
        useStoreS.TRIGGER_SAVE = true;
    }
    return resultData;
}

function delConfigFile() {
    if (fs.existsSync(configFilePath)) {
        fs.unlink(configFilePath, (err) => {
            if (err) {
                console.log(err);
            }
            console.log('[][][]deleted', configFilePath);
            saveConfigFile(folder_home_sarcoMeasure, configFilePath);
            console.log('[][][config]rebuild ok', configFilePath);
        })
    }


}

function saveConfigFile(folder, configFilePath) {
    // const __dirname=path.resolve();
    // const folder = path.join(homedir(), 'BSL_config');
    // const configFilePath = path.join(folder, 'BSL_MFN300B_config.txt');
    setInterval(() => {
        if (useStoreS.TRIGGER_SAVE) {
            useStoreS.TRIGGER_SAVE = false;
            console.log('[!!!][TRIGGER_SAVE][][saveConfigFile]=', configFilePath);
            if (!fs.existsSync(folder)) {
                fs.promises.mkdir(folder)
                    .then(() => console.log(`Directory ${folder} created.`))
                    .catch(err => console.error(`Error creating directory: ${err.message}`));
            }

            fs.writeFile(configFilePath, JSON.stringify(useStoreS, null, 2), err => {
                if (err) {
                    console.log(`[X][saveConfigFile]= ${configFilePath}`);
                } else {
                    console.log(`[O][saveConfigFile]= ${configFilePath}`);
                }
            });
            loadConfigFile(folder, configFilePath).then(r => {console.log("saved & reload ok",useStoreS)})
        }

    }, 1000);

}
let pause_other_boardcast=false;
function wssBroadcast_SYNC() {
    pause_other_boardcast=true
    if (wss !== undefined) {
        useStoreS.TX_JSON.TS = new Date().toLocaleString('en-GB')
        let output=JSON.stringify(useStoreS.TX_JSON)
        wss.clients.forEach(ws => {
                if (ws.isAlive) {
                    ws.send(output);
                }
            }
        );
    }
    pause_other_boardcast=false
}
function wssBroadcast_useStoreS() {

    if (wss !== undefined) {
        wss.clients.forEach(ws => {
            if (ws.isAlive) {
                // useStoreS.TS = new Date().toLocaleString('en-GB')
                useStoreS.TX_JSON.TS = new Date().toLocaleString('en-GB')
                ws.send(JSON.stringify(useStoreS.TX_JSON));
                }
            }
        );
    }
}

function wssCheckClient3000() {
    if (wss !== undefined) {

        wss.clients.forEach((ws) => {
            if (ws.isAlive === false)
                return ws.terminate();
            ws.isAlive = false;
        });
        useStoreS.WSC_COUNT=wss.clients.size
    }
}

function timerX() {

    setInterval(() => {
        if (!pause_other_boardcast){
            wssBroadcast_useStoreS()
        }

    }, 1000);
    setInterval(() => {
        wssCheckClient3000();
    }, 3000);
}



let lLOADED = false;
export function initServer() {
    let multerServer_port=7777
    let WSS_PORT = multerServer_port+1;
    process.argv.forEach((index, value) => {
        console.log('[][cmd_var][]', index, value)
        if(index===2)
            multerServer_port=parseInt(value)
        else if(index===3)
            WSS_PORT=parseInt(value)
    });

    if (lLOADED) {
        console.log("[ProxyJS][IN-Call][initServer]has been loaded")
        return;
    }
    loadConfigFile(folder_home_sarcoMeasure, configFilePath).then(r => {
        console.log('[][][DECADE-Config-Module][3]', configFilePath);
        saveConfigFile(folder_home_sarcoMeasure, configFilePath);
    });

    console.log(`[][][initServer][1]...startLoading`)

    // httpServer(20080).then(r => {
    //     console.log('[][][DECADE-httpServer-Module][3]server listening ',20080);
    // });
    multerServer(multerServer_port).then(r => {
        console.log('[][][DECADE-httpServer-Module][3]multerServer listening ',multerServer_port);
    });




    initWSS(WSS_PORT).then(r => {
        console.log('[][][DECADE-WSS-Module][3]server listening ', WSS_PORT);
    });
    // let UDP_PORT = 20254;
    // initUDPServer(UDP_PORT).then(r => {
    //     console.log('[][][DECADE-UDP-Module][3]server listening ', UDP_PORT);
    // });
    // socat().then(r => console.log(`[init][DECADE-socat] `));

    // initProxyServer(3128).then(r => {
    //     console.log('[][][DECADE-PROXY-Module][3]server listening ', 31280);
    // });
    timerX();
    lLOADED = true;
    console.log(`[][][initServer][2]...startLoading...OK`)


}

console.log("[DECADE.TW][ProxyJS][1][initServer]")
if (lLOADED)
    console.log("[ProxyJS][base-Call][initServer]has been loaded")
else {
    console.log("[ProxyJS][base-Call][initServer]start loading")
    initServer();
}
console.log("20250710[sarcoProxyJS][2][initServer]",useStoreS)
// export default initServer
