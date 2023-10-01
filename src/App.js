import { Route, Routes, BrowserRouter} from "react-router-dom"

import Register from"./pages/user/register"
import Login from"./pages/user/login"
import ReadAll from "./pages/item/readAll"
import ReadSingleItem from "./pages/item/readSingle"
import CreateItem from "./pages/item/create"

import "./App.css"


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/user/register" element={<Register/>}/>
        <Route path="/user/login" element={<Login/>}/>
        <Route path="/" element={<ReadAll/>}/>
        <Route path="/item/:id" element={<ReadSingleItem/>}/>
        <Route path="/item/create" element={<CreateItem/>}/>
      </Routes>
    </BrowserRouter>
  )
}


export default App;
