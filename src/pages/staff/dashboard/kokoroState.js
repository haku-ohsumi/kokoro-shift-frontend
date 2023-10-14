import React, { useState } from "react";

const KokoroStateForm = () => {
  const [kokoroState, setKokoroState] = useState(5); // 初期値を5に設定

  const handleKokoroStateChange = (e) => {
    const selectedState = parseInt(e.target.value, 10); // 選択された値を数値に変換
    setKokoroState(selectedState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // StaffIDをセッションストレージから取得
    const staffId = sessionStorage.getItem("staffId");

    if (!staffId) {
      alert("StaffIDが見つかりません");
      return;
    }

    // APIにデータを送信
    try {
      const response = await fetch(`http://localhost:5100/staff/kokoro/state/${staffId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ kokoroState }),
      });

      if (response.status === 200) {
        alert("データが正常に送信されました");
      } else {
        alert("データの送信中にエラーが発生しました");
      }
    } catch (error) {
      alert("エラーが発生しました");
      console.error("エラーが発生しました", error);
    }
  };

  return (
    <div>
      <h1>ココロの状態を選択</h1>
      <form onSubmit={handleSubmit}>
        <label>
          ココロの状態:
          <select value={kokoroState} onChange={handleKokoroStateChange}>
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">送信</button>
      </form>
    </div>
  );
};

export default KokoroStateForm;
