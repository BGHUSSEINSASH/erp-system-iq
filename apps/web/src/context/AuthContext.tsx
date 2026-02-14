import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { post } from "../api";

type AuthState = {
  token: string | null;
  role: string | null;
  name: string | null;
  department: string | null;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoggedIn: boolean;
};

const AuthContext = createContext<AuthState>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("erp_token"));
  const [role, setRole] = useState<string | null>(localStorage.getItem("erp_role"));
  const [name, setName] = useState<string | null>(localStorage.getItem("erp_name"));
  const [department, setDepartment] = useState<string | null>(localStorage.getItem("erp_dept"));
  const [username, setUsername] = useState<string | null>(localStorage.getItem("erp_user"));

  useEffect(() => {
    if (token) {
      localStorage.setItem("erp_token", token);
      localStorage.setItem("erp_role", role ?? "");
      localStorage.setItem("erp_name", name ?? "");
      localStorage.setItem("erp_dept", department ?? "");
      localStorage.setItem("erp_user", username ?? "");
    } else {
      localStorage.removeItem("erp_token");
      localStorage.removeItem("erp_role");
      localStorage.removeItem("erp_name");
      localStorage.removeItem("erp_dept");
      localStorage.removeItem("erp_user");
    }
  }, [token, role, name, department, username]);

  const login = async (u: string, password: string) => {
    const res = await post<{ token: string; role: string; name: string; department: string; username: string }>("/auth/login", { username: u, password });
    setToken(res.token);
    setRole(res.role);
    setName(res.name);
    setDepartment(res.department);
    setUsername(res.username);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setName(null);
    setDepartment(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, name, department, username, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
