import {
  FaGamepad,
  FaRobot,
  FaChartBar,
  FaHome,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { toast } from "react-toastify";
import { UserAuthContext } from "../context/UserAuthContext";
import ProtectedLink from "./ProtectedLink"; // Đảm bảo đường dẫn chính xác
import { getSessionId } from "../utils/session";
const Nav = () => {
  const { user } = useContext(UserAuthContext);
  const { logout } = useContext(UserAuthContext);

  const handleLogout = () => {
    logout();
    toast.success("Đã đăng xuất thành công");
  };

  return (
    <nav className="min-h-screen bg-gray-700 text-white p-6 w-full flex flex-col justify-between">
      <div>
        {/* Logo và tiêu đề */}
        <div className="flex flex-col items-start">
          <div className="flex items-center space-x-1">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <img
                src="/logo_chess_app.png"
                alt="Chess App Logo"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="text-xl font-bold">Chess App</div>
          </div>
        </div>

        {/* Nếu đã đăng nhập thì hiển thị thông tin người dùng */}
        {user ? (
          // Block ĐÃ đăng nhập - Giữ nguyên height
          <div className="mb-4 h-24">
            {" "}
            {/* Fixed height */}
            <div className="flex items-center space-x-3 h-full">
              {" "}
              {/* Full height container */}
              <img
                src={user.profilePicture || "/user_default.jpg"}
                alt="Avatar"
                className="w-14 h-14 rounded-full border-2 border-blue-400 shrink-0"
              />
              <div className="flex flex-col justify-center min-w-0">
                <div className="font-semibold text-lg truncate">
                  {user.username}
                </div>
                <div className="text-sm text-gray-300">
                  Rating:{" "}
                  <span className="text-yellow-400">{user.rating ?? 600}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Block CHƯA đăng nhập - Thêm mới
          <div className="mb-4 h-24 flex items-center">
            <Link
              to="/login"
              className="w-full p-4 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors flex items-center space-x-3">
              <span className="font-medium text-blue-300 hover:text-blue-200">
                Đăng nhập để chơi cờ!
              </span>
            </Link>
          </div>
        )}

        {/* Danh sách chức năng */}
        <ul className="space-y-4">
          <li className="text-gray-400 uppercase text-xs tracking-wider">
            Chế độ chơi
          </li>
          <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-600 cursor-pointer">
            <FaGamepad />
            <ProtectedLink to="/online" className="text-white">
              Chơi trực tuyến
            </ProtectedLink>
          </li>
          <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-600 cursor-pointer">
            <FaRobot />
            {/* Cho phép chơi với máy mà không cần đăng nhập */}
            <Link to="/main" className="text-white">
              Chơi với máy
            </Link>
          </li>
          <li className="mt-6 text-gray-400 uppercase text-xs tracking-wider">
            Phân tích & Lịch sử
          </li>
          <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-600 cursor-pointer">
            <FaChartBar />
            <ProtectedLink to="/history" className="text-white">
              Lưu trữ & phân tích ván đấu
            </ProtectedLink>
          </li>
          <li className="mt-6 text-gray-400 uppercase text-xs tracking-wider">
            Khác
          </li>
          <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-600 cursor-pointer">
            <FaHome />
            <Link to="/" className="text-white">
              Trang chủ
            </Link>
          </li>
          <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-600 cursor-pointer">
            <FaUser />
            <ProtectedLink to="/profile" className="text-white">
              Hồ sơ
            </ProtectedLink>
          </li>
          {user && (
            <li
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-600 cursor-pointer"
              onClick={handleLogout}>
              <FaSignOutAlt className="text-red-400" />
              <span className="text-red-400 hover:text-red-300">Đăng xuất</span>
            </li>
          )}
        </ul>
      </div>

      <div className="text-center">
        <hr className="border-gray-600 mb-4" />
        <div className="text-sm text-gray-300">© 2025 Chess App</div>
      </div>
    </nav>
  );
};

export default Nav;
