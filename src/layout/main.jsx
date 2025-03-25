import { useState, useEffect, useContext } from "react";
import { Chess } from "chess.js";
import Header from "./header";
import Nav from "./nav";
import Sidebar from "./sidebar";
import Footer from "./footer";
import ChessBoard from "../components/chessboard";
import GameResultPopup from "./GameResultPopup";
import { UserAuthContext } from "../context/UserAuthContext";
import axios from "axios";

const cloneGame = (gameInstance) => {
  return Object.assign(
    Object.create(Object.getPrototypeOf(gameInstance)),
    gameInstance
  );
};

const MainLayout = () => {
  const [game, setGame] = useState(new Chess());
  const [redoStack, setRedoStack] = useState([]);
  const [orientation] = useState("white");
  const [gameResult, setGameResult] = useState(null);
  // State cho độ khó của AI, mặc định "medium"
  const [difficulty, setDifficulty] = useState("medium");

  const { user } = useContext(UserAuthContext);
  const playerColor = orientation === "white" ? "w" : "b";
  // Hàm cập nhật vị trí lên backend với chuỗi moves
  const updatePositionOnServer = async (moves) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/engine/position",
        moves, // Dữ liệu moves gửi trực tiếp trong body
        {
          headers: {
            "Content-Type": "text/plain",
          },
        }
      );
      console.log("Position updated:", response.data);
    } catch (error) {
      console.error("Error updating position:", error);
    }
  };

  // Hàm lấy nước đi của máy từ backend, truyền tham số độ khó
  const getEngineMoveFromServer = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/engine/go?difficulty=${difficulty}`
      );
      console.log("Engine move response:", response.data);

      // Giả sử kết quả trả về có dạng: "bestmove e2e4"
      const match = response.data.match(/bestmove\s(\w+)/);
      if (match && match[1]) {
        return match[1];
      }
      return null;
    } catch (error) {
      console.error("Error getting engine move:", error);
      return null;
    }
  };

  // Kiểm tra game over
  useEffect(() => {
    if (game.isGameOver()) {
      let result = "";
      const playerColor = "w";
      if (game.isCheckmate()) {
        result = game.turn() === playerColor ? "LOSE" : "WIN";
      } else if (game.isStalemate()) {
        result = "DRAW";
      } else if (game.isInsufficientMaterial()) {
        result = "DRAW";
      } else if (game.isThreefoldRepetition()) {
        result = "DRAW";
      } else {
        result = "DRAW";
      }

      setGameResult(result);
      saveGameToServer(result);
    }
  }, [game]);

  // Xử lý nước đi mới, tích hợp gọi API backend
  const handleMove = async (from, to, promotion = null) => {
    const move = game.move({ from, to, promotion });
    if (move) {
      setGame(cloneGame(game));
      setRedoStack([]);

      // Tạo chuỗi moves từ lịch sử nước đi
      const movesHistory = game.history({ verbose: true });
      const movesString = movesHistory.map((m) => m.from + m.to).join(" ");

      // Cập nhật vị trí lên backend với chuỗi moves
      await updatePositionOnServer(movesString);

      // Xác định màu người chơi dựa trên board orientation
      const playerColor = orientation === "white" ? "w" : "b";
      if (game.turn() !== playerColor) {
        let engineMoveSan = await getEngineMoveFromServer(); // Ví dụ: "e2e4"

        if (engineMoveSan) {
          // Áp dụng yếu tố ngẫu nhiên tùy theo độ khó
          if (difficulty === "easy" && Math.random() < 0.7) {
            const legalMoves = game.moves({ verbose: true });
            if (legalMoves.length > 0) {
              const randomMove =
                legalMoves[Math.floor(Math.random() * legalMoves.length)];
              engineMoveSan = randomMove.from + randomMove.to;
              console.log("Easy mode random move:", engineMoveSan);
            }
          } else if (difficulty === "medium" && Math.random() < 0.5) {
            const legalMoves = game.moves({ verbose: true });
            if (legalMoves.length > 0) {
              const randomMove =
                legalMoves[Math.floor(Math.random() * legalMoves.length)];
              engineMoveSan = randomMove.from + randomMove.to;
              console.log("Medium mode random move:", engineMoveSan);
            }
          }
        }

        if (engineMoveSan) {
          // Thêm delay để tạo hiệu ứng "suy nghĩ" cho AI
          setTimeout(() => {
            game.move(engineMoveSan);
            setGame(cloneGame(game));
          }, 800);
        }
        return true;
      }
      return true;
    }
    return false;
  };

  const saveGameToServer = async (result) => {
    if (!user) {
      console.log("Người chơi chưa đăng nhập, không lưu ván đấu.");
      return;
    }

    const gameData = {
      playerUsername: user.username,
      opponent: "Bot",
      opponentType: "BOT",
      moves: game.history({ verbose: false }).join(" "), // Lấy danh sách nước đi
      finalFen: game.fen(),
      result: result.toUpperCase(), // WIN, LOSE hoặc DRAW
    };

    try {
      const response = await axios.post(
        "http://localhost:8080/api/game/save",
        gameData
      );
      console.log("Ván đấu đã được lưu:", response.data);
    } catch (error) {
      console.error("Lỗi khi lưu ván đấu:", error);
    }
  };

  const handleUndo = () => {
    if (game.history().length === 0) return;
    const undoneMove = game.undo();
    if (undoneMove) {
      setRedoStack((prev) => [...prev, undoneMove]);
      setGame(cloneGame(game));
    }
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const moveToRedo = redoStack[redoStack.length - 1];
    const move = game.move(moveToRedo.san);
    if (move) {
      setRedoStack((prev) => prev.slice(0, prev.length - 1));
      setGame(cloneGame(game));
    }
  };

  const handleSurrender = () => {
    setGameResult("Bạn thua (đầu hàng)!");
    saveGameToServer("LOSE");
  };

  const handleRequestDraw = () => {
    alert("Chức năng xin hòa chưa được hỗ trợ!");
  };

  const handleNewGame = () => {
    setGame(new Chess());
    setRedoStack([]);
    setGameResult(null);
  };

  const handleHome = () => {
    window.location.href = "/";
  };

  const handleClosePopup = () => {
    setGameResult(null);
  };

  const moveHistory = game.history({ verbose: true });

  const opponentInfo = (
    <div className="flex items-center justify-center space-x-2 mb-2">
      <img
        src="../../public/robo_icon.jpg"
        alt="Opponent"
        className="w-8 h-8 rounded-full"
      />
      <div
        className={`text-white px-2 py-1 rounded ${
          game.turn() === "b" ? "bg-green-600" : "bg-gray-700"
        }`}>
        Bot (600)
      </div>
    </div>
  );

  const youInfo = (
    <div className="flex items-center justify-center space-x-2 mt-2">
      <img
        src={
          user && user.avatar ? user.avatar : "../../public/user_default.jpg"
        }
        alt="You"
        className="w-8 h-8 rounded-full"
      />
      <div
        className={`text-white px-2 py-1 rounded ${
          game.turn() === "w" ? "bg-green-600" : "bg-gray-700"
        }`}>
        {user ? `${user.username} (${user.rating ?? "N/A"})` : "User (600)"}
      </div>
    </div>
  );

  const boardBlock = (
    <div className="flex items-center">
      <ChessBoard
        game={game}
        handleMove={handleMove}
        orientation={orientation}
        playerColor={playerColor}
        transitionDuration={500}
      />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-grow">
        <div className="w-1/5 h-full border-r border-gray-300">
          <Nav />
        </div>

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
            onNewGame={handleNewGame}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
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
