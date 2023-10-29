import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction';
import { BiArrowBack } from "react-icons/bi";

const KokoroShiftAgreement = () => {
  const navigate = useNavigate();
  
  const [events, setEvents] = useState([]); 
  const [kokoroRisk, setKokoroRisk] = useState(null); 
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [latestWageUp, setLatestWageUp] = useState(null);

  useEffect(() => {
    const staffIdAdmin = sessionStorage.getItem("staffId");
    fetch('http://localhost:5100/admin/shift/read')
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
        const response = await fetch(`http://localhost:5100/admin/kokoro-risk/calculate/${staffIdAdmin}`);

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

  useEffect(() => {
    // バックエンドのAPIエンドポイントからwageUpデータを読み取る
    fetch("http://localhost:5100/admin/shift/wage-up/read")
      .then((response) => response.json())
      .then((data) => {
        // 最新のwageUpデータを取得
        if (Array.isArray(data) && data.length > 0) {
          const latestData = data[data.length - 1];
          setLatestWageUp(latestData.wageUp);
        }
      })
      .catch((error) => {
        console.error("ココロシフト時給アップの読み込みに失敗しました", error);
      });
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

    // バックエンドのAPIにイベントIDを送信してデータベース上のtitleなどを変更
    fetch(`http://localhost:5100/admin/kokoro-shift/agreement/${info.event.id}/${staffIdAdmin}/${latestWageUp}`, {
      method: 'PATCH', // データの更新にはPATCHメソッドを使用
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'ココロシフト', staffIdAdmin: staffIdAdmin, wageUp: latestWageUp}),
    })
      .then((response) => {
            // ココロシフトを追加
        setEvents([...events, { title: 'ココロシフト', start: startTime, end: endTime }]);
        setStartTime('');
        setEndTime('');

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
      <BiArrowBack
        onClick={() => navigate("/staff/dashboard")}
        className="back-button"
      />
      <h1 className="page-title">ココロシフト承認</h1>
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