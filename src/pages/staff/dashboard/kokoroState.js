import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction';
import OpenAI from 'openai';

const KokoroStateForm = () => {
  const navigate = useNavigate();
  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY, dangerouslyAllowBrowser: true
  });
    
  const [answer, setAnswer] = useState([]); 
  const [kokoroState, setKokoroState] = useState(0); // 初期値を5に設定
  const [State, setState] = useState([]);
  const [events, setEvents] = useState([]); 
  const [wageUp, setWageUp] = useState([]); 
  const [latestwageUp, setLatestWageUp] = useState([]); 
  const [staffName, setStaffName] = useState(sessionStorage.getItem('staffName'));
  const [kokoroRisk, setKokoroRisk] = useState(null); 
  const [kokoroShiftApplied, setKokoroShiftApplied] = useState(false);
  
  const handleKokoroStateChange = (e) => {
    setState(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ChatGPT機能
    async function getChatCompletion() {
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{"role": "user", "content": `コメントについて、この人の心の状態は「良い」「悪い」か「普通」か三択で答えて。答え方は「良い」などと単語のみで答えて。コメント:${State}`}],
      });

      const answer = chatCompletion.choices[0].message.content;
      let kokoroState = 0;

      if (answer === "良い") {
        kokoroState = 10;
      } else if (answer === "普通") {
        kokoroState = 7;
      } else if (answer === "悪い") {
        kokoroState = 2;
      } else {
        alert("AI分析中にエラーが発生しました");
      }
      console.log(chatCompletion.choices[0].message.content);
      console.log(kokoroState);

          // StaffIDをセッションストレージから取得
    const staffId = sessionStorage.getItem("staffId");

    if (!staffId) {
      alert("StaffIDが見つかりません");
      return;
    }

          // APIにデータを送信
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}staff/kokoro/state/${staffId}`, {
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
    }

    getChatCompletion();
    
  };

  useEffect(() => {


    const staffIdAdmin = sessionStorage.getItem("staffId");
    fetch(`${process.env.REACT_APP_BASE_URL}admin/shift/read`)
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
              wageUp: shift.wageUp,
            }));
          setEvents(shiftEvents);
          // shiftEvents 配列の各要素から wageUp を取得する
          const wageUpValues = shiftEvents.map((event) => event.wageUp);
          // wageUpValues 配列からユニークな wageUp 値を抽出する
          const uniqueWageUpValues = [...new Set(wageUpValues)];
          const wageUp = uniqueWageUpValues.length > 0 ? uniqueWageUpValues[0] : null;
          setWageUp(wageUp);


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
                alert('ココロシフト申請が却下されました');
                // バックエンドのAPIにイベントIDを送信してデータベース上のtitleを変更
                fetch(`${process.env.REACT_APP_BASE_URL}admin/kokoro-shift/dismiss/${eventId}`, {
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

      // バックエンドのAPIからココロシフト時給アップデータを読み取る
      fetch(`${process.env.REACT_APP_BASE_URL}admin/shift/wage-up/read`)
      .then((response) => response.json())
      .then((data) => {
        // 配列から最後の要素を取得
        const latestWageUpData = data[data.length - 1];
        // 最新のデータからwageUpプロパティを取得
        const latestWageUp = latestWageUpData.wageUp;

        // 最新のwageUpをStateに設定
        setLatestWageUp(latestWageUp);
      })
      .catch((error) => {
        console.error("ココロシフト時給アップデータの読み込みに失敗しました", error);
      });
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
    navigate('/staff/kokoro-shift/agreement');
  };

  const handleEventClick = (info) => {
    const event = info.event; // クリックされたイベントオブジェクト
    if (event.extendedProps.wageUp !== undefined) {
      alert(`時給 ${event.extendedProps.wageUp} 円UP！`);
    }
  };

    return (
    <div>
            <h1 className="page-title">{staffName}</h1>
      <div>
      <h2>ココロシフト</h2>
      {kokoroShiftApplied && (
          <p>ココロシフト申請中</p>
        )}
      <div>
      {kokoroRisk ? (
        <>
          {kokoroRisk === 'KokoroBad' && (
            <p>今のあなたのココロリスクは高いです</p>
          )}
          {kokoroRisk === 'KokoroNeutral' && (
            <p>今のあなたのココロリスクは普通です</p>
          )}
          {kokoroRisk === 'KokoroGood' && (
            <p>今のあなたのココロリスクは低いです</p>
          )}
        </>
      ) : (
        <p>ココロリスクを読み込んでいます...</p>
      )}
      </div>
      {kokoroRisk === 'KokoroBad' && !kokoroShiftApplied && (
      <button onClick={handleKokoroShiftApplication}>ココロシフト申請ページへ</button>
      )}
      {kokoroRisk === 'KokoroGood' && (
      <div>
      {latestwageUp && <p>今ココロシフトを承認すると時給が{latestwageUp}円UP！</p>}
      <button onClick={handleKokoroShiftAgreement}>ココロシフト承認ページへ</button>
      </div>
      )}
      </div>
      <h2>ココロ日記</h2>
      <form onSubmit={handleSubmit}>
        <label>
        <p>今日のココロ日記:　
        <input type="text" minlength="10" maxlength="50" onChange={handleKokoroStateChange}/>
        </p>
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
          eventClick={handleEventClick}
                  />
                      </div>
      </form>
{/* ログアウトボタン */}
      <button onClick={handleLogout}>ログアウト</button>
    </div>
  );
};

export default KokoroStateForm;
