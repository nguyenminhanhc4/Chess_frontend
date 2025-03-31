import React, { useState, useContext, useEffect } from "react";
import Header from "./header";
import Nav from "./nav";
import Footer from "./footer";
import axios from "axios";
import { UserAuthContext } from "../context/UserAuthContext";

const ProfilePage = () => {
  const { user, setUser } = useContext(UserAuthContext);
  const [username, setUsername] = useState(user?.username || "");
  const [profilePicture, setProfilePicture] = useState(
    user?.profilePicture || ""
  );
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Cập nhật giá trị khi user thay đổi
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setProfilePicture(user.profilePicture || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Xử lý chọn file ảnh đại diện
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Sử dụng FileReader để chuyển file thành Data URL (Base64)
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      // Nếu dùng proxy trong package.json, bạn có thể dùng đường dẫn tương đối
      // hoặc sử dụng URL tuyệt đối nếu cần
      const response = await axios.put(
        `http://localhost:8080/api/users/${user.id}`,
        {
          ...user,
          username,
          profilePicture,
          email,
        }
      );
      setUser(response.data);
      setMessage("Cập nhật hồ sơ thành công!");
    } catch (error) {
      // Kiểm tra xem error.response có tồn tại không để hiển thị thông báo chính xác
      const errorMsg = error.response ? error.response.data : error.message;
      setMessage("Có lỗi xảy ra: " + errorMsg);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await axios.put(
          `http://localhost:8080/api/users/${user.id}/profile-picture`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        // Cập nhật lại thông tin user với URL ảnh mới
        setUser(response.data);
        setMessage("Ảnh đại diện đã được cập nhật!");
      } catch (error) {
        setMessage("Có lỗi khi upload ảnh: " + error.message);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-grow">
        <div className="w-1/5 border-r border-gray-200">
          <Nav />
        </div>
        <main className="flex-1 p-6">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Hồ sơ cá nhân
            </h2>

            {message && (
              <div className="mb-4 text-center p-4 rounded bg-green-100 text-green-700">
                {message}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-300"
                    src={profilePicture || "/user_default.jpg"}
                    alt="Avatar"
                  />
                  <label
                    htmlFor="fileInput"
                    className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer">
                    {/* Icon chỉnh sửa */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path
                        fillRule="evenodd"
                        d="M2 13.5A1.5 1.5 0 013.5 12h1.172l9.293-9.293a1.5 1.5 0 012.121 0l1.414 1.414a1.5 1.5 0 010 2.121L8.707 15.707a1.5 1.5 0 01-1.06.439H3.5A1.5 1.5 0 012 15.5v-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </label>
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 space-y-4">
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                {loading ? "Đang cập nhật..." : "Cập nhật hồ sơ"}
              </button>
            </form>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
