import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import Header from "./header";
import Nav from "./nav";
import Sidebar from "./sidebar";
import Footer from "./footer";
import ChessBoard from "../components/chessboard";
import GameResultPopup from "./GameResultPopup"; // Đảm bảo đường dẫn đúng
import { FaSyncAlt, FaRedoAlt } from "react-icons/fa";


// Hàm clone game để trigger re-render mà vẫn giữ lịch sử
const cloneGame = (gameInstance) => {
  return Object.assign(Object.create(Object.getPrototypeOf(gameInstance)), gameInstance);
};

const MainLayout = () => {
  const [game, setGame] = useState(new Chess());
  const [redoStack, setRedoStack] = useState([]);
  const [orientation, setOrientation] = useState("white");
  const [gameResult, setGameResult] = useState(null);

  // Kiểm tra game over mỗi khi game thay đổi
  useEffect(() => {
    if (game.isGameOver()) {
      let result = "";
      // Giả sử bạn có playerColor lưu trong state; nếu không, giả sử người chơi là trắng ("w")
      const playerColor = "w"; 
      if (game.isCheckmate()) {
        // Nếu lượt đi hiện hành chính là màu người chơi, nghĩa là người chơi bị chiếu hết, còn nếu không thì người chơi thắng.
        result = game.turn() === playerColor 
          ? "Bạn thua (chiếu hết)!" 
          : "Bạn đã thắng!";
      } else if (game.isStalemate()) {
        result = "Stalemate!";
      } else if (game.isInsufficientMaterial()) {
        result = "Hòa (không đủ quân)!";
      } else if (game.isThreefoldRepetition()) {
        result = "Hòa (lặp lại ba lần)!";
      } else {
        result = "Hòa!";
      }
      setGameResult(result);
    }
  }, [game]);
  

  // Hàm thực hiện nước đi mới; sử dụng cùng một instance và clone lại để giữ lịch sử
  const handleMove = (from, to, promotion = null) => {
    const move = game.move({ from, to, promotion });
    if (move) {
      setGame(cloneGame(game));
      setRedoStack([]);
      return true;
    }
    return false;
  };

  // Undo: lùi lại nước đi cuối cùng và lưu vào redoStack
  const handleUndo = () => {
    if (game.history().length === 0) return;
    const undoneMove = game.undo();
    if (undoneMove) {
      setRedoStack(prev => [...prev, undoneMove]);
      setGame(cloneGame(game));
    }
  };

  // Redo: tiến lại nước đi đã undo
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const moveToRedo = redoStack[redoStack.length - 1];
    const move = game.move(moveToRedo.san);
    if (move) {
      setRedoStack(prev => prev.slice(0, prev.length - 1));
      setGame(cloneGame(game));
    }
  };

  // Đầu hàng: reset game và thông báo thất bại
  const handleSurrender = () => {
    alert("Bạn thua (đầu hàng)!");
    setGame(new Chess());
    setRedoStack([]);
    setGameResult(null);
  };

  // Xin hòa: hiện thông báo (chưa hoạt động)
  const handleRequestDraw = () => {
    alert("Chức năng xin hòa chưa được hỗ trợ!");
  };

  // Xoay bàn cờ
  const handleToggleOrientation = () => {
    setOrientation(prev => (prev === "white" ? "black" : "white"));
  };

  // Nút Ván mới trong popup: reset game
  const handleNewGame = () => {
    setGame(new Chess());
    setRedoStack([]);
    setGameResult(null);
  };

  // Nút Trang chủ trong popup: chuyển hướng về trang chủ
  const handleHome = () => {
    // Ví dụ: chuyển hướng về trang chủ, bạn có thể dùng react-router hoặc window.location
    window.location.href = "/";
  };

  // Lấy lịch sử nước đi (dạng verbose) để truyền cho Sidebar
  const moveHistory = game.history({ verbose: true });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-grow">
        <div className="w-1/5 h-full border-r border-gray-300">
          <Nav />
        </div>

        {/* Container bàn cờ và nút bấm được sắp xếp theo hàng ngang */}
        <div className="w-3/5 flex items-center justify-center">
          <ChessBoard 
            game={game} 
            handleMove={handleMove} 
            orientation={orientation}
          />
          {/* Nút bấm bên phải bàn cờ */}
          <div className="ml-4 flex flex-col space-y-4">
            <button 
              onClick={handleToggleOrientation}
              className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              <FaSyncAlt size={24} />
            </button>
            <button 
              onClick={() => { setGame(new Chess()); setRedoStack([]); setGameResult(null); }}
              className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <FaRedoAlt size={24} />
            </button>
          </div>
        </div>

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

      {gameResult && (
        <GameResultPopup result={gameResult} onHome={handleHome} onNewGame={handleNewGame} />
      )}
    </div>
  );
};

export default MainLayout;
