import { Route, Routes, BrowserRouter} from "react-router-dom"

import AdminLogin from"./pages/admin/user/login"
import AdminRegister from"./pages/admin/user/register"
import StaffLogin from"./pages/staff/user/login"
import StaffRegister from"./pages/admin/staff/register"
import KokoroStateForm from"./pages/staff/dashboard/kokoroState"
import KokoroShiftApplication from"./pages/staff/dashboard/kokoroShiftApplication"
import StaffSelect from"./pages/admin/staff/staffSelect"
import ShiftForm from"./pages/admin/shiftManagement/shiftManagement"
import Home from "./pages/home"
import Header from "./components/header"
import Footer from "./components/footer"

import "./App.css"


const App = () => {
    return (
    <BrowserRouter>
      <div className="container">
        <Header/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/admin/user/login" element={<AdminLogin/>}/>
        <Route path="/admin/user/register" element={<AdminRegister/>}/>
        <Route path="/staff/user/login" element={<StaffLogin/>}/>
        <Route path="/admin/staff/register" element={<StaffRegister/>}/>
        <Route path="/staff/dashboard" element={<KokoroStateForm/>}/>
        <Route path="/staff/kokoro-shift/application" element={<KokoroShiftApplication/>}/>
        <Route path="/admin/staff-select" element={<StaffSelect/>}/>
        <Route path="/admin/staffId/shift-management" element={<ShiftForm/>}/>
      </Routes>
      <Footer/>
      </div>
    </BrowserRouter>
  )
}


export default App;
