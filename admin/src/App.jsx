import AppRoutes from './routes';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import $ from 'jquery';
window.$ = window.jQuery = $;


function App() {
  
  return (
    <>
      <AppRoutes />
      <ToastContainer  position="top-center" autoClose={3000} />
    </>
  )
}
export default App;
