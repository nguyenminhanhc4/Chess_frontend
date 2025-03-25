// TimeControlSelector.jsx
import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const timeControlGroups = [
  {
    label: "Siêu Chớp",
    items: [
      { label: "1 phút", value: "1+0" },
      { label: "1 | 1", value: "1+1" },
      { label: "2 | 1", value: "2+1" },
    ],
  },
  {
    label: "Chớp",
    items: [
      { label: "3 | 2", value: "3+2" },
      { label: "5 phút", value: "5+0" },
    ],
  },
  {
    label: "Cờ Chớp",
    items: [
      { label: "10 phút", value: "10+0" },
      { label: "15 | 10", value: "15+10" },
      { label: "30 phút", value: "30+0" },
    ],
  },
  {
    label: "Hàng Ngày",
    items: [
      { label: "1 ngày", value: "1d" },
      { label: "3 ngày", value: "3d" },
      { label: "7 ngày", value: "7d" },
    ],
  },
];

const TimeControlSelector = ({ selected, onSelect }) => {
  // Biến này dùng để đóng/mở dropdown chính
  const [open, setOpen] = useState(false);

  // Tìm trong mảng timeControlGroups xem item nào đang được chọn
  const currentLabel = React.useMemo(() => {
    if (!selected) return "Chọn thời gian";
    for (let group of timeControlGroups) {
      for (let item of group.items) {
        if (item.value === selected) {
          return item.label; // Ví dụ "30 phút"
        }
      }
    }
    return "Chọn thời gian";
  }, [selected]);

  const handleSelect = (value) => {
    onSelect(value);
    setOpen(false);
  };

  return (
    <div className="bg-gray-800 text-white rounded-lg w-64 relative">
      {/* Nút chính để hiển thị "30 phút" hoặc thời gian đã chọn */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg">
        <span className="font-semibold">{currentLabel}</span>
        {open ? <FaChevronUp /> : <FaChevronDown />}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
          {timeControlGroups.map((group, gIndex) => (
            <div
              key={gIndex}
              className="p-3 border-b border-gray-700 last:border-0">
              <div className="font-bold text-sm mb-2">{group.label}</div>
              <div className="grid grid-cols-3 gap-2">
                {group.items.map((item, iIndex) => (
                  <button
                    key={iIndex}
                    onClick={() => handleSelect(item.value)}
                    className={`py-1 px-2 rounded text-sm text-center border border-transparent
                      ${
                        selected === item.value
                          ? "bg-green-600"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="p-3 text-center hover:bg-gray-700 rounded-b-lg cursor-pointer">
            <span className="text-sm text-gray-300">
              Kiểm soát thời gian nhiều hơn
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeControlSelector;
