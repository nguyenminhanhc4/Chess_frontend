// nav.jsx
import { FaGamepad, FaRobot, FaChartBar } from "react-icons/fa";

const Nav = () => {
  return (
    <nav className="h-screen bg-gray-700 text-white p-6 w-full">
      <ul className="space-y-4">
        <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-600 cursor-pointer">
          <FaGamepad />
          <a href="#">Chơi trực tuyến</a>
        </li>
        <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-600 cursor-pointer">
          <FaRobot />
          <a href="#">Chơi với máy</a>
        </li>
        <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-600 cursor-pointer">
          <FaChartBar />
          <a href="#">Lưu trữ và phân tích ván đấu</a>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
