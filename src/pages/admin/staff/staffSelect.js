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
    </div>
  );
}

export default StaffSelect;
