import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction';

const KokoroShiftAgreement = () => {
  const navigate = useNavigate();
  
  const [events, setEvents] = useState([]); 
  const [staffIdAdmin, setStaffIdAdmin] = useState(sessionStorage.getItem('staffId'));
  const [kokoroRisk, setKokoroRisk] = useState(null); 
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    const staffIdAdmin = sessionStorage.getItem("staffId");
    fetch('http://localhost:5100/admin/shift/read') // バックエンドのエンドポイントにGETリクエストを送信
      .then((response) => response.json())
      .then((data) => {
      // すべてのシフトデータを取得
      const allShifts = data;

      // 1. staffIdAdmin に一致するシフトをフィルタリング
      const filteredShifts = allShifts.filter((shift) => shift.staffIdAdmin === staffIdAdmin);
      const filteredShiftEvents = filteredShifts.map((shift) => ({
        id: shift._id,
        title: shift.title,
        start: shift.startTime,
        end: shift.endTime,
      }));

      // 2. title が "ココロシフト申請中" に一致するシフトをフィルタリング
      const kokoroShifts = allShifts.filter((shift) => shift.title === "ココロシフト申請中");
      const kokoroShiftEvents = kokoroShifts.map((shift) => ({
        id: shift._id,
        title: shift.title,
        start: shift.startTime,
        end: shift.endTime,
    }));

    // 両方のデータセットを結合して setEvents にセット
    setEvents([...filteredShiftEvents, ...kokoroShiftEvents]);
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

  const handleEventClick = (info) => {
      // ここで info.event.id からクリックされたココロシフトの詳細を取得し、時間の重複をチェック
  const clickedShift = events.find((event) => event.id === info.event.id);
  const event = info.event; // クリックされたイベントオブジェクト

  // クリックされたイベントの start と end 情報を取得
  const startTime = event.start;
  const endTime = event.end;

  // 重複チェックのための関数を作成
  const isTimeOverlap = (eventA, eventB) => {
    const startA = new Date(eventA.start);
    const endA = new Date(eventA.end);
    const startB = new Date(eventB.start);
    const endB = new Date(eventB.end);

    return (startA < endB && endA > startB);
  };

  // 重複するココロシフトがあるかチェック
  const hasTimeOverlap = events.some((event) => {
    return event.id !== info.event.id && isTimeOverlap(event, clickedShift);
  });

    if (hasTimeOverlap) {
      alert('時間が重複しているココロシフトがあります。承認できません。');
    } else {
    if (window.confirm('このココロシフトを承認しますか？')) {
      const staffIdAdmin = sessionStorage.getItem("staffId");
      const updatedEvents = events.filter((event) => event !== info.event.id);
      setEvents(updatedEvents);

    // バックエンドのAPIにイベントIDを送信してデータベース上のtitleを変更
    fetch(`http://localhost:5100/admin/kokoro-shift/agreement/${info.event.id}/${staffIdAdmin}`, {
      method: 'PATCH', // データの更新にはPATCHメソッドを使用
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'シフト', staffIdAdmin: staffIdAdmin  }), // 変更後のtitleを指定
    })
      .then((response) => {
            // ココロシフトを追加
        setEvents([...events, { title: 'Shift', start: startTime, end: endTime }]);
        
        setStartTime('');
        setEndTime('');

        try {
          const response = fetch(`http://localhost:5100/admin/shift-management/${staffIdAdmin}/${startTime}/${endTime}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ }),
          });
        } catch (error) {
          alert("Error:", error);
        }
        if (response.ok) {
          alert('ココロシフトが承認されました');
          navigate("/staff/dashboard");
        } else {
          alert('ココロシフトの承認に失敗しました');
        }
      })
      .catch((error) => {
        alert('エラー:', error);
      });
     }
    }
  };

  

  return (
    <div>
      <h1>ココロシフト承認</h1>
      <h3>今ココロシフトを承認すると時給が円UP！</h3>
        <div>
        <FullCalendar
          plugins= {[timeGridPlugin, interactionPlugin]}
          initialView= 'timeGridWeek'
          events={events}
          eventClick={handleEventClick}
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
    </div>
  );
}

export default KokoroShiftAgreement;