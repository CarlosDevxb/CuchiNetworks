import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, ChevronDown, Zap, Menu } from 'lucide-react';

const Sidebar = ({ menuItems, title, user }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Botón Móvil (Solo visible en pantallas pequeñas) */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 bg-white rounded-lg shadow-lg text-cuchi-primary">
          <Menu />
        </button>
      </div>

      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-100 flex flex-col h-screen shadow-xl md:shadow-none transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* HEADER: Identidad de Marca */}
        <div className="h-24 flex flex-col justify-center px-8 border-b border-gray-50">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-cuchi-primary p-2 rounded-xl shadow-lg shadow-cuchi-primary/20">
                <Zap size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-cuchi-text tracking-tight">CuchiNetworks</h1>
          </div>
          <p className="text-xs text-cuchi-secondary font-semibold uppercase tracking-wider pl-12">
            {title}
          </p>
        </div>

        {/* PERFIL DE USUARIO (Resumen) */}
        <div className="px-6 py-6">
          <div className="bg-cuchi-base p-4 rounded-2xl flex items-center gap-3 border border-white shadow-inner">
            <div className="w-10 h-10 rounded-full bg-cuchi-primary text-white flex items-center justify-center font-bold text-lg">
              {user?.nombre?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-cuchi-text truncate">{user?.nombre}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.rol}</p>
            </div>
          </div>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, index) => (
            <SidebarItem key={index} item={item} />
          ))}
        </nav>

        {/* FOOTER */}
        <div className="p-6 border-t border-gray-50">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 w-full px-4 py-4 text-sm font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-200 group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
      
      {/* Overlay para móvil */}
      {isMobileOpen && (
        <div onClick={() => setIsMobileOpen(false)} className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-sm"></div>
      )}
    </>
  );
};

// Sub-componente de Ítem
const SidebarItem = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubMenu = item.subItems && item.subItems.length > 0;

  if (hasSubMenu) {
    return (
      <div className="mb-2">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-5 py-4 text-sm font-semibold rounded-2xl transition-all duration-200
            ${isOpen ? 'bg-white text-cuchi-primary shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-cuchi-text'}`}
        >
          <div className="flex items-center gap-4">
            {item.icon}
            <span>{item.label}</span>
          </div>
          <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
          <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-1">
            {item.subItems.map((sub, idx) => (
              <NavLink
                key={idx}
                to={sub.path}
                className={({ isActive }) =>
                  `block px-4 py-3 text-sm rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'text-cuchi-primary font-bold bg-cuchi-primary/5' 
                    : 'text-gray-400 hover:text-cuchi-primary hover:translate-x-1'}`
                }
              >
                {sub.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center gap-4 px-5 py-4 text-sm font-semibold rounded-2xl transition-all duration-200 mb-2
        ${isActive 
          ? 'bg-cuchi-primary text-white shadow-lg shadow-cuchi-primary/30 translate-x-1' 
          : 'text-gray-500 hover:bg-gray-50 hover:text-cuchi-text'}`
      }
    >
      {item.icon}
      <span>{item.label}</span>
    </NavLink>
  );
};

export default Sidebar;