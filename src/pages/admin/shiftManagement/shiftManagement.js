import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction';

function ShiftForm() {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [events, setEvents] = useState([]); 

  useEffect(() => {
    // セッションストレージから staffIdAdmin を取得
    // const sessionStaffIdAdmin = sessionStorage.getItem('staffIdAdmin');
    // if (sessionStaffIdAdmin) {
    //   setStaffIdAdmin(sessionStaffIdAdmin);
    // }
  }, []);

  useEffect(() => {
    const staffIdAdmin = sessionStorage.getItem("staffIdAdmin");
    fetch('http://localhost:5100/api/shifts') // バックエンドのエンドポイントにGETリクエストを送信
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

  const handleEventClick = (info,arg) => {
      if (window.confirm('このイベントを削除しますか？')) {
        const updatedEvents = events.filter((event) => event !== info.event.id);
        info.event.remove()
        setEvents(updatedEvents);
  
        // バックエンドのAPIにイベントIDを送信してデータベースからも削除
        fetch(`http://localhost:5100/api/delete-event/${info.event.id}`, {
          method: 'DELETE',
        })
          .then((response) => {
            if (response.ok) {
              console.log('イベントが削除されました');
            } else {
              console.error('イベントの削除に失敗しました');
            }
          })
          .catch((error) => {
            console.error('エラー:', error);
          });
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
          plugins= {[timeGridPlugin, interactionPlugin]}
          initialView= 'timeGridWeek'
          events={events}
          eventClick={handleEventClick}
        />
        </div>
    </div>
  );
}

export default ShiftForm;

