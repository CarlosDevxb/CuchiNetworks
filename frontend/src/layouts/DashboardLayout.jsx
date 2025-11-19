import React from 'react';  

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR (Barra Lateral) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          <h1 className="text-xl font-bold tracking-wider">CuchiNetworks</h1>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-2">
          {/* Aquí irán tus enlaces */}
          <a href="#" className="block px-4 py-2 rounded hover:bg-slate-700 transition-colors">
            📊 Dashboard
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-slate-700 transition-colors">
            🖥️ Equipos
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-slate-700 transition-colors">
            ⚠️ Reportes
          </a>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT (El contenido cambia aquí) */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;