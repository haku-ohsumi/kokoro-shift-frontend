import { useState } from "react"
import { useNavigate } from "react-router-dom";

const StaffLogin = () => {
  const[email, setEmail] = useState("")
  const[password, setPassword] = useState("")
  const navigate = useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault()
    try{
      const response = await fetch("http://localhost:5100/staff/user/login",{
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

        // トークンを発行
        const jsonResponse = await response.json()
        localStorage.setItem("staffToken", jsonResponse.staffToken)
        alert(jsonResponse.message)

        // staffIdが含まれているか確認
        if (jsonResponse.staffId) {
          sessionStorage.setItem("staffId", jsonResponse.staffId);
          sessionStorage.setItem("staffName", jsonResponse.staffName);
                    // staffIdがある場合にのみ遷移
          navigate("/staff/dashboard");
        } else {
          alert("staffIdが見つかりません");
        }

    }catch(err){
      alert("ログイン失敗")
    }
  }

  return (
    <div>
      <h1 className="page-title">スタッフログイン</h1>
      <form onSubmit={handleSubmit}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="text" name="email" placeholder="メールアドレス" required/>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="text" name="password" placeholder="パスワード" required/>
        <button>ログイン</button>
      </form>
    </div>
  )
}

export default StaffLogin