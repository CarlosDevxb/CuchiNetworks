import { createContext, useState, useContext, useEffect } from 'react';
import client from '../config/axios';
import axios from 'axios';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si ya hay sesión al recargar la página
  useEffect(() => {
    const storedUser = localStorage.getItem('cuchi_user');
    const token = localStorage.getItem('cuchi_token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      // Configurar axios para que siempre envíe el token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {

    const res = await client.post('/auth/login', { email, password });
    const { token, user } = res.data;

    // Guardar en LocalStorage
    localStorage.setItem('cuchi_token', token);
    localStorage.setItem('cuchi_user', JSON.stringify(user));
    
    // Configurar axios
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    setUser(user);
    return user; // Retornamos usuario para saber a dónde redirigir
  };

  const logout = () => {
    localStorage.removeItem('cuchi_token');
    localStorage.removeItem('cuchi_user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);