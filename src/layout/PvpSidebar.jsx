/* eslint-disable react-hooks/rules-of-hooks */
import PropTypes from "prop-types";
import {
  FaHandPaper,
  FaCommentAlt,
  FaHandshake,
  FaCheck,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";
import axios from "axios";
import { useState, useRef, useEffect, useContext } from "react";
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

  // Thêm state để lưu giá trị thời gian được chọn (VD "30+0", "1+1", v.v.)
  const [selectedTimeValue, setSelectedTimeValue] = useState("");

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Mảng nhóm thời gian (theo ảnh)
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
      label: "Chớp",
      items: [
        { label: "3 phút", value: "3+0" },
        { label: "3 | 2", value: "3+2" },
        { label: "5 phút", value: "5+0" },
      ],
    },
    {
      label: "Cờ Chớp",
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

  // Hàm xử lý khi bấm nút "Chơi" (hoặc "Tìm trận"/"Hủy tìm trận")
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
      // Hủy tìm trận
      try {
        await axios.post(
          "http://localhost:8080/api/matchmaking/cancel",
          { ...user, timeControl: selectedTimeValue },
          { headers: { "Content-Type": "application/json" } }
        );
        console.log("Cancelled matchmaking");
      } catch (error) {
        console.error("Error cancelling matchmaking:", error);
      }
      setLoadingMatch(false);
    } else {
      // Bắt đầu tìm trận
      setLoadingMatch(true);
      try {
        const response = await axios.post(
          "http://localhost:8080/api/matchmaking/join",
          { ...user, timeControl: selectedTimeValue },
          { headers: { "Content-Type": "application/json" } }
        );
        console.log("Joined matchmaking:", response.data);
      } catch (error) {
        console.error("Error joining matchmaking:", error);
        setLoadingMatch(false);
      }
    }
  };

  // Giao diện khi **chưa** có trận (Pre-Match)
  const renderPreMatchView = () => {
    return (
      <div className="p-4 text-white">
        <h2 className="text-2xl font-bold mb-4 text-center">Chọn thời gian</h2>

        {/* Liệt kê các nhóm thời gian */}
        <div className="flex flex-col space-y-4">
          {timeControlGroups.map((group) => (
            <div key={group.label}>
              <div className="font-bold text-lg mb-2">{group.label}</div>
              <div className="grid grid-cols-3 gap-2">
                {group.items.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setSelectedTimeValue(item.value)}
                    className={`p-2 rounded text-sm transition-colors 
                      ${
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

        {/* "Kiểm soát thời gian nhiều hơn" (chỉ là ví dụ, bạn tự gắn logic) */}
        <div
          className="mt-4 text-center text-sm text-gray-300 hover:underline cursor-pointer"
          onClick={() =>
            console.log("Mở popup tùy chọn thời gian chi tiết...")
          }>
          Kiểm soát thời gian nhiều hơn
        </div>

        {/* Nút Tìm trận hoặc Hủy tìm trận */}
        <button
          onClick={handleFindMatch}
          disabled={!!matchInfo} // Nếu đã có matchInfo rồi thì vô hiệu
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

  // Giao diện khi **đã** có trận (In-Match)
  const renderInMatchView = () => {
    // Nhóm các nước đi thành cặp (moveNumber, white, black)
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
        {/* Biên bản */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-center">Biên bản</h2>
          <hr className="border-gray-600 mt-2" />
        </div>

        <div className="flex-1 overflow-auto max-h-[250px] mb-4 custom-scrollbar">
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

        {/* Các nút Đầu hàng, Xin hòa (nếu cần) */}
        <div className="flex flex-col space-y-2 mb-4">
          <button
            onClick={() => {
              if (!matchInfo) {
                toast.info("Bạn chưa có trận đấu, không thể đầu hàng.");
                return;
              }
              onSurrender();
            }}
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

        {/* Khu vực Chat */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <FaCommentAlt className="mr-2" /> Chat
          </h3>
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-auto mb-2 p-2 bg-gray-700 rounded h-40">
            {chatMessages && chatMessages.length > 0 ? (
              chatMessages.map((msg, index) => (
                <div key={index} className="mb-1">
                  <span className="font-bold">{msg.sender}:</span>{" "}
                  <span>{msg.text}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400">Chưa có tin nhắn.</p>
            )}
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              className="flex-1 p-2 rounded-l bg-gray-600 text-white"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={!matchInfo}
            />
            <button
              onClick={() => {
                if (chatInput.trim() !== "" && onSendChat) {
                  onSendChat(chatInput.trim());
                  setChatInput("");
                }
              }}
              className="p-2 bg-blue-500 rounded-r hover:bg-blue-600"
              disabled={!matchInfo}>
              Gửi
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Quyết định hiển thị: nếu có matchInfo => InMatch, nếu không => PreMatch
  return (
    <aside className="min-h-screen bg-gray-800 text-white p-4 w-full flex flex-col">
      {matchInfo ? renderInMatchView() : renderPreMatchView()}
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
