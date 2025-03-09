import { FaGamepad, FaRobot, FaChartBar, FaHome, FaCog } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserAuthContext } from "../context/UserAuthContext";

const Nav = () => {
  const { user } = useContext(UserAuthContext);

  return (
    <nav className="min-h-screen bg-gray-700 text-white p-6 w-full flex flex-col justify-between">
      {/* Phần trên */}
      <div>
        {/* Logo hình tròn và text "Chess App" */}
        <div className="flex flex-col items-start mb-8">
          <div className="flex items-center space-x-1">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <img
                src="/logo_chess_app.png"  // Đảm bảo file nằm trong public
                alt="Chess App Logo"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="text-xl font-bold">Chess App</div>
          </div>
        </div>

        {/* Thông tin người dùng (nếu đã đăng nhập) */}
        {user && (
          <div className="flex items-center space-x-2 mb-8">
            <img
              src={user.profilePicture || "/user_default.jpg"}  // Đảm bảo file ảnh nằm trong public
              alt="Avatar"
              className="w-10 h-10 rounded-full border-2 border-blue-300"
            />
            <div>
              <div className="font-semibold">{user.username}</div>
              <div className="text-sm text-gray-200">Rating: {user.rating ?? 600}</div>
            </div>
          </div>
        )}

        {/* Danh sách chức năng chính */}
        <ul className="space-y-4">
          <li className="text-gray-400 uppercase text-xs tracking-wider">Chế độ chơi</li>
          <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-600 cursor-pointer">
            <FaGamepad />
            <Link to="/online" className="text-white">Chơi trực tuyến</Link>
          </li>
          <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-600 cursor-pointer">
            <FaRobot />
            <Link to="/main" className="text-white">Chơi với máy</Link>
          </li>

          <li className="mt-6 text-gray-400 uppercase text-xs tracking-wider">Phân tích & Lịch sử</li>
          <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-600 cursor-pointer">
            <FaChartBar />
            <Link to="/analysis" className="text-white">Lưu trữ & phân tích ván đấu</Link>
          </li>

          <li className="mt-6 text-gray-400 uppercase text-xs tracking-wider">Khác</li>
          <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-600 cursor-pointer">
            <FaHome />
            <Link to="/" className="text-white">Trang chủ</Link>
          </li>
          <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-600 cursor-pointer">
            <FaCog />
            <Link to="/settings" className="text-white">Cài đặt</Link>
          </li>
        </ul>
      </div>

      {/* Phần dưới */}
      <div className="mt-8">
        <hr className="border-gray-600 mb-4" />
        <div className="text-sm text-gray-300">© 2025 Chess App</div>
      </div>
    </nav>
  );
};

export default Nav;
