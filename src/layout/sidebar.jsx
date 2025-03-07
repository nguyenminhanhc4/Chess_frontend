import PropTypes from "prop-types";

const Sidebar = ({ moveHistory, onSurrender, onUndo, onRedo, onRequestDraw }) => {
  // Nhóm các nước đi thành cặp dựa theo thuộc tính color
  const movePairs = [];
  for (let i = 0; i < moveHistory.length; i++) {
    // Nếu nước đi hiện tại của trắng
    if (moveHistory[i].color === "w") {
      const whiteMove = moveHistory[i].san;
      let blackMove = "";
      // Kiểm tra nếu phần tử kế tiếp tồn tại và có màu đen
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
      // Trường hợp nước đi không bắt đầu bằng trắng (rất hiếm)
      movePairs.push({
        moveNumber: movePairs.length + 1,
        white: "",
        black: moveHistory[i].san,
      });
    }
  }

  return (
    <aside className="min-h-screen bg-gray-800 text-white p-4 w-full flex flex-col">
      {/* Tiêu đề */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-center">Biên bản</h2>
      </div>

      {/* Danh sách nước đi */}
      <div className="flex-1 overflow-auto">
        <ul className="space-y-2">
          {movePairs.map((pair) => (
            <li key={pair.moveNumber} className="flex items-center p-2 bg-gray-700 rounded">
              <span className="font-bold w-6">{pair.moveNumber}.</span>
              <span className="mx-2">{pair.white}</span>
              {pair.black && <span className="ml-16 text-right">{pair.black}</span>}
            </li>
          ))}
        </ul>
      </div>

      {/* Các nút điều khiển */}
      <div className="mt-4">
        <div className="flex flex-col space-y-2">
          <button
            onClick={onSurrender}
            className="w-full p-2 bg-red-600 hover:bg-red-700 rounded"
          >
            Đầu hàng
          </button>
          <button
            onClick={onUndo}
            className="w-full p-2 bg-gray-600 hover:bg-gray-700 rounded"
          >
            Lùi lại
          </button>
          <button
            onClick={onRedo}
            className="w-full p-2 bg-gray-600 hover:bg-gray-700 rounded"
          >
            Tiến tới
          </button>
          <button
            onClick={onRequestDraw}
            className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Xin hòa
          </button>
        </div>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  moveHistory: PropTypes.array.isRequired,
  onSurrender: PropTypes.func.isRequired,
  onUndo: PropTypes.func.isRequired,
  onRedo: PropTypes.func.isRequired,
  onRequestDraw: PropTypes.func.isRequired,
};

export default Sidebar;
