import { useState } from "react"
import { useNavigate } from 'react-router-dom';
import { BiArrowBack } from "react-icons/bi";
const AdminLogin = () => {
  const navigate = useNavigate();
  const[email, setEmail] = useState("")
  const[password, setPassword] = useState("")

  const handleSubmit = async(e) => {
    e.preventDefault()
    try{
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}admin/user/login`,{
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      })
      const jsonResponse = await response.json()
      localStorage.setItem("adminToken", jsonResponse.adminToken)
      alert(jsonResponse.message)
      navigate('/admin/staff-select');
    }catch(err){
      alert("ログイン失敗")
    }
  }

  return (
    <div>
      <BiArrowBack
        onClick={() => navigate("/")}
        className="back-button"
      />
      <h1 className="page-title">オーナーログイン</h1>
      <form onSubmit={handleSubmit}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="text" name="email" placeholder="メールアドレス" required/>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="text" name="password" placeholder="パスワード" required/>
        <button>ログイン</button>
      </form>
    </div>
  )
}

export default AdminLogin