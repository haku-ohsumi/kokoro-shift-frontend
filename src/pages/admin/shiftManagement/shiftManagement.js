import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const ShiftManagement = () => {
  const [events, setEvents] = useState([]); // シフトのイベントリスト

  const handleSelect = (slotInfo) => {
    // 新しいシフトを追加
    const newEvent = {
      title: "新しいシフト",
      start: slotInfo.start,
      end: slotInfo.end,
    };

    setEvents([...events, newEvent]);
  };

  const handleEventRemove = (event) => {
    // シフトを削除
    const updatedEvents = events.filter((e) => e !== event);
    setEvents(updatedEvents);
  };

  return (
    <div>
      <h1>シフト管理</h1>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelect}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: "#0074D9",
          },
        })}
        onSelectEvent={handleEventRemove}
      />
    </div>
  );
};

export default ShiftManagement;
