import {Link} from "react-router-dom"
import headerSVG from "../images/S__32620567.jpg"

const Header = () =>{
  return(
    <header>
      <div><Link to="/"><img src={headerSVG} alt="header"/></Link></div>
    </header>
  )
}

export default Header