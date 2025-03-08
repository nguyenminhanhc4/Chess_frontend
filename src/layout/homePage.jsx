import Header from "./header";
import Nav from "./nav";
import Footer from "./footer";

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Nội dung chính */}
      <div className="flex flex-grow">
        <div className="w-1/5 h-full border-r border-gray-300">
          <Nav />
        </div>

        {/* Main content */}
        <main className="flex-1 p-6 bg-gray-100">
          {/* Hero Section */}
          <section
            className="relative bg-cover bg-center h-96 rounded-lg shadow-lg"
            style={{ backgroundImage: "url('/images/chess-hero.jpg')" }}
          >
            <div className="absolute inset-0 bg-blue-900 opacity-50 rounded-lg"></div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
              <h1 className="text-5xl font-bold mb-4 text-white">Khám phá thế giới Cờ Vua</h1>
              <p className="text-xl mb-6 text-white">
                Chơi trực tuyến, học hỏi chiến thuật và nâng cao kỹ năng cờ vua của bạn.
              </p>
              <button className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-full font-semibold">
                Chơi Ngay
              </button>
            </div>
          </section>

          {/* Các tính năng nổi bật */}
          <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-md text-center border border-gray-200">
              <h2 className="text-2xl font-bold mb-3 text-gray-900">Chơi trực tuyến</h2>
              <p className="text-gray-700">
                Tham gia các trận đấu trực tuyến với đối thủ từ khắp nơi.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md text-center border border-gray-200">
              <h2 className="text-2xl font-bold mb-3 text-gray-900">Chơi với máy</h2>
              <p className="text-gray-700">
                Thách thức trí tuệ với các đối thủ AI thông minh.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md text-center border border-gray-200">
              <h2 className="text-2xl font-bold mb-3 text-gray-900">Phân tích ván đấu</h2>
              <p className="text-gray-700">
                Xem lại và phân tích các ván đấu của bạn để cải thiện kỹ năng.
              </p>
            </div>
          </section>

          {/* Phần Giới Thiệu */}
          <section className="mt-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Về Chess App</h2>
            <p className="text-gray-800 leading-relaxed">
              Chess App là nền tảng trực tuyến dành cho những người yêu thích cờ vua, cho phép bạn chơi cờ trực tuyến, so sánh kỹ năng thông qua bảng xếp hạng và phân tích các ván đấu để cải thiện chiến thuật. Với giao diện thân thiện và hiện đại, Chess App hứa hẹn mang đến trải nghiệm chơi cờ đầy thú vị cho cả người mới và cao thủ.
            </p>
          </section>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
