import { createContext, useContext, useState } from "react";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState("");

  const login = async (password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        password,
      });
      const { token } = response.data;

      // Set token in localStorage and state
      localStorage.setItem("token", token);
      setToken(token);
      setIsAuthenticated(true);

      // Set default authorization header for all future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setIsAuthenticated(false);
    delete axios.defaults.headers.common["Authorization"];
  };

  // Check for existing token on mount
  useState(() => {
    const existingToken = localStorage.getItem("token");
    if (existingToken) {
      setToken(existingToken);
      setIsAuthenticated(true);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${existingToken}`;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
