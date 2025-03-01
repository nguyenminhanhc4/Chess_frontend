// main.jsx
import Header from "./header";
import Nav from "./nav";
import Sidebar from "./sidebar";
import Footer from "./footer";
import ChessboardComponent from "../components/chessboard";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header ở đầu */}
      <Header />

      {/* Nội dung chính: chia thành 3 cột */}
      <div className="flex flex-grow">
        {/* Cột bên trái chứa nav (full height) */}
        <div className="w-1/5 h-full border-r border-gray-300">
          <Nav />
        </div>

        {/* Cột giữa chứa Chessboard */}
        <div className="w-3/5 flex items-center justify-center">
          <ChessboardComponent />
        </div>

        {/* Cột bên phải chứa sidebar (full height) */}
        <div className="w-1/5 h-full border-l border-gray-300">
          <Sidebar />
        </div>
      </div>

      {/* Footer ở dưới cùng */}
      <Footer />
    </div>
  );
};


export default MainLayout;
