import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import Header from "./header";
import Nav from "./nav";
import Sidebar from "./sidebar";
import Footer from "./footer";
import ChessBoard from "../components/chessboard";

const cloneChess = (gameInstance) => {
  return Object.assign(Object.create(Object.getPrototypeOf(gameInstance)), gameInstance);
};

const MainLayout = () => {
  const [game, setGame] = useState(new Chess());
  const [redoStack, setRedoStack] = useState([]);
  const [orientation, setOrientation] = useState("white");

  // Sử dụng useEffect để log moveHistory mỗi khi game thay đổi
  useEffect(() => {
    console.log("moveHistory:", game.history({ verbose: true }));
  }, [game]);

  // Thực hiện nước đi mới; nếu thành công, xóa redoStack (redo chỉ hợp lệ khi Undo liên tục)
  const handleMove = (from, to, promotion = null) => {
    const move = game.move({ from, to, promotion });
    if (move) {
      setGame(cloneChess(game));
      setRedoStack([]);
      return true;
    }
    return false;
  };

  // Undo: lùi lại nước đi cuối cùng và lưu vào redoStack
  const handleUndo = () => {
    const newGame = new Chess(game.fen());
    const undoneMove = newGame.undo();
    if (undoneMove) {
      setRedoStack(prev => [...prev, undoneMove]);
      setGame(newGame);
    }
  };

  // Redo: tiến lại nước đi đã undo
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    // Lấy nước đi cuối cùng trong redoStack
    const moveToRedo = redoStack[redoStack.length - 1];
    const newGame = new Chess(game.fen());
    // Áp dụng lại nước đi đó theo SAN
    const move = newGame.move(moveToRedo.san);
    if (move) {
      setRedoStack(prev => prev.slice(0, prev.length - 1));
      setGame(newGame);
    }
  };

  // Đầu hàng: reset game và thông báo thất bại
  const handleSurrender = () => {
    alert("Bạn thua (đầu hàng)!");
    setGame(new Chess());
    setRedoStack([]);
  };

  // Xin hòa: hiện thông báo (chưa hoạt động)
  const handleRequestDraw = () => {
    alert("Chức năng xin hòa chưa được hỗ trợ!");
  };

  // Xoay bàn cờ
  const handleToggleOrientation = () => {
    setOrientation(prev => (prev === "white" ? "black" : "white"));
  };

  // Lấy lịch sử nước đi (dạng verbose) để hiển thị trong Sidebar
  const moveHistory = game.history({ verbose: true });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Nội dung chính: 3 cột */}
      <div className="flex flex-grow">
        {/* Nav ở bên trái */}
        <div className="w-1/5 h-full border-r border-gray-300">
          <Nav />
        </div>

        {/* ChessBoard ở giữa */}
        <div className="w-3/5 flex flex-col items-center justify-center">
          <ChessBoard 
            game={game} 
            handleMove={handleMove} 
            orientation={orientation}
          />
          {/* Các nút phụ cho bàn cờ nếu cần */}
          <div className="mt-4 flex space-x-4">
            <button 
              onClick={handleToggleOrientation}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Xoay bàn cờ
            </button>
            <button 
              onClick={() => { setGame(new Chess()); setRedoStack([]); }}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Ván mới
            </button>
          </div>
        </div>

        {/* Sidebar ở bên phải */}
        <div className="w-1/5 h-full border-l border-gray-300">
          <Sidebar 
            moveHistory={moveHistory}
            onSurrender={handleSurrender}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onRequestDraw={handleRequestDraw}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MainLayout;
