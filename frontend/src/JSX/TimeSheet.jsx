import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

export default function AttendanceCalendar() {
  const [markedDates, setMarkedDates] = useState([]);
  const [value, setValue] = useState(new Date());

  /*useEffect(() => {
    fetch("https://your-backend-url/api/attendance") // GET danh sách đã điểm danh
      .then(res => res.json())
      .then(data => setMarkedDates(data.map(d => dayjs(d.date).format('YYYY-MM-DD'))));
  }, []);

  const handleClickDay = (date) => {
    const formatted = dayjs(date).format('YYYY-MM-DD');

    fetch("https://your-backend-url/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: formatted })
    })
    .then(res => res.json())
    .then(() => {
      alert("Điểm danh thành công cho ngày " + formatted);
      setMarkedDates(prev => [...prev, formatted]);
    })
    .catch(() => alert("Lỗi khi điểm danh"));
  };
*/
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const formatted = dayjs(date).format('YYYY-MM-DD');
      if (markedDates.includes(formatted)) {
        return 'marked';
      }
    }
    return null;
  };

  return (
    <div>
      <h2>Lịch điểm danh</h2>
      <Calendar
        onChange={setValue}
        value={value}
        onClickDay={handleClickDay}
        tileClassName={tileClassName}
      />
    </div>
  );
}
