import React, { useState, useEffect, useRef } from "react";

const ChessClock = ({
  initialTime,
  isActive,
  onTimeOut,
  playerColor,
  increment,
}) => {
  const [time, setTime] = useState(initialTime);
  const timerRef = useRef(null);
  const prevIsActive = useRef(isActive);

  useEffect(() => {
    setTime(initialTime);
    console.log(
      `[ChessClock ${playerColor}] initialTime updated:`,
      initialTime
    );
  }, [initialTime, playerColor]);

  useEffect(() => {
    if (prevIsActive.current && !isActive) {
      // Cộng thêm thời gian increment
      setTime((prevTime) => prevTime + (increment || 0));
      console.log(`[ChessClock ${playerColor}] Increment added:`, increment);
    }
    prevIsActive.current = isActive;
  }, [isActive, increment, playerColor]);

  useEffect(() => {
    if (isActive) {
      console.log(`[ChessClock ${playerColor}] Starting timer.`);
      timerRef.current = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime - 1;
          console.log(`[ChessClock ${playerColor}] time:`, newTime);
          return newTime;
        });
      }, 1000);
    } else {
      console.log(`[ChessClock ${playerColor}] Timer paused.`);
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, playerColor]);

  useEffect(() => {
    // Nếu đồng hồ hết thời gian
    if (time <= 0) {
      clearInterval(timerRef.current);
      console.log(`[ChessClock ${playerColor}] Time out.`);
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
