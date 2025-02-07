
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {MemoryRouter, Route, Routes} from "react-router-dom";
import OnePage from "./view/OnePage.jsx";


ReactDOM.createRoot(document.getElementById('root')).render(
    <MemoryRouter>
        {/*<React.StrictMode>*/}
        {/*<ConfigProvider locale={enUS}>*/}
        {/*<App />*/}
        <Routes>
            <Route path='/' element={<OnePage/>}/>
            <Route path='/app' element={<App/>}/>
            <Route path='/liff' element={<App/>}/>
            <Route path='/notfound' element={<App/>}/>
            <Route path='/thankyou' element={<OnePage/>}/>
        </Routes>
        {/*</ConfigProvider>*/}
        {/*</React.StrictMode>*/}
    </MemoryRouter>
)
