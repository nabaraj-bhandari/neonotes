import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPass, setAdminPass] = useState("");

  const login = (password) => {
    if (password === import.meta.env.VITE_ADMIN_PASS) {
      setIsAuthenticated(true);
      setAdminPass(password);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAdminPass("");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, adminPass, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
