// src/pages/PvpPage.jsx
/* eslint-disable react/no-unescaped-entities */
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
import { FaSpinner, FaTimes, FaCommentAlt, FaArrowLeft } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChessClock from "../components/ChessClock";

const cloneGame = (gameInstance) => {
  return Object.assign(
    Object.create(Object.getPrototypeOf(gameInstance)),
    gameInstance
  );
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
  // Lưu kiểu chơi: "standard", "rapid", "bullet"
  const [gameMode, setGameMode] = useState(() => {
    return localStorage.getItem("gameMode") || "standard";
  });
  // activeColor quản lý lượt đồng hồ ("w" hay "b")
  const [activeColor, setActiveColor] = useState("w");

  // Hàm trả về thời gian ban đầu dựa theo kiểu chơi đã chọn
  const getInitialTime = () => {
    switch (gameMode) {
      case "rapid":
        return 180; // 3 phút
      case "bullet":
        return 60; // 1 phút
      case "standard":
      default:
        return 300; // 5 phút
    }
  };

  // Nếu người dùng chưa chọn kiểu chơi, mặc định thời gian là 5 phút
  const initialTime = gameMode ? getInitialTime() : 300;

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
      let result = "";
      const currentPlayerColor = "w";
      if (game.isCheckmate()) {
        result = game.turn() === currentPlayerColor ? "LOSE" : "WIN";
      } else if (
        game.isStalemate() ||
        game.isInsufficientMaterial() ||
        game.isThreefoldRepetition()
      ) {
        result = "DRAW";
      } else {
        result = "DRAW";
      }
      setGameResult(result);
      if (stompClient && stompClient.connected) {
        const payload = {
          sender: user.username,
          matchId: matchInfo ? matchInfo.matchId : null,
          result: result.toUpperCase(),
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
    window.location.href = "/";
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
          return newGame;
        });
        setActiveColor(game.turn());
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
          if (payload.sender !== user.username && payload.result === "LOSE") {
            result = "WIN";
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

  // opponentInfo và youInfo hiển thị theo hàng ngang:
  const opponentInfo = matchInfo ? (
    <div className="flex items-center justify-between w-full px-4 py-2 mb-2 bg-gray-800 rounded-md shadow-sm">
      <div className="flex items-center space-x-2">
        <img
          src={
            user && user.username === matchInfo.white
              ? "../../public/user_default.jpg"
              : "../../public/user_default.jpg"
          }
          alt="Opponent"
          className="w-10 h-10 rounded-full border border-blue-400"
        />
        <div className="text-white text-base font-medium">
          {user && user.username === matchInfo.white
            ? matchInfo.black
            : matchInfo.white}
        </div>
      </div>
      <div className="text-xl font-bold text-yellow-400">
        <ChessClock
          initialTime={initialTime}
          isActive={activeColor === (orientation === "white" ? "b" : "w")}
          onTimeOut={handleTimeOut}
          playerColor={orientation === "white" ? "b" : "w"}
        />
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-between w-full px-4 py-2 mb-2 bg-gray-800 rounded-md shadow-sm">
      <div className="flex items-center space-x-2">
        <img
          src="../../public/user_default.jpg"
          alt="Opponent"
          className="w-10 h-10 rounded-full border border-blue-400"
        />
        <div className="text-white text-base font-medium">
          Waiting for opponent...
        </div>
      </div>
      <div className="text-xl font-bold text-white">
        <ChessClock
          initialTime={initialTime}
          isActive={false}
          onTimeOut={handleTimeOut}
          playerColor={orientation === "white" ? "b" : "w"}
        />
      </div>
    </div>
  );

  const youInfo = (
    <div className="flex items-center justify-between w-full px-4 py-2 mt-2 bg-gray-800 rounded-md shadow-sm">
      <div className="flex items-center space-x-2">
        <img
          src={
            user && user.avatar ? user.avatar : "../../public/user_default.jpg"
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
        <ChessClock
          initialTime={initialTime}
          isActive={matchInfo ? activeColor === playerColor : false}
          onTimeOut={handleTimeOut}
          playerColor={playerColor}
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
          onNewGame={handleNewGame}
          onClose={handleClosePopup}
        />
      )}
      {/* Popup modal duy nhất kết hợp chọn kiểu chơi và tìm trận */}
      {!matchInfo && showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="relative bg-gray-900 p-8 rounded-2xl shadow-2xl text-white w-96">
            <button
              onClick={handleClosePopup}
              className="absolute top-4 right-4 text-white hover:text-gray-300">
              <FaTimes size={24} />
            </button>
            {!gameMode ? (
              <>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-center">
                    Chọn kiểu chơi
                  </h2>
                  <hr className="border-gray-600 mt-3" />
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {/* Card cho Cờ tiêu chuẩn */}
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 shadow-lg flex flex-col items-center">
                    <span className="text-2xl font-semibold">
                      Cờ tiêu chuẩn
                    </span>
                    <button
                      onClick={() => setGameMode("standard")}
                      className="mt-4 w-full py-2 px-4 rounded-lg text-white font-medium transition-all duration-300 bg-transparent border border-white hover:bg-white hover:text-green-600">
                      5 phút
                    </button>
                  </div>
                  {/* Card cho Cờ nhanh */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg flex flex-col items-center">
                    <span className="text-2xl font-semibold">Cờ nhanh</span>
                    <button
                      onClick={() => setGameMode("rapid")}
                      className="mt-4 w-full py-2 px-4 rounded-lg text-white font-medium transition-all duration-300 bg-transparent border border-white hover:bg-white hover:text-blue-600">
                      3 phút
                    </button>
                  </div>
                  {/* Card cho Cờ chớp */}
                  <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 shadow-lg flex flex-col items-center">
                    <span className="text-2xl font-semibold">Cờ chớp</span>
                    <button
                      onClick={() => setGameMode("bullet")}
                      className="mt-4 w-full py-2 px-4 rounded-lg text-white font-medium transition-all duration-300 bg-transparent border border-white hover:bg-white hover:text-red-600">
                      1 phút
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center">
                {/* Nút quay lại với chức năng hủy tìm trận nếu đang active */}
                <div className="w-full flex items-center mb-6">
                  <button
                    onClick={async () => {
                      if (loadingMatch) {
                        try {
                          await axios.post(
                            "http://localhost:8080/api/matchmaking/cancel",
                            { ...user, gameMode },
                            { headers: { "Content-Type": "application/json" } }
                          );
                          console.log("Cancelled matchmaking");
                        } catch (error) {
                          console.error("Error cancelling matchmaking:", error);
                        }
                        setLoadingMatch(false);
                      }
                      setGameMode(null);
                    }}
                    className="text-red-500 hover:text-red-400 mr-2">
                    <FaArrowLeft size={24} />
                  </button>
                  <h2 className="text-3xl font-bold">Chế độ PvP</h2>
                </div>
                <p className="text-center mb-6">
                  Kiểu chơi đã chọn:{" "}
                  <span className="font-bold">
                    {gameMode === "standard"
                      ? "Cờ tiêu chuẩn (5 phút)"
                      : gameMode === "rapid"
                      ? "Cờ nhanh (3 phút)"
                      : "Cờ chớp (1 phút)"}
                  </span>
                </p>
                <button
                  onClick={async () => {
                    if (loadingMatch) {
                      try {
                        await axios.post(
                          "http://localhost:8080/api/matchmaking/cancel",
                          { ...user, gameMode },
                          { headers: { "Content-Type": "application/json" } }
                        );
                        console.log("Cancelled matchmaking");
                      } catch (error) {
                        console.error("Error cancelling matchmaking:", error);
                      }
                      setLoadingMatch(false);
                    } else {
                      setLoadingMatch(true);
                      try {
                        const response = await axios.post(
                          "http://localhost:8080/api/matchmaking/join",
                          { ...user, gameMode },
                          { headers: { "Content-Type": "application/json" } }
                        );
                        console.log("Joined matchmaking:", response.data);
                      } catch (error) {
                        console.error("Error joining matchmaking:", error);
                        setLoadingMatch(false);
                      }
                    }
                  }}
                  disabled={!!matchInfo}
                  className={`w-full py-3 font-bold rounded-full shadow-lg transition-colors duration-300 flex items-center justify-center space-x-2 ${
                    matchInfo
                      ? "bg-gray-500 cursor-not-allowed"
                      : loadingMatch
                      ? "bg-blue-200"
                      : "bg-white text-blue-700 hover:bg-blue-100"
                  }`}>
                  {loadingMatch ? (
                    <div className="flex items-center space-x-2">
                      <FaSpinner
                        className="animate-spin text-blue-700"
                        size={20}
                      />
                      <span className="text-blue-700">Hủy tìm trận</span>
                    </div>
                  ) : (
                    <>
                      <FaCommentAlt />
                      <span>Tìm trận</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PvpPage;
