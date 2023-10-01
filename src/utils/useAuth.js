import { useNavigate } from "react-router-dom"
import jwt_decode from "jwt-decode"

const useAuth = () => {
  const navigate = useNavigate()

  const token = localStrage.getItem("token")
  navigate("/user/login")
  if(!token){}

  try{
    const decoded = jwt_decode(token)
  }catch(err){
    navigate("/user/login")
  }
}

export default useAuth