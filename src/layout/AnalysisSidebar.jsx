import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import {
  FaAngleDoubleLeft,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleRight,
} from "react-icons/fa";

// Mapping friendly cho move category
const classificationMapping = {
  BOOK_MOVE: "Khai cuộc",
  BEST_MOVE: "Tốt nhất",
  GENIUS_MOVE: "Thiên tài",
  BRILLIANT_MOVE: "Xuất sắc",
  GREAT_MOVE: "Tuyệt",
  GOOD_MOVE: "Tốt",
  INACCURACY: "Không chính xác",
  MISTAKE: "Sai lầm",
  MISSED_MOVE: "Bỏ lỡ",
  BLUNDER: "Thảm họa",
};

const AnalysisSidebar = ({
  moveHistory,
  onMoveSelect,
  analysisResult,
  height,
}) => {
  // Tạo danh sách cặp nước đi để hiển thị
  const movePairs = moveHistory.reduce((acc, move, index) => {
    if (index % 2 === 0) {
      acc.push({
        moveNumber: Math.floor(index / 2) + 1,
        white: move.san,
        black: moveHistory[index + 1] ? moveHistory[index + 1].san : "",
      });
    }
    return acc;
  }, []);

  // State lưu chỉ số nước đi (đơn lẻ)
  const [selectedIndividualIndex, setSelectedIndividualIndex] = useState(0);
  // State lưu khai cuộc gần nhất đã nhận từ API
  const [lastKnownOpening, setLastKnownOpening] = useState(null);

  // Cập nhật khai cuộc gần nhất khi analysisResult có openingName hợp lệ
  useEffect(() => {
    if (analysisResult) {
      const opening = analysisResult.openingName;
      if (opening && opening.trim() !== "") {
        setLastKnownOpening(opening);
      }
    }
  }, [analysisResult]);

  // Ref cho vùng danh sách nước đi (phần cuộn)
  const movesContainerRef = useRef(null);

  // Khi selectedIndividualIndex thay đổi, cuộn đến dòng tương ứng (chỉ trong vùng cuộn)
  useEffect(() => {
    const rowId = `move-row-${Math.floor(selectedIndividualIndex / 2)}`;
    const rowElement = document.getElementById(rowId);
    if (rowElement && movesContainerRef.current) {
      movesContainerRef.current.scrollTo({
        top: rowElement.offsetTop - movesContainerRef.current.offsetTop,
        behavior: "smooth",
      });
    }
  }, [selectedIndividualIndex]);

  const updateSelectedIndividualMove = (newIndex) => {
    if (newIndex < 0 || newIndex >= moveHistory.length) return;
    setSelectedIndividualIndex(newIndex);
    if (onMoveSelect) {
      onMoveSelect(newIndex);
    }
  };

  const handleFirst = () => updateSelectedIndividualMove(0);
  const handlePrev = () =>
    updateSelectedIndividualMove(selectedIndividualIndex - 1);
  const handleNext = () =>
    updateSelectedIndividualMove(selectedIndividualIndex + 1);
  const handleLast = () => updateSelectedIndividualMove(moveHistory.length - 1);

  return (
    <aside
      style={{ height }}
      className="min-h-screen bg-gray-800 text-white p-4 w-full flex flex-col">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-center">Biên bản nước đi</h2>
        <hr className="border-gray-600 mt-2" />
      </div>

      {/* Vùng danh sách cuộn (chỉ danh sách moves) */}
      <div
        ref={movesContainerRef}
        style={{ height: "50%" }}
        className="overflow-auto custom-scrollbar">
        {movePairs.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="px-2 py-1 text-left">#</th>
                <th className="px-2 py-1 text-left">Trắng</th>
                <th className="px-2 py-1 text-left">Đen</th>
              </tr>
            </thead>
            <tbody>
              {movePairs.map((pair, index) => {
                const whiteIndex = index * 2;
                const blackIndex = whiteIndex + 1;
                return (
                  <tr
                    id={`move-row-${index}`}
                    key={index}
                    className="cursor-pointer">
                    <td className="px-2 py-1">{pair.moveNumber}.</td>
                    <td
                      className={`px-2 py-1 transition-colors hover:bg-gray-700 ${
                        selectedIndividualIndex === whiteIndex
                          ? "bg-gray-700"
                          : ""
                      }`}
                      onClick={() => updateSelectedIndividualMove(whiteIndex)}>
                      {pair.white}
                    </td>
                    <td
                      className={`px-2 py-1 transition-colors hover:bg-gray-700 ${
                        selectedIndividualIndex === blackIndex
                          ? "bg-gray-700"
                          : ""
                      }`}
                      onClick={() => updateSelectedIndividualMove(blackIndex)}>
                      {pair.black}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center">Chưa có nước đi nào.</p>
        )}
      </div>

      {/* Vùng cố định dưới cùng chứa nút điều hướng và card hiển thị thông tin phân tích */}
      <div className="mt-2">
        {/* Nút điều hướng */}
        <div className="flex justify-evenly items-center mb-2">
          <button
            onClick={handleFirst}
            title="Nước đi đầu tiên"
            className="p-3 bg-gradient-to-r from-teal-500 to-teal-700 rounded-full shadow-lg hover:scale-110 transition transform duration-200 text-white">
            <FaAngleDoubleLeft size={20} />
          </button>
          <button
            onClick={handlePrev}
            title="Nước đi trước"
            className="p-3 bg-gradient-to-r from-teal-500 to-teal-700 rounded-full shadow-lg hover:scale-110 transition transform duration-200 text-white">
            <FaAngleLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            title="Nước đi tiếp theo"
            className="p-3 bg-gradient-to-r from-teal-500 to-teal-700 rounded-full shadow-lg hover:scale-110 transition transform duration-200 text-white">
            <FaAngleRight size={20} />
          </button>
          <button
            onClick={handleLast}
            title="Nước đi cuối"
            className="p-3 bg-gradient-to-r from-teal-500 to-teal-700 rounded-full shadow-lg hover:scale-110 transition transform duration-200 text-white">
            <FaAngleDoubleRight size={20} />
          </button>
        </div>

        {/* Card hiển thị thông tin phân tích với kích thước cố định */}
        {analysisResult && (
          <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg transition transform hover:scale-105">
            <h3 className="text-xl font-semibold mb-4 border-b border-gray-600 pb-2">
              Phân tích nước đi
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-300">Khai cuộc:</span>
                <span className="text-teal-400">
                  {analysisResult.openingName &&
                  analysisResult.openingName.trim() !== ""
                    ? analysisResult.openingName
                    : lastKnownOpening
                    ? lastKnownOpening
                    : "Không có khai cuộc"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-300">Phân loại:</span>
                <span className="text-teal-400">
                  {analysisResult.moveCategory &&
                  classificationMapping[analysisResult.moveCategory]
                    ? classificationMapping[analysisResult.moveCategory]
                    : analysisResult.moveCategory}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-300">
                  Nước tốt nhất:
                </span>
                <span className="text-teal-400">
                  {analysisResult.bestMove || "N/A"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

AnalysisSidebar.propTypes = {
  moveHistory: PropTypes.array.isRequired,
  onMoveSelect: PropTypes.func,
  analysisResult: PropTypes.object,
  height: PropTypes.string,
};

export default AnalysisSidebar;
