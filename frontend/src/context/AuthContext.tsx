import React, { createContext, useContext, useState, useEffect } from "react";
import { signInWithGoogle, GoogleUserData } from "../services/firebase";

export interface User {
  uid?: string;
  email: string;
  name?: string;
  company?: string;
  photoURL?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isDemoMode: boolean;
  loading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, company: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  enterDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = sessionStorage.getItem("ag_user");
    const savedDemo = sessionStorage.getItem("ag_demo");
    const savedAuth = sessionStorage.getItem("ag_auth");

    if (savedAuth === "true" && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
      if (savedDemo === "true") {
        setIsDemoMode(true);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (!email || !email.includes("@")) {
        throw new Error("Please enter a valid work email.");
      }
      if (!password || password.length < 8) {
        throw new Error("Password must be at least 8 characters.");
      }
      
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockUser: User = { 
        uid: "user-" + Math.random().toString(36).substring(2, 9),
        email, 
        name: email.split("@")[0].toUpperCase(),
        photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email.split("@")[0])}`
      };
      setIsAuthenticated(true);
      setIsDemoMode(false);
      setUser(mockUser);
      
      sessionStorage.setItem("ag_auth", "true");
      sessionStorage.setItem("ag_user", JSON.stringify(mockUser));
      sessionStorage.removeItem("ag_demo");
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, company: string, password: string) => {
    setLoading(true);
    try {
      if (!name || name.trim().length === 0) {
        throw new Error("Please enter your full name.");
      }
      if (!email || !email.includes("@")) {
        throw new Error("Please enter a valid work email.");
      }
      if (!company || company.trim().length === 0) {
        throw new Error("Please enter your company/organization.");
      }
      if (!password || password.length < 8) {
        throw new Error("Password must be at least 8 characters.");
      }
      
      await new Promise((resolve) => setTimeout(resolve, 850));

      const mockUser: User = { 
        uid: "user-" + Math.random().toString(36).substring(2, 9),
        email, 
        name, 
        company,
        photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
      };
      setIsAuthenticated(true);
      setIsDemoMode(false);
      setUser(mockUser);
      
      sessionStorage.setItem("ag_auth", "true");
      sessionStorage.setItem("ag_user", JSON.stringify(mockUser));
      sessionStorage.removeItem("ag_demo");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const googleData: GoogleUserData = await signInWithGoogle();
      const authenticatedUser: User = {
        uid: googleData.uid,
        email: googleData.email,
        name: googleData.displayName,
        photoURL: googleData.photoURL
      };
      setIsAuthenticated(true);
      setIsDemoMode(false);
      setUser(authenticatedUser);
      
      sessionStorage.setItem("ag_auth", "true");
      sessionStorage.setItem("ag_user", JSON.stringify(authenticatedUser));
      sessionStorage.removeItem("ag_demo");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsDemoMode(false);
    setUser(null);
    sessionStorage.removeItem("ag_auth");
    sessionStorage.removeItem("ag_user");
    sessionStorage.removeItem("ag_demo");
  };

  const enterDemoMode = () => {
    setIsDemoMode(true);
    setIsAuthenticated(true);
    const mockUser = { 
      uid: "demo-guest",
      email: "demo@agentguard.ai", 
      name: "Guest Auditor", 
      company: "Sandbox Mode",
      photoURL: "https://api.dicebear.com/7.x/initials/svg?seed=Guest%20Auditor"
    };
    setUser(mockUser);
    sessionStorage.setItem("ag_auth", "true");
    sessionStorage.setItem("ag_demo", "true");
    sessionStorage.setItem("ag_user", JSON.stringify(mockUser));
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isDemoMode, loading, user, login, signup, loginWithGoogle, logout, enterDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
