"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthContextType {
  role: "rider" | "driver" | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  fetchUser: () => Promise<void>;
  logout:()=>Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<"rider" | "driver" | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  async function fetchUser() {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setRole(data.role as "rider" | "driver");
        setIsAuthenticated(data.isAuthenticated);
        setToken(data.token || null);
        setIsLoading(false)
      } else {
        setRole("rider");
        setIsAuthenticated(false);
        setToken(null);
      }
    } catch (err) {
      console.error("Failed to fetch user in AuthContext:", err);
      setRole("rider");
      setIsAuthenticated(false);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }
  async function logout(){
    try{
      await fetch("/api/auth/logout",{method:"POST"})
    }
    catch(err){
      console.error("failed to logout",err)
    }
    finally{
      setRole(null)
      setIsAuthenticated(false)
      setToken(null)
      window.location.href = "/";
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ role, isAuthenticated, isLoading, token, fetchUser,logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
