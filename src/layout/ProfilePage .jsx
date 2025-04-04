import React, { useState, useContext, useEffect } from "react";
import Header from "./header";
import Nav from "./nav";
import Footer from "./footer";
import axios from "axios";
import { UserAuthContext } from "../context/UserAuthContext";
import { FaSpinner, FaCamera } from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
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
  const [message, setMessage] = useState("");
  const [gameStats, setGameStats] = useState(null);

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
        `http://localhost:8080/api/game/stats/${user.username}`
      );
      setGameStats(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu thống kê trận đấu:", error);
    }
  };

  const data = gameStats
    ? [
        { name: "Thắng", value: gameStats.winRate },
        { name: "Thua", value: gameStats.lossRate },
        { name: "Hòa", value: gameStats.drawRate },
      ]
    : [];

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
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
        `http://localhost:8080/api/game/stats/${user.username}`,
        { ...user, username, profilePicture, email }
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
      <Header />
      <div className="flex flex-grow h-screen">
        <div className="w-1/5 border-r border-gray-200 h-full">
          <Nav />
        </div>
        <main className="flex-1 p-6 h-full overflow-auto">
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Hồ sơ cá nhân
            </h2>

            {message && (
              <div className="mb-4 text-center p-4 rounded bg-green-100 text-green-700">
                {message}
              </div>
            )}

            <div className="flex space-x-6">
              {/* Phần thông tin và các trường input thu hẹp */}
              <div className="w-1/2">
                <div className="flex items-center space-x-6 mb-4">
                  <div className="relative">
                    {/* Avatar giữ nguyên hình tròn nhờ rounded-full */}
                    <img
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-300"
                      src={profilePicture || "/user_default.jpg"}
                      alt="Avatar"
                    />
                    <label
                      htmlFor="fileInput"
                      className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer flex items-center justify-center">
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
                  <div>
                    <p className="text-lg font-medium">Tên: {username}</p>
                    <p className="text-lg font-medium">Email: {email}</p>
                    <p className="text-lg font-medium">
                      Elo Rating: {user?.rating || 600}
                    </p>
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
                      className="w-64 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
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
                      className="w-64 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
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
                      className="w-64 border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-600"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-64 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex justify-center items-center">
                    {loading ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : null}
                    {loading ? "Đang cập nhật..." : "Cập nhật hồ sơ"}
                  </button>
                </form>
              </div>
              {/* Phần biểu đồ tích hợp bên phải */}
              <div className="flex-1 flex items-center justify-center w-screen">
                <div style={{ width: "300px", height: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
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
                        dataKey="value">
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
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
