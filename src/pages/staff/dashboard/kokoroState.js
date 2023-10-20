import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction';

const KokoroStateForm = () => {
  const navigate = useNavigate();
  
  const [kokoroState, setKokoroState] = useState(5); // 初期値を5に設定
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [events, setEvents] = useState([]); 
  const [staffIdAdmin, setStaffIdAdmin] = useState(sessionStorage.getItem('staffId'));
  const [kokoroRisk, setKokoroRisk] = useState(null); 

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

  useEffect(() => {
    const staffIdAdmin = sessionStorage.getItem("staffId");
    fetch('http://localhost:5100/admin/shift/read') // バックエンドのエンドポイントにGETリクエストを送信
      .then((response) => response.json())
      .then((data) => {
        const filteredShifts = data.filter((shift) => shift.staffIdAdmin === staffIdAdmin);
            console.log('Filtered Shifts:', filteredShifts);
            // console.log('staffIdAdmin (left):', shift.staffIdAdmin); // staffIdAdmin の値をコンソールに出力
            // console.log('staffIdAdmin (right):', staffIdAdmin);
            const shiftEvents = filteredShifts.map((shift) => ({
              id: shift._id,
              title: 'Shift',
              start: shift.startTime,
              end: shift.endTime,
            }));
          setEvents(shiftEvents);
        })
      .catch((error) => console.error('シフトの取得に失敗しました', error));

      async function fetchKokoroRisk() {
      try {
        const response = await fetch(`http://localhost:5100/api/calculate-kokoro-risk/${staffIdAdmin}`);

        if (response.ok) {
          const kokoroRiskData = await response.json();
          console.log(kokoroRiskData)
          setKokoroRisk(kokoroRiskData.kokoroRisk); 
        } else {
          console.error('ココロリスクの取得に失敗しました');
        }
      } catch (error) {
        console.error('エラー:', error);
      }}
      fetchKokoroRisk();
  }, []);

  const handleLogout = () => {
    // セッションストレージをクリア
    window.sessionStorage.clear();

    // ログアウト後にスタッフログイン画面に遷移
    navigate('/staff/user/login');
  }

  return (
    <div>
      <div>
      {kokoroRisk ? (
        <p>{kokoroRisk}</p>
      ) : (
        <p>ココロリスクを読み込んでいます...</p>
      )}
      </div>
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
        <div>
        <FullCalendar
          plugins= {[timeGridPlugin, interactionPlugin]}
          initialView= 'timeGridWeek'
          events={events}
          // eventClick={handleEventClick}
        />
        </div>
      </form>
      {/* ログアウトボタン */}
      <button onClick={handleLogout}>ログアウト</button>
    </div>
  );
};

export default KokoroStateForm;
