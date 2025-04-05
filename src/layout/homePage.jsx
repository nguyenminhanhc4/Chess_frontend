import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "./nav";
import { toast } from "react-toastify";
import { UserAuthContext } from "../context/UserAuthContext";
import { HiUserGroup, HiChip, HiChartBar, HiUser } from "react-icons/hi";
import { FiX } from "react-icons/fi";

const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(UserAuthContext);

  // Hàm xử lý cho nút "Chơi với người" trong modal
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

  const handleAnalysis = () => {
    if (!user) {
      toast.warn("Vui lòng đăng nhập để sử dụng tính năng phân tích!");
      navigate("/login");
    } else {
      navigate("/history");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-grow">
        <div className="hidden md:block w-1/5 h-full border-r border-gray-300">
          <Nav />
        </div>

        <main className="flex-1 pt-3 px-6 bg-gray-100 max-h-screen overflow-auto">
          <section
            className="relative bg-cover bg-center h-80 rounded-lg shadow-lg"
            style={{ backgroundImage: "url('/images/chess-hero.jpg')" }}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-800/70 rounded-lg"></div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white">
              <h1 className="text-5xl font-bold mb-4">
                Khám phá thế giới Cờ Vua
              </h1>
              <p className="text-xl mb-6">
                Chơi trực tuyến, học hỏi chiến thuật và nâng cao kỹ năng cờ vua
                của bạn.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-full font-semibold transition-transform hover:scale-105 shadow-lg hover:shadow-xl">
                Chơi Ngay
              </button>
            </div>
          </section>

          <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Thẻ Chơi trực tuyến */}
            <div
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 group border border-gray-200 cursor-pointer"
              onClick={handleOnlinePlay} // Dùng chung hàm với nút trong modal
            >
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <HiUserGroup className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Chơi trực tuyến</h2>
              <p className="text-gray-600">
                Tham gia các trận đấu trực tuyến với đối thủ từ khắp nơi.
              </p>
            </div>

            {/* Thẻ Chơi với máy */}
            <div
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 group border border-gray-200 cursor-pointer"
              onClick={() => navigate("/main")} // Điều hướng trực tiếp
            >
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <HiChip className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Chơi với máy</h2>
              <p className="text-gray-600">
                Thách thức trí tuệ với các đối thủ AI thông minh.
              </p>
            </div>

            {/* Thẻ Phân tích ván đấu */}
            <div
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 group border border-gray-200 cursor-pointer"
              onClick={handleAnalysis} // Xử lý phân tích
            >
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <HiChartBar className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Phân tích ván đấu</h2>
              <p className="text-gray-600">
                Xem lại và phân tích các ván đấu của bạn để cải thiện kỹ năng.
              </p>
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Về Chess App
            </h2>
            <p className="text-gray-800 leading-relaxed">
              Chess App là nền tảng trực tuyến dành cho những người yêu thích cờ
              vua, cho phép bạn chơi cờ trực tuyến, so sánh kỹ năng thông qua
              bảng xếp hạng và phân tích các ván đấu để cải thiện chiến thuật.
              Với giao diện thân thiện và hiện đại, Chess App hứa hẹn mang đến
              trải nghiệm chơi cờ đầy thú vị cho cả người mới và cao thủ.
            </p>
          </section>
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-fade-in">
          <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 md:p-8 max-w-md w-[95%] shadow-2xl border border-gray-600/30 animate-scale-in overflow-hidden">
            {/* Nút Hủy */}
            <div className="absolute top-3 right-3 z-50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-amber-400 rounded-full hover:bg-gray-700/30 transition-colors">
                {/* Chọn 1 trong 2 icon dưới */}
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
                {/* Nút Chơi với người */}
                <button
                  onClick={handleOnlinePlay}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-emerald-600/90 hover:bg-emerald-600 transition-all rounded-lg group">
                  <HiUser className="w-5 h-5 text-emerald-200 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-emerald-50">
                    Chơi với người
                  </span>
                </button>

                {/* Nút Chơi với máy */}
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
    </div>
  );
};

export default HomePage;
