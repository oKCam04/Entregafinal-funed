import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  // ⚡ persona se mantiene como ya lo tienes
  const [persona, setPersona] = useState(() => {
    try {
      const raw = localStorage.getItem("persona");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // ⚡ nuevo estado para el objeto user completo
  const [usuario, setUsuario] = useState(() => {
    try {
      const raw = localStorage.getItem("usuario");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Persistencia + header Authorization
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  useEffect(() => {
    if (persona) localStorage.setItem("persona", JSON.stringify(persona));
    else localStorage.removeItem("persona");
  }, [persona]);

  useEffect(() => {
    if (usuario) localStorage.setItem("usuario", JSON.stringify(usuario));
    else localStorage.removeItem("usuario");
  }, [usuario]);

  // login guarda los dos estados
  const login = ({ token, user }) => {
    setToken(token);

    // guardas la persona simplificada (para compatibilidad con lo que ya usas)
    setPersona(user.persona);

    // guardas el objeto user completo
    setUsuario({
      id: user.id,
      idPersona: user.id_persona, // ⚡ este lo necesitas para cursos
      email: user.email,
      rol: user.persona?.rol,
      nombre: user.persona?.nombre,
    });
  };

  const logout = () => {
    setToken(null);
    setPersona(null);
    setUsuario(null);
  };

  const hasRole = (roles) => {
    const role = (persona?.rol || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
    const list = Array.isArray(roles) ? roles : [roles];
    return list
      .map((r) => r.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim())
      .includes(role);
  };

  const value = useMemo(
    () => ({
      token,
      persona, // lo que ya tenías
      usuario, // ⚡ nuevo: datos completos del user
      isAuthenticated: !!token,
      login,
      logout,
      hasRole,
    }),
    [token, persona, usuario]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
