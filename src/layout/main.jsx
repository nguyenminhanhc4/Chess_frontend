import { useState, useEffect, useContext } from "react";
import { Chess } from "chess.js";
import Header from "./header";
import Nav from "./nav";
import Sidebar from "./sidebar";
import Footer from "./footer";
import ChessBoard from "../components/chessboard";
import GameResultPopup from "./GameResultPopup"; // Đảm bảo đường dẫn đúng
import { FaSyncAlt, FaRedoAlt } from "react-icons/fa";
import { UserAuthContext } from "../context/UserAuthContext"; // Import context để lấy thông tin user

// Hàm clone game để trigger re-render mà vẫn giữ lịch sử
const cloneGame = (gameInstance) => {
  return Object.assign(Object.create(Object.getPrototypeOf(gameInstance)), gameInstance);
};

const MainLayout = () => {
  const [game, setGame] = useState(new Chess());
  const [redoStack, setRedoStack] = useState([]);
  const [orientation, setOrientation] = useState("white");
  const [gameResult, setGameResult] = useState(null);
  
  // Lấy thông tin người dùng từ context
  const { user } = useContext(UserAuthContext);

  // Kiểm tra game over mỗi khi game thay đổi
  useEffect(() => {
    if (game.isGameOver()) {
      let result = "";
      // Giả sử người chơi là trắng ("w")
      const playerColor = "w";
      if (game.isCheckmate()) {
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

  // Lấy lượt hiện tại
  const isWhiteTurn = game.turn() === "w";
  const isBlackTurn = game.turn() === "b";

  // Hàm thực hiện nước đi mới
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
      setRedoStack((prev) => [...prev, undoneMove]);
      setGame(cloneGame(game));
    }
  };

  // Redo: tiến lại nước đi đã undo
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const moveToRedo = redoStack[redoStack.length - 1];
    const move = game.move(moveToRedo.san);
    if (move) {
      setRedoStack((prev) => prev.slice(0, prev.length - 1));
      setGame(cloneGame(game));
    }
  };

  // Đầu hàng: hiển thị popup thay vì alert
  const handleSurrender = () => {
    setGameResult("Bạn thua (đầu hàng)!");
  };

  // Xin hòa: hiện thông báo (chưa hoạt động)
  const handleRequestDraw = () => {
    alert("Chức năng xin hòa chưa được hỗ trợ!");
  };

  // Xoay bàn cờ: đồng thời xoay luôn thông tin hiển thị người chơi
  const handleToggleOrientation = () => {
    setOrientation((prev) => (prev === "white" ? "black" : "white"));
  };

  // Nút Ván mới: reset game
  const handleNewGame = () => {
    setGame(new Chess());
    setRedoStack([]);
    setGameResult(null);
  };

  // Nút Trang chủ trong popup: chuyển hướng về trang chủ
  const handleHome = () => {
    window.location.href = "/";
  };

  // Xử lý đóng popup: đặt lại gameResult thành null
  const handleClosePopup = () => {
    setGameResult(null);
  };

  // Lấy lịch sử nước đi (dạng verbose) để truyền cho Sidebar
  const moveHistory = game.history({ verbose: true });

  // Khối hiển thị thông tin đối thủ
  const opponentInfo = (
    <div className="flex items-center justify-center space-x-2 mb-2">
      <img
        src="./../public/vite.svg"
        alt="Opponent"
        className="w-8 h-8 rounded-full"
      />
      <div
        className={`text-white px-2 py-1 rounded ${
          isBlackTurn ? "bg-green-600" : "bg-gray-700"
        }`}
      >
        Bot (600)
      </div>
    </div>
  );

  // Khối hiển thị thông tin người chơi của bạn ("your info")
  // Nếu người dùng đã đăng nhập (tồn tại user), hiển thị tên và rating từ context,
  // ngược lại hiển thị thông tin mặc định
  const youInfo = (
    <div className="flex items-center justify-center space-x-2 mt-2">
      <img
        src={user && user.avatar ? user.avatar : "./../public/vite.svg"}
        alt="You"
        className="w-8 h-8 rounded-full"
      />
      <div
        className={`text-white px-2 py-1 rounded ${
          isWhiteTurn ? "bg-green-600" : "bg-gray-700"
        }`}
      >
        {user ? `${user.username} (${user.rating ?? "N/A"})` : "User (600)"}
      </div>
    </div>
  );

  // Khối chứa bàn cờ và nút điều khiển bên phải
  const boardBlock = (
    <div className="flex items-center">
      <ChessBoard 
        game={game} 
        handleMove={handleMove} 
        orientation={orientation}
      />
      <div className="ml-4 flex flex-col space-y-4">
        <button 
          onClick={handleToggleOrientation}
          className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          <FaSyncAlt size={24} />
        </button>
        <button 
          onClick={handleNewGame}
          className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          <FaRedoAlt size={24} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-grow">
        <div className="w-1/5 h-full border-r border-gray-300">
          <Nav />
        </div>

        {/* Khu vực trung tâm: thông tin người chơi + bàn cờ */}
        <div className="w-3/5 flex flex-col items-center justify-center">
          {orientation === "white" ? (
            <>
              {opponentInfo}
              {boardBlock}
              {youInfo}
            </>
          ) : (
            <>
              {youInfo}
              {boardBlock}
              {opponentInfo}
            </>
          )}
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
        <GameResultPopup
          result={gameResult}
          onHome={handleHome}
          onNewGame={handleNewGame}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
};

export default MainLayout;
