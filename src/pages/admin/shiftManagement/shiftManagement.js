import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid'

function ShiftForm() {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [events, setEvents] = useState([]); 
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5100/api/shifts') // バックエンドのエンドポイントにGETリクエストを送信
      .then((response) => response.json())
      .then((data) => {
        const shiftEvents = data.map((shift) => ({
          title: 'Shift',
          start: shift.startTime,
          end: shift.endTime,
        }));
        setEvents(shiftEvents);
      })
      .catch((error) => console.error('データの取得に失敗しました', error));
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // StaffIDをセッションストレージから取得
    const staffIdAdmin = sessionStorage.getItem("staffIdAdmin");

    if (!staffIdAdmin) {
      alert("StaffIDが見つかりません");
      return;
    }

    // カレンダーのイベントを更新
    setEvents([...events, { title: 'Shift', start: startTime, end: endTime }]);
    
    setStartTime('');
    setEndTime('');

    try {
      const response = await fetch(`http://localhost:5100/admin/${staffIdAdmin}/shift-management`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startTime, endTime }),
      });

      if (response.ok) {
        alert("シフトが保存されました");
      } else {
        alert("シフトが保存できませんでした");
      }
    } catch (error) {
      alert("Error:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleFormSubmit}>
        <div>
          <label>勤務開始予定時間:</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div>
          <label>勤務終了予定時間:</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
        <button type="submit">保存</button>
      </form>
        <div>
        <FullCalendar
          plugins= {[timeGridPlugin]}
          initialView= 'timeGridWeek'
          events={events}
        />
        </div>
    </div>
  );
}

export default ShiftForm;

