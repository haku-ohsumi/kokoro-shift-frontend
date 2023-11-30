import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction';

function StaffSelect() {
  const [staffUsers, setStaffUsers] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [latestWageUp, setLatestWageUp] = useState(null);
  const [events, setEvents] = useState([]); 

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BASE_URL}admin/staff/select`)
      .then((response) => response.json())
      .then((data) => setStaffUsers(data))
      .catch((error) => console.error("データの取得に失敗しました", error));
  }, []);

  useEffect(() => {
    // バックエンドのAPIエンドポイントからwageUpデータを読み取る
    fetch(`${process.env.REACT_APP_BASE_URL}admin/shift/wage-up/read`)
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

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BASE_URL}admin/shift/read`)
      .then((response) => response.json())
      .then((data) => {
            const shiftEvents = data.map((shift) => ({
              id: shift._id,
              title: shift.title,
              start: shift.startTime,
              end: shift.endTime,
              staffIdAdmin: shift.staffIdAdmin,
              wageUp: shift.wageUp
            }));
          setEvents(shiftEvents);
        })
      .catch((error) => console.error('シフトの取得に失敗しました', error));
  }, []);

  const handleStaffClick = (staffId) => {
    if (selectedStaff) {
      sessionStorage.setItem("staffIdAdmin", selectedStaff);
      navigate("/admin/staffId/shift-management");
    } else {
      navigate("/admin/staff-select"); // 選択していない場合の遷移先
    }
  };

  // ココロシフト時給アップ登録
  const [wageUp, setWageUp] = useState(100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}admin/shift/wage-up/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wageUp }),
      });

      if (response.ok) {
        alert("ココロシフト時給アップが登録されました");
      } else {
        alert("ココロシフト時給アップの登録に失敗しました");
      }
    } catch (error) {
      alert("エラー:", error);
    }
  };

  const fetchStaffName = async (staffId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}admin/staff/get-name/${staffId}`);
      if (response.ok) {
        const data = await response.json();
        return data.name;
      } else {
        return "スタッフ名不明";
      }
    } catch (error) {
      console.error("スタッフ名の取得に失敗しました", error);
      return "スタッフ名不明";
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
      <h1 className='page-title'>
        全員
        <p>全員分のシフトを表示しています</p>
        </h1>
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
          eventClassNames={(arg) => {
            const { event } = arg;
            if (event.title === 'ココロシフト申請中') {
              return 'kokoro-shift-application-event';}
            else if (event.title.includes('ココロシフト')) {
              return 'kokoro-shift-event';
            }
            return 'shift-event';
          }}
          eventMouseEnter={async (arg) => {
            const staffId = arg.event.extendedProps.staffIdAdmin;
            const staffName = await fetchStaffName(staffId);
            const tooltip = document.createElement('div');
            tooltip.className = 'event-tooltip';
            let tooltipContent = staffName;
  
            if (arg.event.extendedProps.wageUp) {
              tooltipContent += `<br/>時給${arg.event.extendedProps.wageUp}円Up`;
            }

            tooltip.innerHTML = tooltipContent;
            arg.el.appendChild(tooltip);
          }}
          eventMouseLeave={() => {
            // イベントからマウスが離れたときの処理
            const tooltips = document.querySelectorAll('.event-tooltip');
            tooltips.forEach((tooltip) => tooltip.remove());
          }}
        />
        </div>
        <h2>時給アップ登録</h2>
        <p>時給アップ登録では、ココロシフト承認時に何円時給アップするかを登録できます<br/>金額が大きいほどココロシフト承認されやすくなります</p>
      <form onSubmit={handleSubmit}>
      {latestWageUp !== null ? (
        <p>今の時給アップ金額: {latestWageUp} 円</p>
      ) : (
        <p>今の時給アップデータはありません</p>
      )}
        <label>
          時給アップ金額（円）
          <input
            type="number"
            value={wageUp}
            onChange={(e) => setWageUp(e.target.value)}
          />
        </label>
        <button type="submit">登録</button>
      </form>
            <button onClick={handleLogout}>ログアウト</button>
    </div>
  );
}

export default StaffSelect;
