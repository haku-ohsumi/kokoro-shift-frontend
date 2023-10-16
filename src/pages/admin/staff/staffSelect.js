import React, { useState, useEffect } from "react";

function StaffSelect() {
  const [staffUsers, setStaffUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5100/api/staffUsers") // バックエンドのエンドポイントにGETリクエストを送信
      .then((response) => response.json())
      .then((data) => setStaffUsers(data))
      .catch((error) => console.error("データの取得に失敗しました", error));
  }, []);

  return (
    <div>
      <h1>スタッフユーザー一覧</h1>
      <ul>
        {staffUsers.map((staffUser) => (
          <li key={staffUser._id}>{staffUser.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default StaffSelect;
