import React from "react";
import PropTypes from "prop-types";

const EvalBar = ({ evaluation, height = "100%", width = "25px" }) => {
  const maxValue = 200;
  // Chuẩn hóa giá trị evaluation:
  // 1 => hoàn toàn ưu thế trắng, 0 => hoàn toàn ưu thế đen.
  const normalized = Math.max(
    Math.min((evaluation + maxValue) / (2 * maxValue), 1),
    0
  );
  const whitePercent = normalized * 100; // phần ưu thế trắng (xuất hiện ở dưới)
  const blackPercent = 100 - whitePercent; // phần ưu thế đen (xuất hiện ở trên)

  return (
    <div
      style={{ width, height }}
      className="relative flex flex-col bg-gray-300 rounded-lg overflow-hidden shadow-lg border border-gray-600">
      {/* Phần ưu thế đen (ở trên) */}
      <div
        className="bg-black transition-all duration-300"
        style={{ height: `${blackPercent}%` }}
      />
      {/* Phần ưu thế trắng (ở dưới) */}
      <div
        className="bg-white transition-all duration-300"
        style={{ height: `${whitePercent}%` }}
      />
      {/* Hiển thị giá trị evaluation */}
      {evaluation >= 0 ? (
        <div className="absolute bottom-0 left-0 w-full flex items-center justify-center text-xs font-bold text-black p-1">
          {`+${evaluation}`}
        </div>
      ) : (
        <div className="absolute top-0 left-0 w-full flex items-center justify-center text-xs font-bold text-white p-1">
          {evaluation}
        </div>
      )}
    </div>
  );
};

EvalBar.propTypes = {
  evaluation: PropTypes.number.isRequired,
  height: PropTypes.string,
  width: PropTypes.string,
};

export default EvalBar;
