import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { tokenStorage } from "../api/tokenStorage.jsx";
import { authApi } from "../api/authApi";
import { commonApi } from "../api/commonApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBooting, setIsBooting] = useState(true);

  const isAuthed = !!tokenStorage.getAccess();

  useEffect(() => {
    (async () => {
      try {
        if (isAuthed) {
          const me = await commonApi.me();
          setUser(me);
        }
      } catch {
        tokenStorage.clear();
        setUser(null);
      } finally {
        setIsBooting(false);
      }
    })();
  }, []);

  const login = async ({ email, password }) => {
    const tokens = await authApi.login({ email, password });
    tokenStorage.setTokens(tokens);
    const me = await commonApi.me();
    setUser(me);
    return me;
  };

  const logout = async () => {
  const refresh = tokenStorage.getRefresh();
  try {
    if (refresh) await authApi.logout({ refresh });
  } catch {
  } finally {
    tokenStorage.clear();
    setUser(null);
  }
};


  const value = useMemo(
    () => ({ user, isAuthed: !!user, isBooting, login, logout }),
    [user, isBooting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
