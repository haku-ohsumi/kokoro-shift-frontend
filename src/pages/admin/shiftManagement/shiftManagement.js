import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction';

function ShiftForm() {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [events, setEvents] = useState([]); 
  const [staffNameAdmin, setStaffNameAdmin] = useState([]);
  const [kokoroRisk, setKokoroRisk] = useState(null); 
  const [staffUsers, setStaffUsers] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BASE_URL}admin/staff/select`)
      .then((response) => response.json())
      .then((data) => setStaffUsers(data))
      .catch((error) => console.error("データの取得に失敗しました", error));
  }, []);

  useEffect(() => {
    const staffIdAdmin = sessionStorage.getItem("staffIdAdmin");
    fetch(`${process.env.REACT_APP_BASE_URL}admin/shift/read`)
      .then((response) => response.json())
      .then((data) => {
        const filteredShifts = data.filter((shift) => shift.staffIdAdmin === staffIdAdmin);
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
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}admin/kokoro-risk/calculate/${staffIdAdmin}`);

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

      const fetchStaffName = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_BASE_URL}admin/staff/get-name/${staffIdAdmin}`);
          if (response.ok) {
            const data = await response.json();
            setStaffNameAdmin(data.name)
            return data.name;
          } else {
            return "スタッフ名不明";
          }
        } catch (error) {
          console.error("スタッフ名の取得に失敗しました", error);
          return "スタッフ名不明";
        }
      };
      fetchStaffName();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // StaffIDをセッションストレージから取得
    const staffIdAdmin = sessionStorage.getItem("staffIdAdmin");
    
    if (!staffIdAdmin) {
      alert("スタッフIDが見つかりません");
      return;
    }

    // カレンダーのイベントを更新
    setEvents([...events, { title: 'Shift', start: startTime, end: endTime }]);
    
    setStartTime('');
    setEndTime('');

    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}admin/${staffIdAdmin}/shift-management`, {
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
      if (window.confirm('このシフトを削除しますか？')) {
        const updatedEvents = events.filter((event) => event !== info.event.id);
        info.event.remove()
        setEvents(updatedEvents);
  
        // バックエンドのAPIにイベントIDを送信してデータベースからも削除
        fetch(`${process.env.REACT_APP_BASE_URL}admin/shift/delete/${info.event.id}`, {
          method: 'DELETE',
        })
          .then((response) => {
            if (response.ok) {
              alert('シフトが削除されました');
            } else {
              alert('シフトの削除に失敗しました');
            }
          })
          .catch((error) => {
            alert('エラー:', error);
          });
      }
  };

  const handleStaffClick = (staffId) => {
    if (selectedStaff) {
      sessionStorage.setItem("staffIdAdmin", selectedStaff);
      navigate("/admin/staffId/shift-management");
      window.location.reload();
    } else {
      navigate("/admin/staff-select"); // 選択していない場合の遷移先
    }
  };

  const handleLogout = () => {
    // セッションストレージをクリア
    window.sessionStorage.clear();
    // ログアウト後にスタッフログイン画面に遷移
    navigate('/admin/user/login');
  }


  return (
    <div>
      <h1 className='page-title'>{staffNameAdmin}      <div>
      {kokoroRisk ? (
        <>
          {kokoroRisk === 'KokoroBad' && (
            <p>このスタッフのココロリスクは高いです</p>
          )}
          {kokoroRisk === 'KokoroNeutral' && (
            <p>このスタッフのココロリスクは普通です</p>
          )}
          {kokoroRisk === 'KokoroGood' && (
            <p>このスタッフのココロリスクは低いです</p>
          )}
        </>
      ) : (
        <p>ココロリスクを読み込んでいます...</p>
      )}
      </div></h1>
        <div>
        <h2>シフト表</h2>
      <p>
      <select value={selectedStaff} onChange={(e) => setSelectedStaff(e.target.value)}>
        <option value="">全員</option>
        {staffUsers.map((staffUser) => (
          <option key={staffUser._id} value={staffUser._id}>
            {staffUser.name}
          </option>
        ))}
      </select>
      <button onClick={() => handleStaffClick(selectedStaff)}>選択</button>
      </p>
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
        <h2>シフト追加</h2>
      <form onSubmit={handleFormSubmit}>
        <div>
          <label>開始:</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div>
          <label>終了:</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
        <button type="submit">保存</button>
      </form>
      <button onClick={handleLogout}>ログアウト</button>
    </div>
  );
}

export default ShiftForm;

