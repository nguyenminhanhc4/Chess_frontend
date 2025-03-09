import { useState, useEffect, useContext } from "react";
import axios from "axios";
import Header from "./header";
import Nav from "./nav";
import Footer from "./footer";
import { UserAuthContext } from "../context/UserAuthContext";
// Import component Chessboard của thư viện react-chessboard để hiển thị preview
import { Chessboard } from "react-chessboard";

const HistoryPage = () => {
  const { user } = useContext(UserAuthContext);
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [filterType, setFilterType] = useState("ALL");
  const [searchResult, setSearchResult] = useState("");
  // State để lưu game đang được hover
  const [hoveredGame, setHoveredGame] = useState(null);

  useEffect(() => {
    if (user) {
      axios
        .get(`http://localhost:8080/api/game/history/${user.username}`)
        .then((response) => {
          setGames(response.data);
          setFilteredGames(response.data);
        })
        .catch((error) => console.error("Lỗi lấy lịch sử game:", error));
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
  }, [games, filterType, searchResult]);

  return (
    <div className="min-h-screen flex flex-col bg-[#1a202c] text-white">
      <Header />

      <div className="flex flex-grow">
        <div className="w-1/5 h-full border-r border-gray-700">
          <Nav />
        </div>

        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-6 text-white">Lịch sử ván đấu</h1>

          {/* Bộ lọc và tìm kiếm */}
          <div className="mb-6 p-4 bg-[#2d3748] rounded-lg shadow flex flex-wrap items-end gap-4 border border-teal-400">
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-white">Bộ lọc</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="p-2 bg-[#2d3748] border border-teal-400 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">Tất cả</option>
                <option value="BOT">Bot</option>
                <option value="HUMAN">Người</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-white">Tìm kiếm kết quả</label>
              <input
                type="text"
                placeholder="Ví dụ: WIN, LOSE, DRAW..."
                value={searchResult}
                onChange={(e) => setSearchResult(e.target.value)}
                className="p-2 bg-[#2d3748] border border-teal-400 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Container hai cột: bảng danh sách và preview bàn cờ */}
          <div className="flex bg-[#2d3748] rounded-lg shadow overflow-hidden">
            {/* Cột danh sách ván đấu */}
            <div className="w-3/5 overflow-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-teal-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Ngày</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Người chơi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Đối thủ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Loại đối thủ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Kết quả</th>
                  </tr>
                </thead>
                <tbody className="bg-[#2d3748] divide-y divide-gray-700">
                  {filteredGames.map((game) => (
                    <tr 
                      key={game.id} 
                      className="hover:bg-[#1e293b] transition-colors cursor-pointer"
                      onMouseEnter={() => setHoveredGame(game)}
                      onMouseLeave={() => setHoveredGame(null)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        {new Date(game.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        {game.playerUsername}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        {game.opponent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        {game.opponentType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        {game.result}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cột preview bàn cờ */}
            <div className="w-2/5 p-4 border-l border-gray-700 flex flex-col items-center justify-center">
              {hoveredGame ? (
                <div>
                  {/* Sử dụng thuộc tính finalFen để render bàn cờ, nếu không có sẽ hiển thị vị trí khởi đầu */}
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
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default HistoryPage;
