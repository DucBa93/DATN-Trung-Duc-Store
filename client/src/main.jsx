import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './store/store'
import { Toaster } from 'sonner'
import ScrollToTop from './components/common/scrollToTop'
import "./i18n";
/*Nhờ Provider, bất kỳ component con nào cũng có thể truy cập state bằng 
useSelector và thay đổi state bằng useDispatch*/
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>  
      <App />
      <ScrollToTop />
      <Toaster richColors />
    </Provider>
  </BrowserRouter>
    
)
