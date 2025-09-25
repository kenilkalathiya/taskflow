import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  token: string;
}

interface AuthContextType {
  userInfo: UserInfo | null;
  loading: boolean; // Add a loading state
  login: (data: UserInfo) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true); // Start in a loading state

  useEffect(() => {
    // This effect runs only once when the app starts
    try {
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      }
    } catch (error) {
      console.error("Failed to parse user info from localStorage", error);
    } finally {
      setLoading(false); // We are done loading, whether we found a user or not
    }
  }, []);

  const login = (data: UserInfo) => {
    setUserInfo(data);
localStorage.setItem('userInfo', JSON.stringify(data));
  };

  const logout = () => {
    setUserInfo(null);
localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ userInfo, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};