import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("candid_token");
    if (token) {
      // Decode payload (no verification — backend handles that)
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp * 1000 > Date.now()) {
          setUser(payload);
        } else {
          localStorage.removeItem("candid_token");
        }
      } catch {
        localStorage.removeItem("candid_token");
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem("candid_token", token);
    const payload = JSON.parse(atob(token.split(".")[1]));
    setUser(payload);
  };

  const logout = () => {
    localStorage.removeItem("candid_token");
    setUser(null);
    window.location.href = "/";
  };

  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem("candid_token");
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
