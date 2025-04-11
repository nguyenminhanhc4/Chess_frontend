import { useState, useEffect, useContext } from "react";
import { Chess } from "chess.js";
import Nav from "./nav";
import Sidebar from "./sidebar";
import ChessBoard from "../components/chessboard";
import GameResultPopup from "./GameResultPopup";
import { UserAuthContext } from "../context/UserAuthContext";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const baseURL = import.meta.env.VITE_API_URL;

const cloneGame = (gameInstance) => {
  return Object.assign(
    Object.create(Object.getPrototypeOf(gameInstance)),
    gameInstance
  );
};

const MainLayout = () => {
  const [game, setGame] = useState(new Chess());
  const [redoStack, setRedoStack] = useState([]);
  const [orientation, setOrientation] = useState("white");
  const [gameResult, setGameResult] = useState(null);
  // State cho độ khó của AI, mặc định "medium"
  const [difficulty, setDifficulty] = useState("medium");
  const difficultyRatings = {
    easy: "Dễ",
    medium: "Trung bình",
    hard: "Khó",
  };
  const { user } = useContext(UserAuthContext);
  const playerColor = orientation === "white" ? "w" : "b";

  // Thêm state gameStarted: false lúc mới vào
  const [gameStarted, setGameStarted] = useState(false);

  // Hàm cập nhật vị trí lên backend với chuỗi moves
  const updatePositionOnServer = async (moves) => {
    try {
      const response = await axios.post(
        `${baseURL}/api/engine/position`,
        moves,
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
        `${baseURL}/api/engine/go?difficulty=${difficulty}`
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
  }, [game, playerColor]);

  // Xử lý nước đi mới, tích hợp gọi API backend
  const handleMove = async (from, to, promotion = null) => {
    if (!gameStarted) {
      toast.error("Vui lòng bấm Chơi để bắt đầu ván cờ!");
      return false;
    }
    const move = game.move({ from, to, promotion });
    if (move) {
      setGame(cloneGame(game));
      setRedoStack([]);

      // Tạo chuỗi moves từ lịch sử nước đi
      const movesHistory = game.history({ verbose: true });
      const movesString = movesHistory.map((m) => m.from + m.to).join(" ");

      // Cập nhật vị trí lên backend với chuỗi moves
      await updatePositionOnServer(movesString);

      if (game.turn() !== playerColor) {
        let engineMoveSan = await getEngineMoveFromServer();

        if (engineMoveSan) {
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
      moves: game.history({ verbose: false }).join(" "),
      finalFen: game.fen(),
      result: result.toUpperCase(),
      userId: user.id,
    };

    try {
      const response = await axios.post(`${baseURL}/api/game/save`, gameData);
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
    setGameResult("LOSE");
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
    window.location.href = "/main";
  };

  const handleClosePopup = () => {
    setGameResult(null);
  };

  // Hàm onStartGame: khi người dùng bấm "Chơi" từ Sidebar ban đầu
  const onStartGame = async () => {
    // Random chọn hướng: nếu là "black" thì người chơi là đen, AI là trắng
    const randomOrientation = Math.random() < 0.5 ? "white" : "black";
    setOrientation(randomOrientation);
    setGameStarted(true);

    // Khởi tạo game mới
    const newGame = new Chess();
    setGame(newGame);
    setRedoStack([]);
    setGameResult(null);

    // Nếu người chơi là quân đen, AI (quân trắng) sẽ đi đầu tiên
    if (randomOrientation === "black") {
      // Lấy nước đi từ API engine
      let engineMoveSan = await getEngineMoveFromServer();
      // Áp dụng logic random theo độ khó (tương tự trong handleMove)
      if (engineMoveSan) {
        if (difficulty === "easy" && Math.random() < 0.7) {
          const legalMoves = newGame.moves({ verbose: true });
          if (legalMoves.length > 0) {
            const randomMove =
              legalMoves[Math.floor(Math.random() * legalMoves.length)];
            engineMoveSan = randomMove.from + randomMove.to;
            console.log("Easy mode random move (first move):", engineMoveSan);
          }
        } else if (difficulty === "medium" && Math.random() < 0.5) {
          const legalMoves = newGame.moves({ verbose: true });
          if (legalMoves.length > 0) {
            const randomMove =
              legalMoves[Math.floor(Math.random() * legalMoves.length)];
            engineMoveSan = randomMove.from + randomMove.to;
            console.log("Medium mode random move (first move):", engineMoveSan);
          }
        }
      }

      // Nếu có nước đi hợp lệ từ engine, thực hiện nước đi sau 800ms
      if (engineMoveSan) {
        setTimeout(() => {
          newGame.move(engineMoveSan);
          setGame(cloneGame(newGame));
        }, 800);
      }
    }
  };

  const moveHistoryArray = game.history({ verbose: true });

  // Giả sử opponentInfo và youInfo được tính toán như cũ (cho trường hợp chơi với BOT)
  const opponentInfo = (
    <div className="flex items-center justify-center space-x-2 mb-2">
      <img
        src="/robo_icon.jpg"
        alt="Opponent"
        className="w-6 h-6 md:w-8 md:h-8 rounded-full"
      />
      <div
        className={`text-white px-2 py-1 rounded ${
          game.turn() !== playerColor ? "bg-green-600" : "bg-gray-700"
        }`}>
        Bot ({difficultyRatings[difficulty]})
      </div>
    </div>
  );

  const youInfo = (
    <div className="flex items-center justify-center space-x-2 mt-2">
      <img
        src={
          user && user.profilePicture
            ? user.profilePicture
            : "/user_default.jpg"
        }
        alt="You"
        className="w-6 h-6 md:w-8 md:h-8 rounded-full"
      />
      <div
        className={`text-white px-2 py-1 rounded ${
          game.turn() === playerColor ? "bg-green-600" : "bg-gray-700"
        }`}>
        {user ? `${user.username} (${user.rating ?? "N/A"})` : "User (600)"}
      </div>
    </div>
  );

  const boardBlock = (
    <div className="flex items-center justify-center w-full p-4">
      <div
        className="relative"
        style={{ maxWidth: "95vw", aspectRatio: "1/1" }}>
        <ChessBoard
          game={game}
          handleMove={handleMove}
          orientation={orientation}
          playerColor={playerColor}
          transitionDuration={500}
          style={{
            transform: orientation === "black" ? "rotate(180deg)" : "none",
            transition: "transform 0.3s ease",
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-grow flex-col md:flex-row">
        <div className="w-full md:w-1/5 h-16 md:h-full border-b md:border-r border-gray-300">
          <Nav />
        </div>
        <div className="w-full md:w-3/5 flex flex-col items-center justify-center">
          <>
            {opponentInfo}
            {boardBlock}
            {youInfo}
          </>
        </div>
        <div className="w-full md:w-1/5 h-full border-t md:border-l border-gray-300">
          <Sidebar
            moveHistory={moveHistoryArray}
            onSurrender={handleSurrender}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onRequestDraw={handleRequestDraw}
            onNewGame={handleNewGame}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            gameStarted={gameStarted}
            onStartGame={onStartGame}
          />
        </div>
      </div>
      <ToastContainer />
      {gameResult && (
        <GameResultPopup
          result={gameResult}
          onHome={handleHome}
          onContinue={handleNewGame}
          onClose={handleClosePopup}
          isPvP={false}
        />
      )}
    </div>
  );
};

export default MainLayout;
