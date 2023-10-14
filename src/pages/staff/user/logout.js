// import { useNavigate } from "react-router-dom";

const StaffLogout = () => {
  // ログアウトボタンをクリックしたときの処理
  const handleLogout = () => {
    // セッションストレージをクリア
    window.sessionStorage.clear();
  }

  // ログアウトボタンの表示
  return (
    <div>
      {/* ログアウトボタン */}
      <button onClick={handleLogout}>ログアウト</button>
    </div>
  );
}

export default StaffLogout





