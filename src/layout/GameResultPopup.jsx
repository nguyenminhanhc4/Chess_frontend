import PropTypes from "prop-types";
import { GiChessKing } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";

const GameResultPopup = ({ result, onHome, onNewGame, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn">
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl w-80 md:w-96 flex flex-col items-center backdrop-blur-sm border border-gray-700">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors">
          <IoMdClose size={24} />
        </button>
        {/* Icon vua cờ nổi bật */}
        <div className="absolute -top-8">
          <GiChessKing className="text-6xl text-indigo-500 drop-shadow-lg" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-white">Ván Cờ Kết Thúc</h2>
        <p className="mt-4 text-lg text-center text-gray-300">{result}</p>
        {/* Ví dụ hiển thị thêm thống kê (nếu có) */}
        {/* <p className="mt-2 text-sm text-gray-400">Số nước đi: 42 - Thời gian: 12:34</p> */}
        <div className="mt-6 flex space-x-4">
          <button
            onClick={onHome}
            className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-full hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105">
            Trang chủ
          </button>
          <button
            onClick={onNewGame}
            className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-full hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105">
            Ván mới
          </button>
        </div>
      </div>
    </div>
  );
};

GameResultPopup.propTypes = {
  result: PropTypes.string.isRequired,
  onHome: PropTypes.func.isRequired,
  onNewGame: PropTypes.func.isRequired,
  onClose: PropTypes.func, // thêm prop onClose cho nút đóng
};

export default GameResultPopup;
