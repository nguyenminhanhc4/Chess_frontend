import PropTypes from "prop-types";
import {
  FaUndo,
  FaRedo,
  FaHandPaper,
  FaPlus,
  FaChessKnight,
} from "react-icons/fa";

const Sidebar = ({
  moveHistory,
  onSurrender,
  onUndo,
  onRedo,
  onNewGame,
  difficulty,
  onDifficultyChange,
}) => {
  // Nhóm các nước đi thành cặp dựa theo thuộc tính color
  const movePairs = [];
  for (let i = 0; i < moveHistory.length; i++) {
    if (moveHistory[i].color === "w") {
      const whiteMove = moveHistory[i].san;
      let blackMove = "";
      if (i + 1 < moveHistory.length && moveHistory[i + 1].color === "b") {
        blackMove = moveHistory[i + 1].san;
        i++; // bỏ qua nước đi đen vừa lấy
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
    <aside className="min-h-screen bg-gray-800 text-white p-4 w-full flex flex-col">
      {/* Phần tiêu đề */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-center">Biên bản</h2>
        <hr className="border-gray-600 mt-2" />
      </div>

      {/* Lịch sử nước đi */}
      <div className="flex-1 overflow-auto max-h-[450px] mb-4 custom-scrollbar">
        {movePairs.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">#</th>
                <th className="text-left">Trắng</th>
                <th className="text-left">Đen</th>
              </tr>
            </thead>
            <tbody>
              {movePairs.map((pair) => (
                <tr key={pair.moveNumber} className="hover:bg-gray-700">
                  <td className="p-1">{pair.moveNumber}.</td>
                  <td className="p-1">{pair.white}</td>
                  <td className="p-1">{pair.black}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center">Chưa có nước đi nào.</p>
        )}
      </div>

      {/* Control Row: Dropdown độ khó & Nút Ván mới */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <FaChessKnight className="text-white mr-2" />
          <select
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="p-2 bg-gray-700 text-white rounded border border-gray-600">
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </select>
        </div>
        {onNewGame && (
          <button
            onClick={onNewGame}
            className="p-2 bg-purple-500 hover:bg-purple-600 rounded"
            title="Ván mới">
            <FaPlus className="text-white" />
          </button>
        )}
      </div>

      {/* Các nút điều khiển khác */}
      <div className="flex flex-col space-y-2">
        <button
          onClick={onUndo}
          className="w-full flex items-center justify-center space-x-2 p-2 bg-blue-500 hover:bg-blue-600 rounded">
          <FaUndo />
          <span>Lùi lại</span>
        </button>
        <button
          onClick={onRedo}
          className="w-full flex items-center justify-center space-x-2 p-2 bg-green-500 hover:bg-green-600 rounded">
          <FaRedo />
          <span>Tiến tới</span>
        </button>
        <button
          onClick={onSurrender}
          className="w-full flex items-center justify-center space-x-2 p-2 bg-red-500 hover:bg-red-600 rounded">
          <FaHandPaper />
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
};

export default Sidebar;
