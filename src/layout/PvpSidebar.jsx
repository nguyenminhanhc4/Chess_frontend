/* eslint-disable react-hooks/rules-of-hooks */
import PropTypes from "prop-types";
import {
  FaHandPaper,
  FaCommentAlt,
  FaHandshake,
  FaCheck,
  FaTimes,
  FaSpinner, // Import icon spinner
} from "react-icons/fa";
import axios from "axios";
import { useState, useRef, useEffect, useContext } from "react";
import { UserAuthContext } from "../context/UserAuthContext";
import { toast } from "react-toastify";

const PvpSidebar = ({
  moveHistory,
  onSurrender,
  onRequestDraw,
  onSendChat,
  onSendDrawResponse,
  chatMessages,
  matchInfo,
  currentUser,
}) => {
  const { user } = useContext(UserAuthContext);
  // Thêm state để theo dõi trạng thái loading của nút Tìm trận
  const [loadingMatch, setLoadingMatch] = useState(false);

  // Nhóm các nước đi thành cặp
  const movePairs = [];
  for (let i = 0; i < moveHistory.length; i++) {
    if (moveHistory[i].color === "w") {
      const whiteMove = moveHistory[i].san;
      let blackMove = "";
      if (i + 1 < moveHistory.length && moveHistory[i + 1].color === "b") {
        blackMove = moveHistory[i + 1].san;
        i++;
      }
      movePairs.push({
        moveNumber: movePairs.length + 1,
        white: whiteMove,
        black: blackMove,
      });
    } else {
      movePairs.push({
        moveNumber: movePairs.length + 1,
        white: "",
        black: moveHistory[i].san,
      });
    }
  }

  // State cho chat input
  const [chatInput, setChatInput] = useState("");
  // Tạo ref cho khung chat
  const chatContainerRef = useRef(null);

  const handleSendChatLocal = () => {
    if (chatInput.trim() !== "" && onSendChat) {
      onSendChat(chatInput.trim());
      setChatInput("");
    }
  };

  // Mỗi khi chatMessages thay đổi, tự động cuộn xuống cuối khung chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <aside className="min-h-screen bg-gray-800 text-white p-4 w-full flex flex-col">
      {/* Tiêu đề Biên bản */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-center">Biên bản</h2>
        <hr className="border-gray-600 mt-2" />
      </div>

      {/* Lịch sử nước đi */}
      <div className="flex-1 overflow-auto max-h-[450px] mb-4 custom-scrollbar">
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

      {/* Các nút điều khiển */}
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

        <button
          onClick={async () => {
            if (loadingMatch) {
              // Nếu đang trong trạng thái tìm trận, nhấn nút sẽ hủy tìm trận
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
              // Nếu chưa trong trạng thái loading và chưa có matchInfo, gọi API join
              if (!matchInfo) {
                setLoadingMatch(true);
                try {
                  const response = await axios.post(
                    "http://localhost:8080/api/matchmaking/join",
                    user,
                    { headers: { "Content-Type": "application/json" } }
                  );
                  console.log("Joined matchmaking:", response.data);
                  // Không tắt loading tại đây vì trạng thái sẽ tự cập nhật khi matchInfo thay đổi.
                } catch (error) {
                  console.error("Error joining matchmaking:", error);
                  setLoadingMatch(false);
                }
              }
            }
          }}
          // Chỉ vô hiệu hóa nút khi đã có trận (matchInfo)
          disabled={!!matchInfo}
          className={`w-full flex items-center justify-center space-x-2 p-2 rounded transition-colors duration-300 ${
            matchInfo
              ? "bg-gray-500 cursor-not-allowed"
              : loadingMatch
              ? "bg-blue-200"
              : "bg-blue-500 hover:bg-blue-600"
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

      {/* Phần Chat */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <FaCommentAlt className="mr-2" /> Chat
        </h3>
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-auto mb-2 p-2 bg-gray-700 rounded h-40">
          {chatMessages && chatMessages.length > 0 ? (
            chatMessages.map((msg, index) => {
              console.log(
                "Message type:",
                msg.msgType,
                "Message sender:",
                msg.sender
              );
              if (msg.msgType === "draw_request") {
                return (
                  <div
                    key={index}
                    className="mb-1 border border-yellow-500 p-1 rounded">
                    <span className="font-bold">{msg.sender} xin hòa. </span>
                    {msg.sender.toLowerCase().trim() !==
                    currentUser.toLowerCase().trim() ? (
                      <span>
                        <button
                          onClick={() => onSendDrawResponse(true)}
                          className="mr-2 text-green-500">
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => onSendDrawResponse(false)}
                          className="text-red-500">
                          <FaTimes />
                        </button>
                      </span>
                    ) : (
                      <span>(Đã gửi yêu cầu hòa)</span>
                    )}
                  </div>
                );
              } else if (msg.msgType === "draw_response") {
                return (
                  <div key={index} className="mb-1">
                    <span className="font-bold">{msg.sender}:</span>{" "}
                    <span>{msg.text}</span>
                  </div>
                );
              } else {
                return (
                  <div key={index} className="mb-1">
                    <span className="font-bold">{msg.sender}:</span>{" "}
                    <span>{msg.text}</span>
                  </div>
                );
              }
            })
          ) : (
            <p className="text-gray-400">Chưa có tin nhắn.</p>
          )}
        </div>
        {!matchInfo && (
          <p className="text-gray-400 mb-2">
            Chat chỉ hoạt động sau khi ghép đấu.
          </p>
        )}
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
            onClick={handleSendChatLocal}
            className="p-2 bg-blue-500 rounded-r hover:bg-blue-600"
            disabled={!matchInfo}>
            Gửi
          </button>
        </div>
      </div>
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
};

export default PvpSidebar;
