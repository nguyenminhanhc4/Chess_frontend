import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const UserAuthContext = createContext();

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const updateUserFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Giải mã token và in kết quả ra console
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);

        setUser({
          id: decoded.sub,       // Giả sử id người dùng được lưu trong "sub"
          username: decoded.username,
          // Có thể thêm các thông tin khác nếu cần
        });
      } catch (error) {
        console.error("Lỗi decode token:", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    updateUserFromToken();
  }, []);

  return (
    <UserAuthContext.Provider value={{ user, updateUserFromToken }}>
      {children}
    </UserAuthContext.Provider>
  );
};
