import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useState } from "react";

const ChessBoard = () => {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [moveHints, setMoveHints] = useState({});
  const [orientation, setOrientation] = useState("white");

  // Hàm dùng chung để thực hiện nước đi
  const makeMove = (from, to, promotion = null) => {
    const newGame = new Chess(game.fen());
    const moveConfig = { from, to };
    if (promotion) {
      moveConfig.promotion = promotion;
    }
    const move = newGame.move(moveConfig);
    if (move) {  
      setGame(newGame);  
      return true;
    }
    return false;
  };

  // Hàm tìm vị trí của vua của bên có lượt đi hiện hành
  const getKingSquare = (gameInstance) => {
    const files = "abcdefgh";
    const ranks = "12345678";
    for (let i = 0; i < files.length; i++) {
      for (let j = 0; j < ranks.length; j++) {
        const square = files[i] + ranks[j];
        const piece = gameInstance.get(square);
        if (piece && piece.type === "k" && piece.color === gameInstance.turn()) {
          return square;
        }
      }
    }
    return null;
  };

  // Xử lý khi click vào ô (click-to-move)
  const onSquareClick = (square) => {
    if (!selectedSquare) {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        // Tính toán các nước đi hợp lệ từ ô được chọn (verbose: true)
        const moves = game.moves({ square, verbose: true });
        const hints = {};
        moves.forEach((move) => {
          if (move.flags.includes("c") || move.flags.includes("e")) {
            // Nước ăn: hiển thị đường viền tròn xung quanh ô đích
            hints[move.to] = {
              border: "5px solid red",
              borderRadius: "50%",
              boxSizing: "border-box",
              zIndex: 999,
            };
          } else {
            // Nước đi thường: hiển thị một dot nhỏ màu xám ở giữa ô
            hints[move.to] = {
              backgroundImage: "radial-gradient(circle, gray 20%, transparent 20%)",
              backgroundPosition: "center",
              backgroundSize: "60px 60px",
              backgroundRepeat: "no-repeat",
            };
          }
        });
        // Đánh dấu ô được chọn (ví dụ viền xanh)
        hints[square] = { border: "3px solid blue" };
        setMoveHints(hints);
      }
    } else {
      // Đã có ô được chọn, ô hiện tại là ô đích
      const fromSquare = selectedSquare;
      const toSquare = square;
      const piece = game.get(fromSquare);
      if (
        piece &&
        piece.type === "p" &&
        ((piece.color === "w" && toSquare[1] === "8") ||
         (piece.color === "b" && toSquare[1] === "1"))
      ) {
        // Nếu là nước phong cấp, gọi onDrop để kích hoạt popup phong cấp
        onPieceDrop(fromSquare, toSquare);
      } else {
        if (moveHints[toSquare]) {
          makeMove(fromSquare, toSquare);
        }
      }
      setSelectedSquare(null);
      setMoveHints({});
    }
  };

  // Xử lý drag & drop (vẫn giữ chức năng phong cấp của drag & drop)
  const onPieceDrop = (sourceSquare, targetSquare) => {
    const piece = game.get(sourceSquare);
    if (
      piece &&
      piece.type === "p" &&
      ((piece.color === "w" && targetSquare[1] === "8") ||
       (piece.color === "b" && targetSquare[1] === "1"))
    ) {
      // Trả về false để kích hoạt popup phong cấp tích hợp của react‑chessboard
      return false;
    }
    return makeMove(sourceSquare, targetSquare);
  };

  // Xử lý khi người dùng chọn quân phong cấp từ popup tích hợp của react‑chessboard
  const onPromotionPieceSelect = (piece, from, to) => {
    const promotionPiece = piece.charAt(piece.length - 1).toLowerCase();
    if (makeMove(from, to, promotionPiece)) {
      return true;
    }
    return false;
  };

  // Khi kết thúc kéo quân, xóa move hint
  const onPieceDragEnd = () => {
    setSelectedSquare(null);
    setMoveHints({});
  };

  // Tách riêng style cho ô vua khi bị chiếu
  const checkStyle = {};
  if (game.inCheck()) {
    const kingSquare = getKingSquare(game);
    if (kingSquare) {
      checkStyle[kingSquare] = {
        border: "3px solid red",
        boxSizing: "border-box",
        zIndex: 1000,
        boxShadow: "0 0 10px red",
      };
    }
  }
  
  // Hợp nhất moveHints với checkStyle
  const customSquareStyles = { ...moveHints, ...checkStyle };

  // Hàm reset game (Ván mới)
  const handleNewGame = () => {
    setGame(new Chess());
    setSelectedSquare(null);
    setMoveHints({});
  };

  // Hàm xoay bàn cờ (flip board)
  const handleToggleOrientation = () => {
    setOrientation((prev) => (prev === "white" ? "black" : "white"));
  };

  return (
    <div className="flex items-center p-2">
      {/* Bàn cờ */}
      <Chessboard 
        boardWidth={600} 
        position={game.fen()} 
        boardOrientation={orientation}
        onPieceDrop={onPieceDrop} 
        onSquareClick={onSquareClick} 
        onPromotionPieceSelect={onPromotionPieceSelect} 
        customSquareStyles={customSquareStyles}
        onPieceDragEnd={onPieceDragEnd}
      />
      {/* Các nút chức năng bên phải bàn cờ */}
      <div className="flex flex-col ml-4 space-y-4">
        <button
          onClick={handleNewGame}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Ván mới
        </button>
        <button
          onClick={handleToggleOrientation}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Xoay bàn cờ
        </button>
      </div>
    </div>
  );
};

export default ChessBoard;
