import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Chess } from "chess.js";
import Header from "./header";
import Nav from "./nav";
import AnalysisSidebar from "./AnalysisSidebar";
import Footer from "./footer";
import ChessBoard from "../components/chessboard";
import EvalBar from "../components/EvalBar";

const AnalysisPage = () => {
  const { gameId } = useParams();
  const [gameDetails, setGameDetails] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [game, setGame] = useState(new Chess());
  const [playerInfo, setPlayerInfo] = useState(null);
  const [opponentInfo, setOpponentInfo] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resGame = await axios.get(`http://localhost:8080/api/game/${gameId}`);
        const gameData = resGame.data;
        setGameDetails(gameData);

        if (gameData.finalFen) {
          setGame(new Chess(gameData.finalFen));
        } else {
          setGame(new Chess());
        }

        if (gameData.moves && gameData.moves !== "No moves") {
          const chessForHistory = new Chess();
          const movesArray = gameData.moves.split(" ").filter((m) => m.trim() !== "");
          movesArray.forEach(move => chessForHistory.move(move));
          const verboseHistory = chessForHistory.history({ verbose: true });
          setMoveHistory(verboseHistory);
        } else {
          setMoveHistory([]);
        }
        

        const resPlayer = await axios.get(`http://localhost:8080/api/users/username/${gameData.playerUsername}`);
        setPlayerInfo(resPlayer.data);

        if (gameData.opponentType !== "BOT") {
          const resOpponent = await axios.get(`http://localhost:8080/api/users/username/${gameData.opponent}`);
          setOpponentInfo(resOpponent.data);
        }
      } catch (error) {
        console.error("Error fetching game data:", error);
      }
    };
    fetchData();
  }, [gameId]);

  // Khi người dùng chọn một nước đi (đơn lẻ)
  const handleMoveSelect = (selectedIndex) => {
    // Replay các nước đi từ đầu đến selectedIndex - 1 (để hiển thị vị trí trước nước đi vừa được thực hiện)
    const newGame = new Chess();
    for (let i = 0; i < selectedIndex && i < moveHistory.length; i++) {
      newGame.move(moveHistory[i].san);
    }
    setGame(newGame);

    // Nếu có ít nhất 1 nước đi, gọi API phân tích cho nước đi vừa được chơi
    if (selectedIndex > 0) {
      const analysisGame = new Chess();
      for (let i = 0; i < selectedIndex; i++) {
        analysisGame.move(moveHistory[i].san);
      }
      const fen = analysisGame.fen();
      // Lấy nước đi cuối cùng của chuỗi (với selectedIndex là số nước đã chơi)
      const playerMove = moveHistory[selectedIndex - 1].san;
      const moveNumber = Math.floor((selectedIndex - 1) / 2) + 1;
      const payload = {
        fen,
        playerMove,
        moveNumber,
        gameId: gameDetails ? gameDetails.id : 0,
        depth: 15,
      };
      axios
        .post("http://localhost:8080/api/engine/analyzeDetailed", payload)
        .then((res) => {
          setAnalysisResult(res.data);
          console.log("Phân tích chi tiết:", res.data);
        })
        .catch((err) => {
          console.error("Error analyzing move", err);
        });
    } else {
      setAnalysisResult(null);
    }
  };

  const opponentDisplay = gameDetails && (
    <div className="flex items-center justify-center space-x-2 mb-2">
      {gameDetails.opponentType === "BOT" ? (
        <>
          <img src="/robo_icon.jpg" alt="Opponent" className="w-8 h-8 rounded-full" />
          <div className="text-white px-2 py-1 rounded bg-green-600">{gameDetails.opponent}</div>
        </>
      ) : opponentInfo ? (
        <>
          <img src={opponentInfo.profilePicture || "/user_default.jpg"} alt="Opponent" className="w-8 h-8 rounded-full" />
          <div className="text-white px-2 py-1 rounded bg-green-600">
            {gameDetails.opponent} {opponentInfo.rating ? `(Rating: ${opponentInfo.rating})` : ""}
          </div>
        </>
      ) : (
        <p className="text-white">Đang tải thông tin đối thủ...</p>
      )}
    </div>
  );

  const playerDisplay = gameDetails && (
    <div className="flex items-center justify-center space-x-2 mt-2">
      {playerInfo ? (
        <>
          <img src={playerInfo.profilePicture || "/user_default.jpg"} alt="Player" className="w-8 h-8 rounded-full" />
          <div className="text-white px-2 py-1 rounded bg-green-600">
            {gameDetails.playerUsername} {playerInfo.rating ? `(Rating: ${playerInfo.rating})` : ""}
          </div>
        </>
      ) : (
        <p className="text-white">Đang tải thông tin người chơi...</p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-grow">
        <div className="w-1/5 h-full border-r border-gray-300"><Nav /></div>
        <div className="w-3/5 flex flex-col items-center justify-center">
          {opponentDisplay}
          {/* Container cho EvalBar và ChessBoard */}
          <div className="flex items-center space-x-4" style={{ height: "600px" }}>
          <EvalBar 
  evaluation={analysisResult ? analysisResult.playerEvaluation : 0}
  boardFlipped={false}
  height="100%"
  width="20px"
/>

            <ChessBoard 
              game={game}
              handleMove={() => {}}
              orientation="white"
              playerColor="w"
              transitionDuration={300}
            />
          </div>
          {playerDisplay}
        </div>
        <div className="w-1/5 border-l border-gray-300">
          {/* Sidebar với chiều cao cố định */}
          <AnalysisSidebar 
            moveHistory={moveHistory}
            onMoveSelect={handleMoveSelect}
            analysisResult={analysisResult}
            height="600px"
          />
        </div>
      </div>
      <Footer />
      
    </div>
  );
};

export default AnalysisPage;
