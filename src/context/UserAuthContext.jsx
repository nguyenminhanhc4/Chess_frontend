import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export const UserAuthContext = createContext();

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const updateUserFromToken = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Decode token để lấy user id (giả sử id được lưu trong "sub")
        const decoded = jwtDecode(token);
        const userId = decoded.sub;
        // Gọi API để lấy thông tin user đầy đủ, bao gồm rating, avatar, username,...
        const response = await axios.get(`http://localhost:8080/api/users/${userId}`);
        console.log("Thông tin user từ API:", response.data);
        setUser(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user từ API:", error);
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
