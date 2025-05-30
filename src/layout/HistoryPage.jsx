import { useState, useEffect, useContext } from "react";
import axios from "axios";
import Nav from "./nav";
import { UserAuthContext } from "../context/UserAuthContext";
import { Chessboard } from "react-chessboard";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { HiUser, HiChip } from "react-icons/hi";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";
const baseURL = import.meta.env.VITE_API_URL;

const HistoryPage = () => {
  const { user } = useContext(UserAuthContext);
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [filterType, setFilterType] = useState("ALL");
  const [searchResult, setSearchResult] = useState("");
  const [hoveredGame, setHoveredGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const navigate = useNavigate();

  const handleOnlinePlay = () => {
    if (!user) {
      toast.warn("Bạn phải đăng nhập để sử dụng tính năng này!");
      setIsModalOpen(false);
      navigate("/login");
    } else {
      setIsModalOpen(false);
      navigate("/online");
    }
  };

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      axios
        .get(`${baseURL}/api/game/history/${user.username}`)
        .then((response) => {
          setGames(response.data);
          setFilteredGames(response.data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Lỗi lấy lịch sử game:", error);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let filtered = games;
    if (filterType !== "ALL") {
      filtered = filtered.filter(
        (game) => game.opponentType.toUpperCase() === filterType
      );
    }
    if (searchResult.trim() !== "") {
      filtered = filtered.filter((game) =>
        game.result.toLowerCase().includes(searchResult.toLowerCase())
      );
    }
    setFilteredGames(filtered);
    setCurrentPage(1); // reset trang khi bộ lọc thay đổi
  }, [games, filterType, searchResult]);

  // Tính toán các ván đấu hiển thị theo trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGames = filteredGames.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredGames.length / itemsPerPage);

  const handleAnalysisButtonClick = (game, e) => {
    e.stopPropagation();
    navigate(`/analysis/${game.id}`);
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Hàm render các nút phân trang với ellipsis
  const renderPaginationButtons = () => {
    const pages = [];
    if (totalPages <= 7) {
      // Hiển thị tất cả các nút nếu tổng trang <= 7
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => goToPage(i)}
            className={`px-3 py-1 rounded ${
              currentPage === i
                ? "bg-teal-800 text-white"
                : "bg-teal-600 text-gray-200"
            }`}>
            {i}
          </button>
        );
      }
    } else {
      // Nếu tổng trang > 7
      if (currentPage <= 4) {
        // Trang hiện tại nằm trong 4 trang đầu
        for (let i = 1; i <= 5; i++) {
          pages.push(
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`px-3 py-1 rounded ${
                currentPage === i
                  ? "bg-teal-800 text-white"
                  : "bg-teal-600 text-gray-200"
              }`}>
              {i}
            </button>
          );
        }
        pages.push(
          <span key="ellipsis1" className="px-3 py-1">
            ...
          </span>
        );
        pages.push(
          <button
            key={totalPages}
            onClick={() => goToPage(totalPages)}
            className="px-3 py-1 bg-teal-600 text-gray-200 rounded">
            {totalPages}
          </button>
        );
      } else if (currentPage > totalPages - 4) {
        // Trang hiện tại nằm trong 4 trang cuối
        pages.push(
          <button
            key={1}
            onClick={() => goToPage(1)}
            className="px-3 py-1 bg-teal-600 text-gray-200 rounded">
            1
          </button>
        );
        pages.push(
          <span key="ellipsis1" className="px-3 py-1">
            ...
          </span>
        );
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`px-3 py-1 rounded ${
                currentPage === i
                  ? "bg-teal-800 text-white"
                  : "bg-teal-600 text-gray-200"
              }`}>
              {i}
            </button>
          );
        }
      } else {
        // Trang hiện tại nằm giữa
        pages.push(
          <button
            key={1}
            onClick={() => goToPage(1)}
            className="px-3 py-1 bg-teal-600 text-gray-200 rounded">
            1
          </button>
        );
        pages.push(
          <span key="ellipsis1" className="px-3 py-1">
            ...
          </span>
        );
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`px-3 py-1 rounded ${
                currentPage === i
                  ? "bg-teal-800 text-white"
                  : "bg-teal-600 text-gray-200"
              }`}>
              {i}
            </button>
          );
        }
        pages.push(
          <span key="ellipsis2" className="px-3 py-1">
            ...
          </span>
        );
        pages.push(
          <button
            key={totalPages}
            onClick={() => goToPage(totalPages)}
            className="px-3 py-1 bg-teal-600 text-gray-200 rounded">
            {totalPages}
          </button>
        );
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1a202c] text-white">
      <div className="flex flex-grow">
        <div className="w-1/5 h-full border-r border-gray-700">
          <Nav />
        </div>
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-6 text-white">
            Lịch sử ván đấu
          </h1>
          {/* Bộ lọc và tìm kiếm */}
          <div className="mb-6 p-4 bg-[#2d3748] rounded-lg shadow flex flex-wrap items-end gap-4 border border-teal-400">
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-white">Bộ lọc</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="p-2 bg-[#2d3748] border border-teal-400 rounded focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="ALL">Tất cả</option>
                <option value="BOT">Bot</option>
                <option value="HUMAN">Người</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-white">
                Tìm kiếm kết quả
              </label>
              <input
                type="text"
                placeholder="Ví dụ: WIN, LOSE, DRAW..."
                value={searchResult}
                onChange={(e) => setSearchResult(e.target.value)}
                className="p-2 bg-[#2d3748] border border-teal-400 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Container: bảng danh sách và preview bàn cờ */}
          <div className="flex flex-col lg:flex-row bg-[#2d3748] rounded-lg shadow overflow-hidden">
            {isLoading ? (
              <div className="w-full p-8 text-center text-gray-400">
                Đang tải lịch sử...
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="w-full p-8 text-center flex flex-col items-center justify-center">
                <p className="text-xl text-gray-400 mb-4">
                  {searchResult || filterType !== "ALL"
                    ? "Không tìm thấy ván đấu phù hợp"
                    : "Bạn chưa có ván đấu nào"}
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                  Bắt đầu ván cờ mới
                </button>
              </div>
            ) : (
              <>
                {/* Bảng danh sách ván đấu */}
                <div className="w-full lg:w-3/5 overflow-auto p-2">
                  <table className="min-w-full table-fixed">
                    <thead className="bg-teal-600 hidden lg:table-header-group">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Ngày
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Người chơi
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Đối thủ
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Loại đối thủ
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Kết quả
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                          Phân tích
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#2d3748] divide-y divide-gray-700">
                      {currentGames.map((game) => (
                        <tr
                          key={game.id}
                          className="hover:bg-[#1e293b] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredGame(game)}
                          onMouseLeave={() => setHoveredGame(null)}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-200">
                            {new Date(game.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-200">
                            {game.playerUsername}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-200">
                            {game.opponent}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-200">
                            {game.opponentType}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-200">
                            {game.result}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-200">
                            <button
                              className="text-blue-300 hover:text-blue-500"
                              onClick={(e) =>
                                handleAnalysisButtonClick(game, e)
                              }>
                              <FaSearch size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Phân trang */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-4 space-x-2">
                      <button
                        onClick={() =>
                          currentPage > 1 && goToPage(currentPage - 1)
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-teal-600 rounded disabled:opacity-50">
                        Prev
                      </button>
                      {renderPaginationButtons()}
                      <button
                        onClick={() =>
                          currentPage < totalPages && goToPage(currentPage + 1)
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-teal-600 rounded disabled:opacity-50">
                        Next
                      </button>
                    </div>
                  )}
                </div>

                {/* Cột preview bàn cờ */}
                <div className="w-full lg:w-2/5 p-4 border-t lg:border-l border-gray-700">
                  {hoveredGame ? (
                    <div>
                      <Chessboard
                        position={hoveredGame.finalFen || "start"}
                        boardWidth={300}
                      />
                      <p className="text-sm mt-2 text-center">
                        {hoveredGame.playerUsername} vs {hoveredGame.opponent}
                      </p>
                    </div>
                  ) : (
                    <div className="text-gray-400 italic">
                      Di chuột vào 1 ván đấu để xem bàn cờ
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          {/* Thêm modal tương tự HomePage */}
          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-fade-in">
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 md:p-8 max-w-md w-[95%] shadow-2xl border border-gray-600/30 animate-scale-in overflow-hidden">
                <div className="absolute top-3 right-3 z-50">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-gray-400 hover:text-amber-400 rounded-full hover:bg-gray-700/30 transition-colors">
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
                <div
                  className="absolute inset-0 opacity-10 bg-[length:30px] bg-repeat"
                  style={{
                    backgroundImage: "url('/images/chess-pattern.svg')",
                  }}></div>

                <div className="relative z-10 space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-white text-center mb-6">
                      Chọn chế độ chơi
                    </h2>
                    <p className="text-gray-400 mt-2 text-sm">
                      Chọn đối thủ bạn muốn thách đấu
                    </p>
                  </div>
                  <div className="space-y-4">
                    <button
                      onClick={handleOnlinePlay}
                      className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-emerald-600/90 hover:bg-emerald-600 transition-all rounded-lg group">
                      <HiUser className="w-5 h-5 text-emerald-200 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-emerald-50">
                        Chơi với người
                      </span>
                    </button>

                    <button
                      onClick={() => navigate("/main")}
                      className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-blue-600/90 hover:bg-blue-600 transition-all rounded-lg group">
                      <HiChip className="w-5 h-5 text-blue-200 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-blue-50">
                        Chơi với máy
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HistoryPage;
