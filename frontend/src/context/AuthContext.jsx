import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getStoredTokens, setStoredTokens, USER_STORAGE_KEY } from "../services/api";
import { authService } from "../services/financeService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(getStoredTokens()?.access));

  const applyTheme = useCallback((theme) => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    applyTheme(user?.theme_preference || "light");
  }, [user?.theme_preference, applyTheme]);

  const syncUser = useCallback((nextUser) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const tokens = getStoredTokens();
    if (!tokens?.access) {
      setLoading(false);
      return;
    }
    authService
      .getProfile()
      .then((profile) => syncUser(profile))
      .catch(() => {
        setStoredTokens(null);
        syncUser(null);
      })
      .finally(() => setLoading(false));
  }, [syncUser]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setStoredTokens(data.tokens);
    syncUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    setStoredTokens(data.tokens);
    syncUser(data.user);
    return data;
  };

  const logout = async () => {
    const tokens = getStoredTokens();
    try {
      if (tokens?.refresh) {
        await authService.logout(tokens.refresh);
      }
    } catch {
      // Clear local session regardless of server logout status
    } finally {
      setStoredTokens(null);
      syncUser(null);
      applyTheme("light");
    }
  };

  const refreshProfile = async () => {
    const profile = await authService.getProfile();
    syncUser(profile);
    return profile;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user && getStoredTokens()?.access),
        login,
        register,
        logout,
        syncUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
