import React, { useState } from "react";

const HeartStateForm = () => {
  const [heartState, setHeartState] = useState(5); // 初期値を5に設定

  const handleHeartStateChange = (e) => {
    const selectedState = parseInt(e.target.value, 10); // 選択された値を数値に変換
    setHeartState(selectedState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // APIにデータを送信
    try {
      const response = await fetch("APIのエンドポイント", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ heartState }),
      });

      if (response.status === 200) {
        console.log("データが正常に送信されました");
      } else {
        console.error("データの送信中にエラーが発生しました");
      }
    } catch (error) {
      console.error("エラーが発生しました", error);
    }
  };

  return (
    <div>
      <h1>ココロの状態を選択</h1>
      <form onSubmit={handleSubmit}>
        <label>
          ココロの状態:
          <select value={heartState} onChange={handleHeartStateChange}>
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

export default HeartStateForm;
