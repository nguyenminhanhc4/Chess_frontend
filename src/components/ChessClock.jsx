// ChessClock.jsx
import { useState, useEffect } from "react";

const ChessClock = ({
  initialTime,
  increment,
  isActive,
  onTimeOut,
  playerColor,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  // Khi không active, thêm increment vào thời gian
  useEffect(() => {
    if (!isActive) {
      setTimeLeft((prev) => prev + increment);
    }
  }, [isActive, increment]);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0) {
      onTimeOut(playerColor);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onTimeOut, playerColor]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  // Tính % tiến trình của đồng hồ dựa vào thời gian còn lại
  const progressPercent = (timeLeft / initialTime) * 100;

  // Các mốc thời gian (75%, 50%, 25%)
  const milestones = [75, 50, 25];

  return (
    <div className="chess-clock-container">
      <div className="time-display">{formatTime(timeLeft)}</div>
      <div className="progress-bar">
        <div
          className="progress"
          style={{ width: `${progressPercent}%` }}></div>
        {milestones.map((m, index) => (
          <div
            key={index}
            className="milestone-marker"
            style={{ left: `${m}%` }}
            title={`${m}%`}></div>
        ))}
      </div>
    </div>
  );
};

export default ChessClock;
