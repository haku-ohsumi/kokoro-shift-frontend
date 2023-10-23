import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function StaffSelect() {
  const [staffUsers, setStaffUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5100/admin/staff/select") // バックエンドのエンドポイントにGETリクエストを送信
      .then((response) => response.json())
      .then((data) => setStaffUsers(data))
      .catch((error) => console.error("データの取得に失敗しました", error));
  }, []);

  const handleStaffClick = (staffId) => {
    // スタッフ名をクリックした際のハンドラー
    sessionStorage.setItem("staffIdAdmin", staffId);
    navigate("/admin/staffId/shift-management");
  };

  // ココロシフト時給アップ登録
  const [wageUp, setWageUp] = useState(100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:5100/api/wage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wageUp }), // ここでデータを送信
      });

      if (response.ok) {
        alert("ココロシフト時給アップが登録されました");
      } else {
        alert("ココロシフト時給アップの登録に失敗しました");
      }
    } catch (error) {
      alert("エラー:", error);
    }
  };

  return (
    <div>
      <h1>スタッフユーザー一覧</h1>
      <ul>
        {staffUsers.map((staffUser) => (
          <li key={staffUser._id} onClick={() => handleStaffClick(staffUser._id)}>
          {staffUser.name}
        </li>
        ))}
      </ul>
      <h2>ココロシフト時給アップ登録</h2>
      <form onSubmit={handleSubmit}>
        <label>
          ココロシフト時給アップ金額（円 / h）
          <input
            type="number"
            value={wageUp}
            onChange={(e) => setWageUp(e.target.value)}
          />
        </label>
        <button type="submit">登録</button>
      </form>
    </div>
  );
}

export default StaffSelect;
