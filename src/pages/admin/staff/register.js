import {useState} from "react"


const StaffRegister = () => {
  const handleSubmit = async (e) => {
    e.preventDefault()
    try{
      const response = await fetch("http://localhost:5100/admin/staff/register",{
        method:"POST",
        headers:{
          "Accept": "application/json",
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          name: name,
          email: email,
          password: password
        })
      })
      const  jsonResponse = await response.json()
      alert(jsonResponse.message)
      console.log(jsonResponse.message)
    }catch(err){
      alert("スタッフ登録失敗")
    }
  }

  const [name, setname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div>
      <h1 className="page-title">スタッフ登録</h1>
      <form onSubmit={handleSubmit}>
        <input value={name} onChange={(e) => setname(e.target.value)} type="text" name="name" placeholder="名前" required/>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="text" name="email" placeholder="メールアドレス" required/>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="text" name="password" placeholder="パスワード" required/>
        <button>登録</button>
      </form>
    </div>
  )
}

export default StaffRegister