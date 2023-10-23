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
  const [kokoroShiftApplied, setKokoroShiftApplied] = useState(false);

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


            const kokoroShifts = filteredShifts.filter((shift) => shift.title === "ココロシフト申請中");
            // "ココロシフト申請中" のシフトがある場合、ココロシフト申請中と表示
            if (kokoroShifts.length > 0) {
              setKokoroShiftApplied(true); // ココロシフト申請がある場合に true に設定
            }

            const shiftEvents = filteredShifts.map((shift) => ({
              id: shift._id,
              title: shift.title,
              start: shift.startTime,
              end: shift.endTime,
            }));
          setEvents(shiftEvents);


              // 24時間以内のココロシフトがあるかどうかをチェック
              const currentDateTime = new Date();
              const twentyFourHourslater = new Date(currentDateTime);
              twentyFourHourslater.setHours(currentDateTime.getHours() + 24);
              console.log(twentyFourHourslater)
  
              const hasKokoroShiftWithin24Hours = kokoroShifts.some((shift) => {
                const startTime = new Date(shift.startTime);
                console.log(startTime)
                return startTime < twentyFourHourslater;
              });
              console.log(hasKokoroShiftWithin24Hours)
  
              if (hasKokoroShiftWithin24Hours) {
                console.log(kokoroShifts)
                const eventId = kokoroShifts.map((shift) => shift._id);
                alert('ココロシフトが却下されました');
                // バックエンドのAPIにイベントIDを送信してデータベース上のtitleを変更
                fetch(`http://localhost:5100/admin/kokoro-shift/dismiss/${eventId}`, {
                  method: 'PATCH', // データの更新にはPATCHメソッドを使用
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ title: 'シフト' }), // 変更後のtitleを指定
                })
                  .catch((error) => {
                    alert('エラー:', error);
                  });
              }
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

  const handleKokoroShiftApplication = () => {
    // ココロシフト申請ボタンがクリックされたときに /staff/kokoro-shift/application に遷移
    navigate('/staff/kokoro-shift/application');
  };

  const handleKokoroShiftAgreement = () => {
    // ココロシフト申請ボタンがクリックされたときに /staff/kokoro-shift/application に遷移
    navigate('/staff/kokoro-shift/agreement');
  };

  return (
    <div>
      <div>
      {kokoroRisk === 'KokoroBad' && !kokoroShiftApplied && (
      <button onClick={handleKokoroShiftApplication}>ココロシフト申請</button>
      )}
      {kokoroRisk === 'KokoroGood' && (
      <button onClick={handleKokoroShiftAgreement}>ココロシフト承認</button>
      )}
      </div>
      {kokoroShiftApplied && (
          <p>ココロシフト申請中</p>
        )}
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
          eventClassNames={(arg) => {
            const { event } = arg;
            if (event.title === 'ココロシフト申請中') {
              return 'kokoro-shift-application-event';}
            else if (event.title.includes('ココロシフト')) {
              return 'kokoro-shift-event';
            }
            return 'shift-event';
          }}
        />
        </div>
      </form>
      {/* ログアウトボタン */}
      <button onClick={handleLogout}>ログアウト</button>
    </div>
  );
};

export default KokoroStateForm;
