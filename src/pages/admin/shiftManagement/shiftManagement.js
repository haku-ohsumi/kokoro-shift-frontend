// import React, { useState, useEffect } from "react";
// import { Calendar, momentLocalizer } from "react-big-calendar";
// import moment from "moment";
// import "react-big-calendar/lib/css/react-big-calendar.css";

// const localizer = momentLocalizer(moment);

// const ShiftManagement = () => {
//   const [events, setEvents] = useState([]);
//   const [newShift, setNewShift] = useState({ title: "", start: null, end: null });

  
//   useEffect(() => {
//     // バックエンドからシフトデータを取得し、setEvents で更新
//     // 例: fetchShifts().then((data) => setEvents(data));
//   }, []);

//   const handleAddShift = () => {
//     if (newShift.start && newShift.end) {
//       // 新しいシフトをバックエンドに送信
//       fetch("http://localhost:5100/shifts", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(newShift),
//       })
//         .then((response) => {
//           if (response.status === 200) {
//             return response.json();
//           } else {
//             throw new Error("Failed to create shift.");
//           }
//         })
//         .then((createdShift) => {
//           // シフトが正常に作成された場合、events ステートを更新
//           setEvents([...events, createdShift]);
//           setNewShift({ title: "", start: null, end: null });
//         })
//         .catch((error) => {
//           console.error("Error creating shift:", error);
//         });
//     }
//   };

//   const handleEventRemove = (event) => {
//     // シフトを削除し、バックエンドに送信
//     // 例: deleteShift(event.id).then(() => {
//     //        const updatedEvents = events.filter((e) => e.id !== event.id);
//     //        setEvents(updatedEvents);
//     //      });
//   };

//   return (
//     <div>
//       <h1>シフト管理</h1>
//       <div>
//         <h2>新しいシフトを追加</h2>
//         <div>
//           <label>開始時間:</label>
//           <input
//             type="datetime-local"
//             value={newShift.start}
//             onChange={(e) => setNewShift({ ...newShift, start: e.target.value })}
//           />
//         </div>
//         <div>
//           <label>終了時間:</label>
//           <input
//             type="datetime-local"
//             value={newShift.end}
//             onChange={(e) => setNewShift({ ...newShift, end: e.target.value })}
//           />
//         </div>
//         <button onClick={handleAddShift}>シフトを追加</button>
//       </div>
//       <Calendar
//         localizer={localizer}
//         events={events}
//         startAccessor="start"
//         endAccessor="end"
//         selectable
//         onSelectSlot={handleAddShift}
//         eventPropGetter={(event) => ({
//           style: {
//             backgroundColor: "#0074D9",
//           },
//         })}
//         onSelectEvent={handleEventRemove}
//         view={['week']}  // 週表示のみを許可
//       />
//     </div>
//   );
// };

// export default ShiftManagement;

import React, { useState } from 'react';

function WorkTimeForm() {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5100/api/save-work-time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startTime, endTime }),
      });

      if (response.ok) {
        console.log("Work time saved successfully.");
      } else {
        console.error("Failed to save work time.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
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
  );
}

export default WorkTimeForm;

