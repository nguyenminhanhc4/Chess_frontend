import React, { useState, useCallback } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import PropTypes from "prop-types";

const ChessBoard = ({
  game,
  handleMove,
  orientation,
  playerColor,
  transitionDuration,
}) => {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [moveHints, setMoveHints] = useState({});

  // Tìm vị trí của vua của bên có lượt đi hiện hành
  const getKingSquare = useCallback((gameInstance) => {
    const files = "abcdefgh";
    const ranks = "12345678";
    for (let i = 0; i < files.length; i++) {
      for (let j = 0; j < ranks.length; j++) {
        const square = files[i] + ranks[j];
        const piece = gameInstance.get(square);
        if (
          piece &&
          piece.type === "k" &&
          piece.color === gameInstance.turn()
        ) {
          return square;
        }
      }
    }
    return null;
  }, []);

  // Xử lý click vào ô (click-to-move)
  // Xử lý click vào ô (click-to-move)
  const onSquareClick = useCallback(
    (square) => {
      if (!selectedSquare) {
        const piece = game.get(square);
        // Chỉ cho phép chọn quân của người chơi dựa trên playerColor
        if (piece && piece.color === playerColor) {
          setSelectedSquare(square);
          const moves = game.moves({ square, verbose: true });
          const hints = {};
          // Chọn màu gợi ý khác nhau cho quân trắng và quân đen
          const moveHintColor = playerColor === "b" ? "white" : "gray";
          moves.forEach((move) => {
            if (move.flags.includes("c") || move.flags.includes("e")) {
              hints[move.to] = {
                border: "5px solid red",
                borderRadius: "50%",
                boxSizing: "border-box",
                zIndex: 999,
              };
            } else {
              hints[move.to] = {
                backgroundImage: `radial-gradient(circle, ${moveHintColor} 20%, transparent 20%)`,
                backgroundPosition: "center",
                backgroundSize: "60px 60px",
                backgroundRepeat: "no-repeat",
              };
            }
          });
          // Ô được chọn sẽ có border màu xanh dương
          hints[square] = { border: "3px solid blue" };
          setMoveHints(hints);
        }
      } else {
        const fromSquare = selectedSquare;
        const toSquare = square;
        const piece = game.get(fromSquare);
        // Kiểm tra đặc biệt cho quân tốt phong cấp
        if (
          piece &&
          piece.type === "p" &&
          ((piece.color === "w" && toSquare[1] === "8") ||
            (piece.color === "b" && toSquare[1] === "1"))
        ) {
          onPieceDrop(fromSquare, toSquare);
        } else {
          if (moveHints[toSquare]) {
            handleMove(fromSquare, toSquare);
          }
        }
        setSelectedSquare(null);
        setMoveHints({});
      }
    },
    [selectedSquare, game, playerColor, moveHints, handleMove]
  );

  // Xử lý drag & drop (drag-to-move)
  const onPieceDrop = useCallback(
    (sourceSquare, targetSquare) => {
      const piece = game.get(sourceSquare);
      if (
        piece &&
        piece.type === "p" &&
        ((piece.color === "w" && targetSquare[1] === "8") ||
          (piece.color === "b" && targetSquare[1] === "1"))
      ) {
        // Popup phong cấp tích hợp của react‑chessboard sẽ tự hoạt động
        return false;
      }
      const moved = handleMove(sourceSquare, targetSquare);
      setMoveHints({});
      return moved;
    },
    [game, handleMove]
  );

  // Xử lý khi người dùng chọn quân phong cấp từ popup tích hợp của react‑chessboard
  const onPromotionPieceSelect = useCallback(
    (piece, from, to) => {
      const promotionPiece = piece.charAt(piece.length - 1).toLowerCase();
      return handleMove(from, to, promotionPiece);
    },
    [handleMove]
  );

  // Khi kết thúc kéo quân, xóa move hints
  const onPieceDragEnd = useCallback(() => {
    setSelectedSquare(null);
    setMoveHints({});
  }, []);

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

  return (
    <div className="flex items-center p-2">
      <Chessboard
        boardWidth={600}
        position={game.fen()}
        boardOrientation={orientation}
        onSquareClick={onSquareClick}
        onPieceDrop={onPieceDrop}
        onPromotionPieceSelect={onPromotionPieceSelect}
        customSquareStyles={customSquareStyles}
        onPieceDragEnd={onPieceDragEnd}
        transitionDuration={transitionDuration}
        arePiecesDraggable={true}
      />
    </div>
  );
};

ChessBoard.propTypes = {
  game: PropTypes.instanceOf(Chess).isRequired,
  handleMove: PropTypes.func.isRequired,
  orientation: PropTypes.string.isRequired,
  playerColor: PropTypes.string.isRequired,
  transitionDuration: PropTypes.number,
};

export default React.memo(ChessBoard);
