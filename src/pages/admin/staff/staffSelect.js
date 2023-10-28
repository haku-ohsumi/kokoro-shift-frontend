import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction';

function StaffSelect() {
  const [staffUsers, setStaffUsers] = useState([]);
  const [latestWageUp, setLatestWageUp] = useState(null);
  const [events, setEvents] = useState([]); 

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5100/admin/staff/select") // バックエンドのエンドポイントにGETリクエストを送信
      .then((response) => response.json())
      .then((data) => setStaffUsers(data))
      .catch((error) => console.error("データの取得に失敗しました", error));
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

  useEffect(() => {
    fetch('http://localhost:5100/admin/shift/read') // バックエンドのエンドポイントにGETリクエストを送信
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
    // スタッフ名をクリックした際のハンドラー
    sessionStorage.setItem("staffIdAdmin", staffId);
    navigate("/admin/staffId/shift-management");
  };

  // ココロシフト時給アップ登録
  
  const [wageUp, setWageUp] = useState(100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:5100/admin/shift/wage-up/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wageUp }), // ここでデータを送信
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
      const response = await fetch(`http://localhost:5100/admin/staff/get-name/${staffId}`);
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

  return (
    <div>
      <h2>スタッフユーザー一覧</h2>
      <p>
        {staffUsers.map((staffUser) => (
          <li key={staffUser._id} onClick={() => handleStaffClick(staffUser._id)}>
          {staffUser.name}
        </li>
        ))}
      </p>
      <h2>ココロシフト時給アップ登録</h2>
      <form onSubmit={handleSubmit}>
      {latestWageUp !== null ? (
        <p>最新の時給アップ金額: {latestWageUp} 円</p>
      ) : (
        <p>最新の時給アップデータはありません</p>
      )}
        <label>
          ココロシフト時給アップ金額（円）
          <input
            type="number"
            value={wageUp}
            onChange={(e) => setWageUp(e.target.value)}
          />
        </label>
        <button type="submit">登録</button>
      </form>
      <div>
      <h2>シフト表</h2>
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
    </div>
  );
}

export default StaffSelect;
