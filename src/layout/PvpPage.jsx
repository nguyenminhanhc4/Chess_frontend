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
import { FaSpinner } from "react-icons/fa";
import { FaTimes, FaCommentAlt } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const cloneGame = (gameInstance) => {
  return Object.assign(
    Object.create(Object.getPrototypeOf(gameInstance)),
    gameInstance
  );
};

const PvpPage = () => {
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
  // State để quản lý hiển thị popup
  const [showPopup, setShowPopup] = useState(true);

  const boardOrientation = orientation || "white";
  const playerColor = boardOrientation === "white" ? "w" : "b";
  const gameOverSentRef = useRef(false);
  const matchInfoRef = useRef();
  useEffect(() => {
    matchInfoRef.current = matchInfo;
  }, [matchInfo]);

  // Khi matchInfo thay đổi, nếu có dữ liệu thì tắt loading và popup
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
    setGameResult(null);
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
          console.log(
            "Orientation set to:",
            user.username === match.white ? "white" : "black"
          );
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

  const opponentInfo = matchInfo ? (
    <div className="flex items-center justify-center space-x-2 mb-2">
      <img
        src={
          user && user.username === matchInfo.white
            ? "../../public/user_default.jpg"
            : "../../public/user_default.jpg"
        }
        alt="Opponent"
        className="w-8 h-8 rounded-full"
      />
      <div className="text-white px-2 py-1 rounded bg-gray-700">
        {user && user.username === matchInfo.white
          ? matchInfo.black
          : matchInfo.white}
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center space-x-2 mb-2">
      <img
        src="../../public/user_default.jpg"
        alt="Opponent"
        className="w-8 h-8 rounded-full"
      />
      <div className="text-white px-2 py-1 rounded bg-gray-700">
        Waiting for opponent...
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
      <div className="text-white px-2 py-1 rounded bg-gray-700">
        {user ? `${user.username} (${user.rating ?? "N/A"})` : "User (600)"}
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
      {/* Popup Modal: Hiển thị khi chưa có matchInfo và showPopup=true */}
      {/* Popup Modal: Hiển thị khi chưa có matchInfo và showPopup=true */}
      {!matchInfo && showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="relative bg-gradient-to-r from-blue-500 to-blue-700 p-8 rounded-lg shadow-lg text-white">
            {/* Nút X để đóng popup */}
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-2 right-2 text-white hover:text-gray-300">
              <FaTimes size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">Chế độ PvP</h2>
            <p className="mb-6 text-center">
              Hiện chưa có trận đấu. Vui lòng nhấn "Tìm trận" để ghép đấu với
              đối thủ.
            </p>
            <button
              onClick={async () => {
                if (user) {
                  if (loadingMatch) {
                    // Nếu đang trong trạng thái loading, nhấn để hủy tìm trận
                    try {
                      await axios.post(
                        "http://localhost:8080/api/matchmaking/cancel",
                        user,
                        { headers: { "Content-Type": "application/json" } }
                      );
                      console.log("Cancelled matchmaking");
                    } catch (error) {
                      console.error("Error cancelling matchmaking:", error);
                    }
                    setLoadingMatch(false);
                  } else {
                    // Nếu chưa đang loading, gọi API join matchmaking
                    setLoadingMatch(true);
                    try {
                      const response = await axios.post(
                        "http://localhost:8080/api/matchmaking/join",
                        user,
                        { headers: { "Content-Type": "application/json" } }
                      );
                      console.log("Joined matchmaking:", response.data);
                      // Không đặt setLoadingMatch(false) tại đây vì state sẽ được thay đổi khi matchInfo cập nhật.
                    } catch (error) {
                      console.error("Error joining matchmaking:", error);
                      setLoadingMatch(false);
                    }
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
                  <FaSpinner className="animate-spin text-blue-700" size={20} />
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
        </div>
      )}
    </div>
  );
};

export default PvpPage;
