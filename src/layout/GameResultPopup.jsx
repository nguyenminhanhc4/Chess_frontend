import PropTypes from "prop-types";
import { GiChessKing } from "react-icons/gi";

const GameResultPopup = ({
  result,
  onHome, // Dành cho nút "Ván mới": quay về trang main để chọn lại độ khó
  onContinue, // Dành cho PvE: tạo ván mới với độ khó hiện tại ("Chơi tiếp")
  isPvP,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn">
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl w-80 md:w-96 flex flex-col items-center backdrop-blur-sm border border-gray-700">
        {/* Icon vua cờ */}
        <div className="absolute -top-8">
          <GiChessKing className="text-6xl text-indigo-500 drop-shadow-lg" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-white">
          Ván Cờ Kết Thúc {isPvP ? "(PvP)" : "(PvE)"}
        </h2>
        <p className="mt-4 text-lg text-center text-gray-300">{result}</p>
        {isPvP ? (
          // Giao diện cho PvP: 2 nút "Trang chủ" và "Ván mới"
          <div className="mt-6 flex space-x-4">
            <button
              onClick={onHome}
              className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-full hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105">
              Ván mới
            </button>
          </div>
        ) : (
          // Giao diện cho PvE: nút "Ván mới" (chọn lại độ khó) và nút "Chơi tiếp" (tiếp tục với độ khó hiện tại)
          <div className="mt-6 flex space-x-4">
            <button
              onClick={onHome}
              className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-full hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105">
              Ván mới
            </button>
            <button
              onClick={onContinue}
              className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-full hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105">
              Chơi tiếp
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

GameResultPopup.propTypes = {
  result: PropTypes.string.isRequired,
  onHome: PropTypes.func.isRequired,
  onNewGame: PropTypes.func, // Dành cho PvP
  onContinue: PropTypes.func, // Dành cho PvE
  isPvP: PropTypes.bool, // Nếu là true => PvP, nếu false hoặc không có => PvE
};

export default GameResultPopup;
