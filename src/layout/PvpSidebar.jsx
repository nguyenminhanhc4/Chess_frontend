import { useState } from "react";
import PropTypes from "prop-types";
import {
  FaHandPaper,
  FaCommentAlt,
  FaHandshake,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaChessKnight,
  FaPlay,
  FaPlus,
  FaUndo,
  FaRedo,
} from "react-icons/fa";
import axios from "axios";
import { useContext, useRef, useEffect } from "react";
import { UserAuthContext } from "../context/UserAuthContext";
import { toast } from "react-toastify";

const PvpSidebar = ({
  moveHistory,
  onSurrender,
  onUndo,
  onRedo,
  onRequestDraw,
  onNewGame,
  onSendChat,
  onSendDrawResponse,
  chatMessages,
  matchInfo,
  currentUser,
  gameMode,
  setGameMode,
}) => {
  const { user } = useContext(UserAuthContext);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const chatContainerRef = useRef(null);

  // State để lưu mốc thời gian đã chọn (nếu cần)
  const [selectedTimeValue, setSelectedTimeValue] = useState("");

  // Popup xác nhận cho các chức năng
  const [showConfirmSurrender, setShowConfirmSurrender] = useState(false);
  const [showConfirmNewGame, setShowConfirmNewGame] = useState(false);
  const moveLogContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (moveLogContainerRef.current) {
      moveLogContainerRef.current.scrollTop =
        moveLogContainerRef.current.scrollHeight;
    }
  }, [moveHistory]);

  // Mảng nhóm thời gian (nếu cần dùng cho tìm trận)
  const timeControlGroups = [
    {
      label: "Siêu Chớp",
      items: [
        { label: "1 phút", value: "1+0" },
        { label: "1 | 1", value: "1+1" },
        { label: "2 | 1", value: "2+1" },
      ],
    },
    {
      label: "Cờ Chớp",
      items: [
        { label: "3 phút", value: "3+0" },
        { label: "3 | 2", value: "3+2" },
        { label: "5 phút", value: "5+0" },
      ],
    },
    {
      label: "Cờ Nhanh",
      items: [
        { label: "10 phút", value: "10+0" },
        { label: "15 | 10", value: "15+10" },
        { label: "30 phút", value: "30+0" },
      ],
    },
    {
      label: "Hàng Ngày",
      items: [
        { label: "1 ngày", value: "1d" },
        { label: "3 ngày", value: "3d" },
        { label: "7 ngày", value: "7d" },
      ],
    },
  ];

  // Hàm xử lý khi bấm nút "Tìm trận" (cho pre-match view)
  const handleFindMatch = async () => {
    if (!user) {
      toast.info("Bạn cần đăng nhập để tìm trận");
      return;
    }
    if (!selectedTimeValue) {
      toast.info("Hãy chọn một mốc thời gian");
      return;
    }
    if (loadingMatch) {
      try {
        await axios.post(
          "http://localhost:8080/api/matchmaking/cancel",
          { ...user, gameMode: selectedTimeValue },
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
          { ...user, gameMode: selectedTimeValue },
          { headers: { "Content-Type": "application/json" } }
        );
        console.log("Joined matchmaking:", response.data);
      } catch (error) {
        console.error("Error joining matchmaking:", error);
        setLoadingMatch(false);
      }
    }
  };

  // Giao diện khi chưa có trận (Pre-Match)
  const renderPreMatchView = () => {
    return (
      <div className="p-4 text-white">
        <h2 className="text-2xl font-bold mb-4 text-center">Chọn thời gian</h2>
        <div className="flex flex-col space-y-4">
          {timeControlGroups.map((group) => (
            <div key={group.label}>
              <div className="font-bold text-lg mb-2">{group.label}</div>
              <div className="grid grid-cols-3 gap-2">
                {group.items.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => {
                      setSelectedTimeValue(item.value);
                      setGameMode(item.value); // Cập nhật gameMode toàn cục
                    }}
                    className={`p-2 rounded text-sm transition-colors ${
                      selectedTimeValue === item.value
                        ? "bg-green-600"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleFindMatch}
          disabled={!!matchInfo}
          className={`mt-4 w-full py-2 rounded font-bold flex items-center justify-center space-x-2
            ${
              matchInfo
                ? "bg-gray-500 cursor-not-allowed"
                : loadingMatch
                ? "bg-blue-500"
                : "bg-green-600 hover:bg-green-500"
            }`}>
          {loadingMatch ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Hủy tìm trận</span>
            </>
          ) : (
            <span>Chơi</span>
          )}
        </button>
      </div>
    );
  };

  // Giao diện khi đã có trận (In-Match)
  const renderInMatchView = () => {
    const movePairs = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      const whiteMove = moveHistory[i]?.san || "";
      const blackMove = moveHistory[i + 1]?.san || "";
      movePairs.push({
        moveNumber: Math.floor(i / 2) + 1,
        white: whiteMove,
        black: blackMove,
      });
    }
    return (
      <div className="p-4 text-white h-full flex flex-col">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-center">Biên bản</h2>
          <hr className="border-gray-600 mt-2" />
        </div>
        <div
          ref={moveLogContainerRef}
          className="overflow-y-auto mb-4 custom-scrollbar"
          style={{ maxHeight: "210px" }} // Giá trị này tùy thuộc vào chiều cao mỗi dòng
        >
          {movePairs.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">#</th>
                  <th className="text-left">Trắng</th>
                  <th className="text-left">Đen</th>
                </tr>
              </thead>
              <tbody>
                {movePairs.map((pair) => (
                  <tr key={pair.moveNumber} className="hover:bg-gray-700">
                    <td className="p-1">{pair.moveNumber}.</td>
                    <td className="p-1">{pair.white}</td>
                    <td className="p-1">{pair.black}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-center">Chưa có nước đi nào.</p>
          )}
        </div>
        <div className="flex flex-col space-y-2 mb-4">
          <button
            onClick={() => setShowConfirmSurrender(true)}
            className="w-full flex items-center justify-center space-x-2 p-2 bg-red-500 hover:bg-red-600 rounded">
            <FaHandPaper />
            <span>Đầu hàng</span>
          </button>
          <button
            onClick={() => {
              if (!matchInfo) {
                toast.info("Bạn chưa có trận đấu, không thể xin hòa.");
                return;
              }
              onRequestDraw();
            }}
            className="w-full flex items-center justify-center space-x-2 p-2 bg-yellow-500 hover:bg-yellow-600 rounded">
            <FaHandshake />
            <span>Xin hòa</span>
          </button>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <FaCommentAlt className="mr-2" /> Chat
          </h3>
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-auto mb-2 p-2 bg-gray-700 rounded h-40">
            {chatMessages && chatMessages.length > 0 ? (
              chatMessages.map((msg, index) => (
                <div key={index} className="mb-1 flex items-center">
                  <span className="font-bold">{msg.sender}:</span>{" "}
                  <span>{msg.text}</span>
                  {/* Nếu tin nhắn là yêu cầu hòa từ đối thủ, hiển thị 2 icon tick và X */}
                  {msg.msgType === "draw_request" &&
                    msg.sender !== currentUser && (
                      <span className="ml-2 flex items-center">
                        <button
                          onClick={() => onSendDrawResponse(true)}
                          className="text-green-500 ml-1"
                          title="Đồng ý hòa">
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => onSendDrawResponse(false)}
                          className="text-red-500 ml-1"
                          title="Từ chối hòa">
                          <FaTimes />
                        </button>
                      </span>
                    )}
                </div>
              ))
            ) : (
              <p className="text-gray-400">Chưa có tin nhắn.</p>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={!matchInfo}
              className="w-full p-3 pr-14 rounded-full bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
            />
            <button
              onClick={() => {
                if (chatInput.trim() !== "" && onSendChat) {
                  onSendChat(chatInput.trim());
                  setChatInput("");
                }
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-md transition duration-200 ease-in-out"
              disabled={!matchInfo}>
              Gửi
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside className="min-h-screen bg-gray-800 text-white p-4 w-full flex flex-col">
      {matchInfo ? renderInMatchView() : renderPreMatchView()}
      {/* Popup xác nhận đầu hàng */}
      {showConfirmSurrender && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-bold mb-4">
              Bạn có chắc chắn muốn đầu hàng?
            </h3>
            <p className="mb-4">Ván đấu sẽ kết thúc nếu bạn đồng ý.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  onSurrender();
                  setShowConfirmSurrender(false);
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded shadow">
                Đồng ý
              </button>
              <button
                onClick={() => setShowConfirmSurrender(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded shadow">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Popup xác nhận ván mới */}
      {showConfirmNewGame && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-bold mb-4">
              Bạn có chắc chắn muốn bắt đầu ván mới?
            </h3>
            <p className="mb-4">Ván đấu hiện tại sẽ bị mất nếu bạn đồng ý.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  onNewGame();
                  setShowConfirmNewGame(false);
                }}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded shadow">
                Đồng ý
              </button>
              <button
                onClick={() => setShowConfirmNewGame(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded shadow">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

PvpSidebar.propTypes = {
  moveHistory: PropTypes.array.isRequired,
  onSurrender: PropTypes.func.isRequired,
  onUndo: PropTypes.func,
  onRedo: PropTypes.func,
  onRequestDraw: PropTypes.func.isRequired,
  onNewGame: PropTypes.func,
  onSendChat: PropTypes.func,
  onSendDrawResponse: PropTypes.func.isRequired,
  chatMessages: PropTypes.array,
  matchInfo: PropTypes.object,
  currentUser: PropTypes.string.isRequired,
  gameMode: PropTypes.string,
  setGameMode: PropTypes.func,
};

export default PvpSidebar;
