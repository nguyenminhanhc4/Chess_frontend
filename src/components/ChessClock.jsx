import React, { useState, useEffect, useRef } from "react";

const ChessClock = ({ initialTime, isActive, onTimeOut, playerColor }) => {
  const [time, setTime] = useState(initialTime);
  const timerRef = useRef(null);

  useEffect(() => {
    setTime(initialTime);
  }, [initialTime]);

  useEffect(() => {
    // Khi đồng hồ được kích hoạt, bắt đầu đếm ngược
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive]);

  useEffect(() => {
    // Nếu đồng hồ hết thời gian
    if (time <= 0) {
      clearInterval(timerRef.current);
      onTimeOut(playerColor);
    }
  }, [time, onTimeOut, playerColor]);

  // Định dạng hiển thị mm:ss
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return <div className="text-xl font-bold">{formattedTime}</div>;
};

export default ChessClock;
