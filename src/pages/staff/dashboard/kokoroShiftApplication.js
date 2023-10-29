import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction';
import { BiArrowBack } from "react-icons/bi";

const KokoroShiftApplication = () => {
  const navigate = useNavigate();
  
  const [events, setEvents] = useState([]); 
  const [staffIdAdmin, setStaffIdAdmin] = useState(sessionStorage.getItem('staffId'));
  const [kokoroRisk, setKokoroRisk] = useState(null); 

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
              title: shift.title,
              start: shift.startTime,
              end: shift.endTime,
            }));
          setEvents(shiftEvents);
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

  const handleEventClick = (info) => {
    if (window.confirm('この日時にココロシフトを申請しますか？')) {
      const updatedEvents = events.filter((event) => event !== info.event.id);
      setEvents(updatedEvents);

    // バックエンドのAPIにイベントIDを送信してデータベース上のtitleを変更
    fetch(`http://localhost:5100/admin/kokoro-shift/application/${info.event.id}`, {
      method: 'PATCH', // データの更新にはPATCHメソッドを使用
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'ココロシフト申請中' }), // 変更後のtitleを指定
    })
      .then((response) => {
        if (response.ok) {
          alert('ココロシフトが申請されました');
          navigate("/staff/dashboard");
        } else {
          alert('ココロシフトの申請に失敗しました');
        }
      })
      .catch((error) => {
        alert('エラー:', error);
      });
    }
  };

  return (
    <div>
      <BiArrowBack
        onClick={() => navigate("/staff/dashboard")}
        className="back-button"
      />
      <h1 className="page-title">ココロシフト申請</h1>
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

export default KokoroShiftApplication;