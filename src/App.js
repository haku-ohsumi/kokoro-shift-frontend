import { Route, Routes, BrowserRouter} from "react-router-dom"

import AdminLogin from"./pages/admin/user/login"
import AdminRegister from"./pages/admin/user/register"
import Header from "./components/header"
import Footer from "./components/footer"

import "./App.css"


const App = () => {
  return (
    <BrowserRouter>
      <div className="container">
        <Header/>
      <Routes>
        <Route path="/admin/user/login" element={<AdminLogin/>}/>
        <Route path="/admin/user/register" element={<AdminRegister/>}/>
      </Routes>
      <Footer/>
      </div>
    </BrowserRouter>
  )
}


export default App;
