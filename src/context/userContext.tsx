"use client";

import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext<any>(null);

export function UserProvider({ children }: any) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axios.get("/api/users/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    await axios.get("/api/users/logout");
    setUser(null);
  };

  const login = async (email: string, password: string) => {
    await axios.post("/api/users/login", { email, password });
    await fetchUser(); // 🔥 penting: sync state
  };

  return (
    <UserContext.Provider value={{ user, setUser, fetchUser, logout, login, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);