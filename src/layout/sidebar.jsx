import { useState } from "react";
import PropTypes from "prop-types";
import {
  FaUndo,
  FaRedo,
  FaHandPaper,
  FaPlus,
  FaChessKnight,
  FaChessQueen,
  FaChessPawn,
  FaPlay,
} from "react-icons/fa";

const Sidebar = ({
  moveHistory,
  onSurrender,
  onUndo,
  onRedo,
  onNewGame,
  difficulty,
  onDifficultyChange,
  gameStarted,
  onStartGame,
}) => {
  const [showConfirmSurrender, setShowConfirmSurrender] = useState(false);
  const [showConfirmNewGame, setShowConfirmNewGame] = useState(false);

  // Nếu game chưa bắt đầu, hiển thị giao diện chọn độ khó bằng các nút
  if (!gameStarted) {
    return (
      <aside className="min-h-screen bg-gray-800 text-white p-6 w-full flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-6">Chọn độ khó</h2>
        <div className="flex flex-col space-y-4 w-full max-w-xs">
          <button
            onClick={() => onDifficultyChange("easy")}
            className={`py-3 rounded-lg text-lg font-medium transition-colors ${
              difficulty === "easy"
                ? "bg-green-500 shadow-lg"
                : "bg-gray-700 hover:bg-gray-600"
            }`}>
            <div className="flex items-center justify-center">
              <FaChessPawn className="mr-2" />
              <span>Dễ</span>
            </div>
          </button>
          <button
            onClick={() => onDifficultyChange("medium")}
            className={`py-3 rounded-lg text-lg font-medium transition-colors ${
              difficulty === "medium"
                ? "bg-yellow-500 shadow-lg"
                : "bg-gray-700 hover:bg-gray-600"
            }`}>
            <div className="flex items-center justify-center">
              <FaChessKnight className="mr-2" />
              <span>Trung bình</span>
            </div>
          </button>
          <button
            onClick={() => onDifficultyChange("hard")}
            className={`py-3 rounded-lg text-lg font-medium transition-colors ${
              difficulty === "hard"
                ? "bg-red-500 shadow-lg"
                : "bg-gray-700 hover:bg-gray-600"
            }`}>
            <div className="flex items-center justify-center">
              <FaChessQueen className="mr-2" />
              <span>Khó</span>
            </div>
          </button>
        </div>
        <button
          onClick={onStartGame}
          className="mt-8 px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center shadow-lg"
          title="Chơi">
          <FaPlay size={24} className="text-white" />
          <span className="ml-3 text-xl font-semibold">Chơi</span>
        </button>
      </aside>
    );
  }

  // Nếu game đã bắt đầu, hiển thị giao diện biên bản và các nút điều khiển với icon
  const movePairs = [];
  for (let i = 0; i < moveHistory.length; i++) {
    if (moveHistory[i].color === "w") {
      const whiteMove = moveHistory[i].san;
      let blackMove = "";
      if (i + 1 < moveHistory.length && moveHistory[i + 1].color === "b") {
        blackMove = moveHistory[i + 1].san;
        i++;
      }
      movePairs.push({
        moveNumber: movePairs.length + 1,
        white: whiteMove,
        black: blackMove,
      });
    } else {
      movePairs.push({
        moveNumber: movePairs.length + 1,
        white: "",
        black: moveHistory[i].san,
      });
    }
  }

  return (
    <aside className="min-h-screen bg-gray-800 text-white p-4 w-full flex flex-col relative">
      {/* Popup xác nhận đầu hàng */}
      {showConfirmSurrender && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-bold mb-4">
              Bạn có chắc chắn muốn đầu hàng?
            </h3>
            <p className="mb-4">Ván đấu sẽ kết thúc nếu bạn đồng ý.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  onSurrender();
                  setShowConfirmSurrender(false);
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded shadow">
                Đồng ý
              </button>
              <button
                onClick={() => setShowConfirmSurrender(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded shadow">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup xác nhận ván mới */}
      {showConfirmNewGame && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-bold mb-4">
              Bạn có chắc chắn muốn bắt đầu ván mới?
            </h3>
            <p className="mb-4">Ván đấu hiện tại sẽ bị mất nếu bạn đồng ý.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  onNewGame();
                  setShowConfirmNewGame(false);
                }}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded shadow">
                Đồng ý
              </button>
              <button
                onClick={() => setShowConfirmNewGame(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded shadow">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tiêu đề */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center">Biên bản</h2>
        <hr className="border-gray-600 mt-2" />
      </div>

      {/* Bảng lịch sử nước đi */}
      <div className="flex-1 overflow-auto max-h-[450px] mb-6 custom-scrollbar">
        {movePairs.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-700">
                <th className="px-2 py-1 text-left">#</th>
                <th className="px-2 py-1 text-left">Trắng</th>
                <th className="px-2 py-1 text-left">Đen</th>
              </tr>
            </thead>
            <tbody>
              {movePairs.map((pair) => (
                <tr key={pair.moveNumber} className="hover:bg-gray-600">
                  <td className="px-2 py-1">{pair.moveNumber}.</td>
                  <td className="px-2 py-1">{pair.white}</td>
                  <td className="px-2 py-1">{pair.black}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center">Chưa có nước đi nào.</p>
        )}
      </div>

      {/* Các nút điều khiển */}
      <div className="flex flex-col space-y-3">
        <button
          onClick={onUndo}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md shadow">
          <FaUndo size={18} />
          <span>Lùi lại</span>
        </button>
        <button
          onClick={onRedo}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-md shadow">
          <FaRedo size={18} />
          <span>Tiến tới</span>
        </button>
        <button
          onClick={() => setShowConfirmNewGame(true)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-md shadow"
          title="Ván mới">
          <FaPlus size={18} />
          <span>Ván mới</span>
        </button>
        <button
          onClick={() => setShowConfirmSurrender(true)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md shadow">
          <FaHandPaper size={18} />
          <span>Đầu hàng</span>
        </button>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  moveHistory: PropTypes.array.isRequired,
  onSurrender: PropTypes.func.isRequired,
  onUndo: PropTypes.func.isRequired,
  onRedo: PropTypes.func.isRequired,
  onNewGame: PropTypes.func,
  difficulty: PropTypes.string.isRequired,
  onDifficultyChange: PropTypes.func.isRequired,
  gameStarted: PropTypes.bool.isRequired,
  onStartGame: PropTypes.func.isRequired,
};

export default Sidebar;
