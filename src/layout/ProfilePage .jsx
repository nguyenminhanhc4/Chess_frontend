import { useState, useContext, useEffect } from "react";
import Nav from "./nav";
import axios from "axios";
import { UserAuthContext } from "../context/UserAuthContext";
import { FaSpinner, FaCamera } from "react-icons/fa";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = ["#0088FE", "#FF8042", "#00C49F"];

const ProfilePage = () => {
  const { user, setUser } = useContext(UserAuthContext);
  const [username, setUsername] = useState(user?.username || "");
  const [profilePicture, setProfilePicture] = useState(
    user?.profilePicture || ""
  );
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [gameStats, setGameStats] = useState(null);
  const [preview, setPreview] = useState("");
  const COLORS = ["#90EE90", "#FF6B6B", "#FFD93D"];

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setProfilePicture(user.profilePicture || "");
      setEmail(user.email || "");
    }
    fetchGameStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchGameStats = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/game/stats/user/${user.id}`
      );
      setGameStats(response.data);
    } catch (error) {
      setMessage({
        text: "Không thể tải dữ liệu thống kê",
        type: "error",
      });
    }
  };

  const validateForm = () => {
    return (
      username.length >= 3 && validateEmail(email) && username !== user.username
    );
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  const MessageAlert = ({ type, message, onClose }) => (
    <div className={`...`}>
      {message}
      <button
        onClick={onClose}
        className="ml-4 text-gray-500 hover:text-gray-700">
        ×
      </button>
    </div>
  );

  const data = gameStats
    ? [
        { name: "Thắng", value: gameStats.winRate },
        { name: "Thua", value: gameStats.lossRate },
        { name: "Hòa", value: gameStats.drawRate },
      ]
    : [];

  const barData = gameStats
    ? [
        { name: "Tổng trận", value: gameStats.totalGames },
        { name: "Thắng", value: gameStats.wins },
        { name: "Thua", value: gameStats.losses },
      ]
    : [];

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setMessage(
          "File quá lớn. Vui lòng chọn file có kích thước nhỏ hơn 5MB."
        );
        return;
      }

      setUploadLoading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await axios.put(
          `http://localhost:8080/api/users/${user.id}/profile-picture`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setUser(response.data);
        setMessage("Ảnh đại diện đã được cập nhật!");
      } catch (error) {
        setMessage("Có lỗi khi upload ảnh: " + error.message);
      }
      setUploadLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.put(
        `http://localhost:8080/api/users/${user.id}`,
        { username, email }
      );
      setUser(response.data);
      setMessage("Cập nhật hồ sơ thành công!");
    } catch (error) {
      setMessage(
        "Có lỗi xảy ra: " +
          (error.response ? error.response.data : error.message)
      );
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex flex-grow h-screen">
        <div className="w-1/5 border-r border-gray-200 h-full">
          <Nav />
        </div>
        <main className="flex-1 p-6 h-full overflow-auto">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-slate-200 via-blue-200 to-slate-200 rounded-2xl shadow-lg p-8 mt-6">
            <h2 className="text-4xl font-extrabold text-slate-700 mb-8 border-b-2 border-slate-600 pb-4">
              Hồ sơ cá nhân
            </h2>

            {message.text && (
              <MessageAlert
                type={message.type}
                message={message.text}
                onClose={() => setMessage({ text: "", type: "" })}
              />
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {/* Phần thông tin và các trường input thu hẹp */}
              <div className="space-y-6">
                <div className="flex items-center space-x-6 mb-4">
                  <div className="relative group">
                    {/* Avatar giữ nguyên hình tròn nhờ rounded-full */}
                    <img
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-300 transition-all duration-300 group-hover:border-blue-500"
                      src={preview || profilePicture || "/user_default.jpg"}
                      alt="Avatar"
                    />
                    <label
                      htmlFor="fileInput"
                      className={`absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 flex items-center justify-center transition-all ${
                        uploadLoading
                          ? "opacity-50 cursor-not-allowed pointer-events-none"
                          : "cursor-pointer hover:bg-blue-700 hover:scale-105"
                      }`}
                      style={{ transform: "translate(25%, 25%)" }}
                      onClick={(e) => uploadLoading && e.preventDefault()}>
                      {uploadLoading ? (
                        <FaSpinner className="animate-spin text-white w-5 h-5" />
                      ) : (
                        <FaCamera className="w-5 h-5" />
                      )}
                    </label>
                    <input
                      id="fileInput"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Tên: {username}</p>
                    <p className="text-lg font-medium">Email: {email}</p>
                    <p className="text-lg font-medium">
                      Elo Rating: {user?.rating || 600}
                    </p>
                    {gameStats && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">
                          Tổng trận: {gameStats.totalGames}
                        </p>
                        <p className="text-sm text-green-600">
                          Thắng: {gameStats.wins}
                        </p>
                        <p className="text-sm text-red-500">
                          Thua: {gameStats.losses}
                        </p>
                        <p className="text-sm text-yellow-600">
                          Hòa: {gameStats.draws}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-gray-700 font-medium mb-2">
                      Tên người dùng
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username || ""}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full md:w-64 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
                      placeholder="Nhập tên người dùng"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-gray-700 font-medium mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email || ""}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full md:w-64 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
                      placeholder="Nhập email"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="rating"
                      className="block text-gray-700 font-medium mb-2">
                      Elo Rating
                    </label>
                    <input
                      id="rating"
                      type="text"
                      value={user?.rating || 600}
                      readOnly
                      className="w-full md:w-64 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || !validateForm()}>
                    {loading ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : null}
                    {loading ? "Đang cập nhật..." : "Cập nhật hồ sơ"}
                  </button>
                </form>
              </div>
              {/* Phần biểu đồ tích hợp bên phải */}
              <div className="flex flex-col gap-8">
                <div className="w-full h-64 md:h-96 bg-white/50 rounded-xl p-4 backdrop-blur-sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                        boxShadow: "0 2px 4px rgba(148,163,184,0.1)",
                      }}
                      itemStyle={{ color: "#475569" }}
                    />
                    <PieChart aria-label="Thống kê tỷ lệ thắng thua">
                      <input aria-label="Tên người dùng" role="textbox" />
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius="80%"
                        fill="#8884d8"
                        dataKey="value"
                        isAnimationActive={true}
                        animationBegin={400}
                        animationDuration={1200}>
                        {data.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Biểu đồ cột mới */}
                <div className="w-full h-64 md:h-96 bg-white/50 rounded-xl p-4 backdrop-blur-sm">
                  <ResponsiveContainer>
                    <BarChart
                      data={barData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        stroke="#94A3B8"
                        tick={{ fill: "#64748B" }}
                      />
                      <YAxis stroke="#94A3B8" tick={{ fill: "#64748B" }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="value"
                        fill="#8884d8"
                        name="Số trận"
                        animationDuration={600}>
                        {barData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              [
                                "#C0C0C0", // Màu cho tổng trận
                                COLORS[0], // Màu cho thắng
                                COLORS[1], // Màu cho thua
                              ][index]
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
