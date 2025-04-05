import PropTypes from "prop-types";
import { GiChessKing, GiTrophy, GiSwordsEmblem } from "react-icons/gi";
import { motion, AnimatePresence } from "framer-motion";

const GameResultPopup = ({
  result,
  onHome,
  onContinue,
  isPvP,
  opponentName,
}) => {
  const resultConfig = {
    WIN: {
      gradient: "from-emerald-600 to-green-800",
      icon: <GiTrophy className="text-4xl text-yellow-400" />,
      title: "Chiến Thắng!",
    },
    LOSE: {
      gradient: "from-rose-600 to-red-800",
      icon: <GiSwordsEmblem className="text-4xl text-red-400" />,
      title: "Thất Bại",
    },
    DRAW: {
      gradient: "from-amber-600 to-yellow-800",
      icon: <GiChessKing className="text-4xl text-blue-400" />,
      title: "Hòa",
    },
  };

  const currentConfig = resultConfig[result] || resultConfig.DRAW;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        className="fixed inset-0 flex items-center justify-center bg-black/60">
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          className={`relative bg-gradient-to-br ${currentConfig.gradient} p-8 rounded-2xl shadow-2xl w-11/12 max-w-md border-2 border-white/10 space-y-6`}>
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}>
              {currentConfig.icon}
            </motion.div>
          </div>

          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">
              {isPvP ? `Đấu với ${opponentName}` : "Chế độ Máy"}
            </h2>
            <p className="text-4xl font-extrabold text-white uppercase tracking-wider">
              {currentConfig.title}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onHome}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all">
              <GiChessKing />
              <span>{isPvP ? "Ván Mới" : "Độ Khó Mới"}</span>
            </motion.button>

            {!isPvP && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onContinue}
                className="p-3 bg-blue-600/90 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center justify-center gap-2">
                <GiSwordsEmblem />
                <span>Thử Lại</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

GameResultPopup.propTypes = {
  result: PropTypes.oneOf(["WIN", "LOSE", "DRAW"]).isRequired,
  onHome: PropTypes.func.isRequired,
  onContinue: PropTypes.func,
  isPvP: PropTypes.bool,
  moveCount: PropTypes.number,
  gameDuration: PropTypes.string,
  opponentName: PropTypes.string,
};

export default GameResultPopup;
