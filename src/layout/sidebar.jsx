// sidebar.jsx
const Sidebar = () => {
  return (
    <aside className="h-screen bg-gray-800 text-white p-4 w-full flex flex-col">
      {/* Phần đầu: Text "Biên bản" */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-center">Biên bản</h2>
      </div>

      {/* Phần giữa: Danh sách các nước đi */}
      <div className="flex-1 overflow-auto">
        <ul className="space-y-2">
          <li className="p-2 bg-gray-700 rounded">1. e2-e4</li>
          <li className="p-2 bg-gray-700 rounded">2. e7-e5</li>
          <li className="p-2 bg-gray-700 rounded">3. Ng1-f3</li>
          {/* Thêm các nước đi khác tại đây */}
        </ul>
      </div>

      {/* Phần cuối: Các nút bấm */}
      <div className="mt-4">
        <div className="flex flex-col space-y-2">
          <button className="w-full p-2 bg-red-600 hover:bg-red-700 rounded">
            Đầu hàng
          </button>
          <button className="w-full p-2 bg-gray-600 hover:bg-gray-700 rounded">
            Lùi lại
          </button>
          <button className="w-full p-2 bg-gray-600 hover:bg-gray-700 rounded">
            Tiến tới
          </button>
          <button className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded">
            Xin hòa
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
