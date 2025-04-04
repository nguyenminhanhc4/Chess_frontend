import { useState, useEffect, useContext, useRef } from "react";
import { Chess } from "chess.js";
import Header from "./header";
import Nav from "./nav";
import Sidebar from "./PvpSidebar";
import Footer from "./footer";
import ChessBoard from "../components/chessboard";
import GameResultPopup from "./GameResultPopup";
import { UserAuthContext } from "../context/UserAuthContext";
import axios from "axios";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import {
  FaSpinner,
  FaTimes,
  FaCommentAlt,
  FaArrowLeft,
  FaSearch,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChessClock from "../components/ChessClock";

// Helper function để clone đối tượng Chess (để trigger re-render)
const cloneGame = (gameInstance) => {
  return Object.assign(
    Object.create(Object.getPrototypeOf(gameInstance)),
    gameInstance
  );
};

// Hàm chuyển đổi mốc thời gian sang số giây ban đầu
const getInitialTime = (timeControl) => {
  switch (timeControl) {
    case "1+0":
      return 60; // 1 phút
    case "1+1":
      return 60; // 1 phút
    case "2+1":
      return 120; // 2 phút
    case "3+0":
      return 180; // 3 phút
    case "3+2":
      return 180; // 3 phút
    case "5+0":
      return 300; // 5 phút
    case "10+0":
      return 600; // 10 phút
    case "15+10":
      return 900; // 15 phút
    case "30+0":
      return 1800; // 30 phút
    case "1d":
      return 86400; // 1 ngày
    case "3d":
      return 259200; // 3 ngày
    case "7d":
      return 604800; // 7 ngày
    default:
      return 300; // mặc định 5 phút nếu không có
  }
};

const PvpPage = () => {
  // Các state chính
  const [game, setGame] = useState(new Chess());
  const [redoStack, setRedoStack] = useState([]);
  const [orientation, setOrientation] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const { user } = useContext(UserAuthContext);
  const [matchInfo, setMatchInfo] = useState(null);
  const [stompClient, setStompClient] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [gameSaved, setGameSaved] = useState(false);
  const gameSavedRef = useRef(false);
  const [loadingMatch, setLoadingMatch] = useState(false);
  // Popup modal duy nhất để chọn kiểu chơi và tìm trận
  const [showPopup, setShowPopup] = useState(true);
  // Lưu kiểu chơi (mốc thời gian): "1+0", "1+1", "2+1", "3+0", "3+2", "5+0", "10+0", "15+10", "30+0", "1d", "3d", "7d"
  const [gameMode, setGameMode] = useState(() => {
    return localStorage.getItem("gameMode") || "standard";
  });
  // activeColor quản lý lượt đồng hồ ("w" hay "b")
  const [activeColor, setActiveColor] = useState("w");

  // State lưu thông tin đối thủ đầy đủ
  const [opponentData, setOpponentData] = useState(null);

  // Tính thời gian ban đầu từ mốc thời gian; nếu gameMode không phải là các giá trị thời gian thì mặc định 5 phút
  const initialTime =
    gameMode &&
    [
      "1+0",
      "1+1",
      "2+1",
      "3+0",
      "3+2",
      "5+0",
      "10+0",
      "15+10",
      "30+0",
      "1d",
      "3d",
      "7d",
    ].includes(gameMode)
      ? getInitialTime(gameMode)
      : 300;

  const getIncrement = (timeControl) => {
    switch (timeControl) {
      case "1+0":
        return 0;
      case "1+1":
        return 1;
      case "2+1":
        return 1;
      case "3+0":
        return 0;
      case "3+2":
        return 2;
      case "5+0":
        return 0;
      case "10+0":
        return 0;
      case "15+10":
        return 10;
      case "30+0":
        return 0;
      case "1d":
        return 0;
      case "3d":
        return 0;
      case "7d":
        return 0;
      default:
        return 0;
    }
  };
  const incrementValue = getIncrement(gameMode);
  const boardOrientation = orientation || "white";
  const playerColor = boardOrientation === "white" ? "w" : "b";
  const gameOverSentRef = useRef(false);
  const matchInfoRef = useRef();
  useEffect(() => {
    matchInfoRef.current = matchInfo;
  }, [matchInfo]);

  useEffect(() => {
    localStorage.setItem("gameMode", gameMode);
  }, [gameMode]);

  useEffect(() => {
    if (matchInfo) {
      setLoadingMatch(false);
      setShowPopup(false);
    }
  }, [matchInfo]);

  useEffect(() => {
    if (matchInfo && user) {
      const opponentUsername =
        user.username === matchInfo.white ? matchInfo.black : matchInfo.white;
      axios
        .get(`http://localhost:8080/api/users/username/${opponentUsername}`)
        .then((response) => {
          setOpponentData(response.data);
        })
        .catch((error) =>
          console.error("Error fetching opponent data:", error)
        );
    }
  }, [matchInfo, user]);

  useEffect(() => {
    console.log("Component mounted");
    return () => {
      console.log("Component unmounted");
    };
  }, []);

  // Hàm xử lý khi đồng hồ hết giờ
  const handleTimeOut = (color) => {
    console.log(`Đồng hồ của ${color} hết giờ!`);
    if (color === playerColor) {
      setGameResult("LOSE");
    } else {
      setGameResult("WIN");
    }
    if (stompClient && stompClient.connected) {
      const payload = {
        sender: user.username,
        matchId: matchInfo ? matchInfo.matchId : null,
        result: color === playerColor ? "LOSE" : "WIN",
      };
      stompClient.publish({
        destination: "/app/game-over",
        body: JSON.stringify(payload),
      });
    }
    saveGameToServer(color === playerColor ? "LOSE" : "WIN");
    setGameSaved(true);
    gameSavedRef.current = true;
  };

  const updatePositionOnServer = async (moves) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/engine/position",
        moves,
        { headers: { "Content-Type": "text/plain" } }
      );
      console.log("Position updated:", response.data);
    } catch (error) {
      console.error("Error updating position:", error);
    }
  };

  const saveGameToServer = async (result) => {
    if (!user) {
      console.log("User not logged in, cannot save game.");
      return;
    }
    const currentMatchInfo = matchInfoRef.current;
    const opponent = currentMatchInfo
      ? user.username === currentMatchInfo.white
        ? currentMatchInfo.black
        : currentMatchInfo.white
      : "Chưa có đối thủ";
    const movesHistory = game.history({ verbose: false });
    const gameData = {
      matchId: matchInfo?.matchId,
      playerUsername: user.username,
      opponent: opponent,
      opponentType: currentMatchInfo ? "HUMAN" : "BOT",
      moves: movesHistory.length > 0 ? movesHistory.join(" ") : "No moves",
      finalFen: game.fen(),
      result: result.toUpperCase(),
    };

    console.log("Current matchInfo (from ref):", currentMatchInfo);
    console.log("Game data before saving:", gameData);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/game/save",
        gameData
      );
      console.log("Game saved:", response.data);
    } catch (error) {
      console.error("Error saving game:", error);
    }
  };

  useEffect(() => {
    if (game.isGameOver() && !gameSavedRef.current) {
      // Nếu game kết thúc do checkmate:
      // - Nếu game.turn() (màu của người bị chiếu) trùng với playerColor thì chính client này bị chiếu và thua
      // - Ngược lại, client này thắng.
      let result = game.isCheckmate()
        ? game.turn() === playerColor
          ? "LOSE"
          : "WIN"
        : "DRAW";

      setGameResult(result);

      if (stompClient && stompClient.connected) {
        const payload = {
          sender: user.username,
          matchId: matchInfo.matchId,
          result: result, // Gửi kết quả tính toán từ góc nhìn của client này
        };

        stompClient.publish({
          destination: "/app/game-over",
          body: JSON.stringify(payload),
        });

        console.log("Game over broadcast sent:", payload);
      }

      saveGameToServer(result);
      setGameSaved(true);
      gameSavedRef.current = true;
    }
  }, [game, gameSaved, matchInfo, stompClient]);

  const sendMove = (moveData) => {
    if (stompClient && stompClient.connected) {
      const payload = {
        sender: user.username,
        from: moveData.from,
        to: moveData.to,
        promotion: moveData.promotion,
        matchId: matchInfo ? matchInfo.matchId : null,
      };
      stompClient.publish({
        destination: "/app/move",
        body: JSON.stringify(payload),
      });
      console.log("Move sent:", payload);
    }
  };

  const handleMove = async (from, to, promotion = null) => {
    if (!matchInfo) {
      toast.info(
        "Bạn chưa tìm được trận. Vui lòng tìm trận để di chuyển quân cờ."
      );
      return false;
    }
    const piece = game.get(from);
    if (!piece || piece.color !== playerColor) {
      toast.error("Invalid move: Bạn chỉ được di chuyển quân cờ của mình.");
      return false;
    }
    const move = game.move({ from, to, promotion });
    if (move) {
      setGame(cloneGame(game));
      setRedoStack([]);
      setActiveColor(game.turn());
      const movesHistory = game.history({ verbose: true });
      const movesString = movesHistory.map((m) => m.from + m.to).join(" ");
      await updatePositionOnServer(movesString);
      sendMove(move);
      return true;
    }
    return false;
  };

  const handleSendDrawRequest = () => {
    const drawRequest = {
      sender: user.username,
      msgType: "draw_request",
      matchId: matchInfo ? matchInfo.matchId : null,
      text: "Xin hòa",
    };
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: "/app/chat",
        body: JSON.stringify(drawRequest),
      });
      console.log("Draw request sent:", drawRequest);
    }
    setChatMessages((prev) => [...prev, drawRequest]);
  };

  const handleSendDrawResponse = (accepted) => {
    const drawResponse = {
      sender: user.username,
      msgType: "draw_response",
      accepted,
      matchId: matchInfo ? matchInfo.matchId : null,
      text: accepted ? "Đồng ý xin hòa" : "Từ chối xin hòa",
    };

    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: "/app/chat",
        body: JSON.stringify(drawResponse),
      });
      console.log("Draw response sent:", drawResponse);
    }
    setChatMessages((prev) => [...prev, drawResponse]);

    if (accepted && !gameSavedRef.current && !gameOverSentRef.current) {
      setGameResult("DRAW");
      gameOverSentRef.current = true;
      const payload = {
        sender: user.username,
        matchId: matchInfo ? matchInfo.matchId : null,
        result: "DRAW",
      };
      if (stompClient && stompClient.connected) {
        stompClient.publish({
          destination: "/app/game-over",
          body: JSON.stringify(payload),
        });
        console.log("Draw accepted, game over broadcast sent:", payload);
      }
      saveGameToServer("DRAW");
      setGameSaved(true);
      gameSavedRef.current = true;
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
    if (stompClient && stompClient.connected) {
      const payload = {
        sender: user.username,
        matchId: matchInfo ? matchInfo.matchId : null,
      };
      stompClient.publish({
        destination: "/app/surrender",
        body: JSON.stringify(payload),
      });
      console.log("Surrender sent:", payload);
      const gameOverPayload = {
        sender: user.username,
        matchId: matchInfo ? matchInfo.matchId : null,
        result: "LOSE",
      };
      stompClient.publish({
        destination: "/app/game-over",
        body: JSON.stringify(gameOverPayload),
      });
      console.log("Game over broadcast sent (surrender):", gameOverPayload);
    }
    setGameResult("Bạn thua (đầu hàng)!");
    if (!gameSavedRef.current) {
      saveGameToServer("LOSE");
      setGameSaved(true);
      gameSavedRef.current = true;
    }
  };

  const handleNewGame = () => {
    setGame(new Chess());
    setRedoStack([]);
    setGameResult(null);
    setGameSaved(false);
    gameSavedRef.current = false;
  };

  const handleHome = () => {
    window.location.href = "/online";
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleSendChat = (msg) => {
    const chatMsg = {
      sender: user.username,
      text: msg,
      msgType: "chat",
      matchId: matchInfo ? matchInfo.matchId : null,
    };
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: "/app/chat",
        body: JSON.stringify(chatMsg),
      });
      console.log("Chat message sent via WebSocket:", chatMsg);
    } else {
      console.error("WebSocket not connected");
    }
    setChatMessages((prev) => [...prev, chatMsg]);
  };

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () =>
        new SockJS(
          "http://localhost:8080/ws?username=" +
            encodeURIComponent(user.username)
        ),
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
    });
    client.onConnect = (frame) => {
      console.log("WebSocket connected:", frame);
      client.subscribe("/topic/match", (message) => {
        const match = JSON.parse(message.body);
        console.log("Match found:", match);
        if (!match.matchId) {
          console.error("Invalid match data:", match);
        }
        setMatchInfo(match);
        if (match.white && match.black && user) {
          setOrientation(user.username === match.white ? "white" : "black");
        }
      });
      client.subscribe("/user/queue/move", (message) => {
        const moveData = JSON.parse(message.body);
        console.log("Move received:", moveData);
        setGame((prevGame) => {
          const newGame = cloneGame(prevGame);
          const moveResult = newGame.move({
            from: moveData.from,
            to: moveData.to,
            promotion: moveData.promotion,
          });
          if (!moveResult) {
            console.error("Failed to apply move:", moveData);
          } else {
            console.log("New FEN after move:", newGame.fen());
          }
          setActiveColor(newGame.turn());
          return newGame;
        });
      });
      client.subscribe("/user/queue/chat", (message) => {
        const chatMsg = JSON.parse(message.body);
        console.log("Chat received:", chatMsg);
        setChatMessages((prev) => [...prev, chatMsg]);
        if (chatMsg.msgType === "draw_response" && chatMsg.accepted) {
          setGameResult("DRAW");
        }
      });
      client.subscribe("/topic/game-over", (message) => {
        const payload = JSON.parse(message.body);
        console.log("Game over event received:", payload);
        if (!gameSavedRef.current) {
          let result = payload.result;
          console.log("name", user.username);
          if (payload.sender !== user.username) {
            if (payload.result === "WIN") {
              result = "LOSE"; // Nếu kết quả là "WIN", đổi thành "LOSE"
            } else if (payload.result === "LOSE") {
              result = "WIN"; // Nếu kết quả là "LOSE", đổi thành "WIN"
            }
          }
          setGameResult(result);
          saveGameToServer(result);
          setGameSaved(true);
          gameSavedRef.current = true;
        }
      });
      client.subscribe("/user/queue/surrender", (message) => {
        const surrenderMsg = message.body;
        console.log("Surrender notification received:", surrenderMsg);
        setGameResult(surrenderMsg);
      });
    };
    client.activate();
    setStompClient(client);
    return () => {
      client.deactivate();
    };
  }, [user]);

  const moveHistoryVerbose = game.history({ verbose: true });

  // Thông tin hiển thị của đối thủ sử dụng opponentData
  const opponentInfo = matchInfo ? (
    <div className="flex items-center justify-between w-full px-4 py-2 mb-2 bg-gray-800 rounded-md shadow-sm">
      <div className="flex items-center space-x-2">
        <img
          src={
            opponentData && opponentData.profilePicture
              ? opponentData.profilePicture
              : "/user_default.jpg"
          }
          alt="Opponent"
          className="w-10 h-10 rounded-full border border-blue-400"
        />
        <div className="text-white text-base font-medium">
          {opponentData
            ? `${opponentData.username} (${opponentData.rating ?? "N/A"})`
            : user && user.username === matchInfo.white
            ? matchInfo.black
            : matchInfo.white}
        </div>
      </div>
      <div className="text-xl font-bold text-yellow-400">
        {console.log(
          "Opponent ChessClock props:",
          "initialTime:",
          initialTime,
          "activeColor:",
          activeColor,
          "Calculated opponent color:",
          orientation === "white" ? "b" : "w",
          "isActive:",
          activeColor === (orientation === "white" ? "b" : "w")
        )}
        <ChessClock
          initialTime={initialTime}
          isActive={activeColor === (orientation === "white" ? "b" : "w")}
          onTimeOut={handleTimeOut}
          playerColor={orientation === "white" ? "b" : "w"}
          increment={incrementValue}
        />
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-between w-full px-4 py-2 mb-2 bg-gray-800 rounded-md shadow-sm">
      <div className="flex items-center space-x-2">
        <img
          src="/user_default.jpg"
          alt="Opponent"
          className="w-10 h-10 rounded-full border border-blue-400"
        />
        <div className="text-white text-base font-medium">
          Waiting for opponent...
        </div>
      </div>
      <div className="text-xl font-bold text-white">
        {console.log(
          "Opponent ChessClock waiting state, initialTime:",
          initialTime
        )}
        <ChessClock
          initialTime={initialTime}
          isActive={false}
          onTimeOut={handleTimeOut}
          playerColor={orientation === "white" ? "b" : "w"}
        />
      </div>
    </div>
  );

  // Thông tin hiển thị của người chơi
  const youInfo = (
    <div className="flex items-center justify-between w-full px-4 py-2 mt-2 bg-gray-800 rounded-md shadow-sm">
      <div className="flex items-center space-x-2">
        <img
          src={
            user && user.profilePicture
              ? user.profilePicture
              : "/user_default.jpg"
          }
          alt="You"
          className="w-10 h-10 rounded-full border border-green-400"
        />
        <div className="text-white text-base font-medium">
          {user ? `${user.username} (${user.rating ?? "N/A"})` : "User (600)"}
        </div>
      </div>
      <div
        className={`text-xl font-bold ${
          matchInfo ? "text-yellow-400" : "text-white"
        }`}>
        {console.log(
          "Your ChessClock props:",
          "initialTime:",
          initialTime,
          "activeColor:",
          activeColor,
          "playerColor:",
          playerColor,
          "isActive:",
          matchInfo ? activeColor === playerColor : false
        )}
        <ChessClock
          initialTime={initialTime}
          isActive={matchInfo ? activeColor === playerColor : false}
          onTimeOut={handleTimeOut}
          playerColor={playerColor}
          increment={incrementValue}
        />
      </div>
    </div>
  );

  const boardBlock = (
    <div className="flex items-center">
      <ChessBoard
        game={game}
        handleMove={handleMove}
        orientation={boardOrientation}
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
          {opponentInfo}
          {boardBlock}
          {youInfo}
        </div>
        <div className="w-1/5 h-full border-l border-gray-300">
          <Sidebar
            moveHistory={moveHistoryVerbose}
            onSurrender={handleSurrender}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onRequestDraw={handleSendDrawRequest}
            onNewGame={handleNewGame}
            onSendChat={handleSendChat}
            onSendDrawResponse={handleSendDrawResponse}
            chatMessages={chatMessages}
            matchInfo={matchInfo}
            currentUser={user ? user.username : ""}
            gameMode={gameMode}
            setGameMode={setGameMode}
          />
        </div>
      </div>
      <Footer />
      <ToastContainer />
      {gameResult && (
        <GameResultPopup
          result={gameResult}
          onHome={handleHome}
          onClose={handleClosePopup}
          isPvP={true}
        />
      )}
    </div>
  );
};

export default PvpPage;
