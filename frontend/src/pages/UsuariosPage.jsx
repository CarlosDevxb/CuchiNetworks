import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  User, Shield, GraduationCap, Briefcase, Plus, Search, 
  Edit, Power, X, CheckCircle, XCircle 
} from 'lucide-react';
import client from '../config/axios';
import { useToast } from '../context/ToastContext'; // O usa react-hot-toast directo si prefieres
import { TableSkeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast'; // Usando react-hot-toast para consistencia con Login

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState('todos'); // todos, admin, docente, alumno
  
  // MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // FORMULARIO DINÁMICO
  const [form, setForm] = useState({
      nombre: '', email: '', password: '', rol: 'alumno',
      // Extras
      matricula: '', carrera: '', semestre: '',
      numero_empleado: '', titulo_academico: '',
      cargo: ''
  });

  // --- 1. CARGAR USUARIOS ---
  const fetchUsuarios = async () => {
      setLoading(true); // Aseguramos loading true al iniciar
      try {
          // Simulamos un pequeño delay para que aprecies el Skeleton (puedes quitarlo luego)
          await new Promise(resolve => setTimeout(resolve, 800)); 
          
          const res = await client.get('/usuarios');
          setUsuarios(res.data);
      } catch (error) {
          console.error(error);
          toast.error("Error cargando usuarios");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => { fetchUsuarios(); }, []);

  // --- 2. CAMBIAR ESTATUS (Soft Delete) ---
  const toggleStatus = async (id, currentStatus) => {
      const newStatus = currentStatus === 'activo' ? 'inactivo' : 'activo';
      try {
          await client.patch(`/usuarios/${id}/status`, { estatus: newStatus });
          toast.success(`Usuario ${newStatus === 'activo' ? 'activado' : 'desactivado'}`);
          // Actualización optimista local
          setUsuarios(usuarios.map(u => u.id === id ? { ...u, estatus: newStatus } : u));
      } catch (error) {
          toast.error("Error al cambiar estatus");
      }
  };

  // --- 3. ABRIR MODAL ---
  const openModal = (user = null) => {
      if (user) {
          setEditingUser(user);
          // Rellenar form con datos existentes
          setForm({
              nombre: user.nombre,
              email: user.email,
              password: '', // Password vacío al editar
              rol: user.rol,
              matricula: user.matricula || '',
              carrera: user.carrera || '',
              semestre: user.semestre || '',
              numero_empleado: user.numero_empleado || '',
              titulo_academico: user.titulo_academico || '',
              cargo: user.cargo || ''
          });
      } else {
          setEditingUser(null);
          // Reset limpio
          setForm({
              nombre: '', email: '', password: '', rol: 'alumno',
              matricula: '', carrera: '', semestre: '',
              numero_empleado: '', titulo_academico: '',
              cargo: ''
          });
      }
      setIsModalOpen(true);
  };

  // --- 4. GUARDAR (Crear/Editar) ---
  const handleSave = async (e) => {
      e.preventDefault();
      
      // Construir el objeto 'extra' según el rol
      const extraData = {};
      if (form.rol === 'alumno') {
          extraData.matricula = form.matricula;
          extraData.carrera = form.carrera;
          extraData.semestre = form.semestre;
      } else if (form.rol === 'docente') {
          extraData.numero_empleado = form.numero_empleado;
          extraData.titulo_academico = form.titulo_academico;
      } else if (form.rol === 'admin') {
          extraData.cargo = form.cargo;
      }

      const payload = {
          nombre: form.nombre,
          email: form.email,
          password: form.password,
          rol: form.rol,
          extra: extraData
      };

      try {
          if (editingUser) {
              await client.put(`/usuarios/${editingUser.id}`, payload);
              toast.success("Usuario actualizado");
          } else {
              await client.post('/usuarios', payload);
              toast.success("Usuario creado exitosamente");
          }
          setIsModalOpen(false);
          fetchUsuarios();
      } catch (error) {
          toast.error(error.response?.data?.message || "Error al guardar");
      }
  };

  // FILTRADO
  const filteredUsers = usuarios.filter(u => {
      const matchesSearch = u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRol === 'todos' || u.rol === filterRol;
      return matchesSearch && matchesRole;
  });

  // RENDERIZAR CAMPOS DINÁMICOS
  const renderDynamicFields = () => {
      switch (form.rol) {
          case 'alumno':
              return (
                  <div className="grid grid-cols-2 gap-4 animate-fade-in">
                      <div className="col-span-2 md:col-span-1">
                          <label className="lbl-input">Matrícula</label>
                          <input type="text" className="input-std" required value={form.matricula} onChange={e => setForm({...form, matricula: e.target.value})} />
                      </div>
                      <div className="col-span-2 md:col-span-1">
                          <label className="lbl-input">Carrera</label>
                          <input type="text" className="input-std" value={form.carrera} onChange={e => setForm({...form, carrera: e.target.value})} />
                      </div>
                      <div className="col-span-1">
                          <label className="lbl-input">Semestre</label>
                          <input type="number" className="input-std" value={form.semestre} onChange={e => setForm({...form, semestre: e.target.value})} />
                      </div>
                  </div>
              );
          case 'docente':
              return (
                  <div className="grid grid-cols-2 gap-4 animate-fade-in">
                      <div>
                          <label className="lbl-input">No. Empleado</label>
                          <input type="text" className="input-std" value={form.numero_empleado} onChange={e => setForm({...form, numero_empleado: e.target.value})} />
                      </div>
                      <div>
                          <label className="lbl-input">Título Académico</label>
                          <input type="text" className="input-std" placeholder="Ing. / Dr." value={form.titulo_academico} onChange={e => setForm({...form, titulo_academico: e.target.value})} />
                      </div>
                  </div>
              );
          case 'admin':
              return (
                  <div className="animate-fade-in">
                      <label className="lbl-input">Cargo Administrativo</label>
                      <input type="text" className="input-std" placeholder="Ej. Gerente de TI" value={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})} />
                  </div>
              );
          default: return null;
      }
  };

  // Helper de Iconos
  const getRoleBadge = (rol) => {
      const config = {
          admin: { color: 'bg-red-100 text-red-700', icon: <Shield size={14}/> },
          docente: { color: 'bg-blue-100 text-blue-700', icon: <Briefcase size={14}/> },
          alumno: { color: 'bg-green-100 text-green-700', icon: <GraduationCap size={14}/> }
      };
      const c = config[rol] || config.alumno;
      return (
          <span className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold uppercase ${c.color}`}>
              {c.icon} {rol}
          </span>
      );
  };

  // --- IMPLEMENTACIÓN DEL SKELETON (ESTADO DE CARGA) ---
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto pb-10 fade-in p-4">
        {/* Header Simulado para evitar saltos */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h2 className="text-3xl font-bold text-cuchi-text">Gestión de Usuarios</h2>
                <p className="text-gray-500">Administra cuentas, roles y accesos.</p>
            </div>
            {/* Placeholder del botón */}
            <div className="h-12 w-40 bg-gray-200 rounded-2xl animate-pulse"></div>
        </div>
        
        {/* Placeholder de Filtros */}
        <div className="h-20 w-full bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 animate-pulse"></div>

        {/* Tabla Skeleton */}
        <TableSkeleton rows={6} />
      </div>
    );
  }

  // --- RENDER PRINCIPAL (CUANDO YA HAY DATOS) ---
  return (
    <div className="fade-in max-w-7xl mx-auto pb-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h2 className="text-3xl font-bold text-cuchi-text">Gestión de Usuarios</h2>
                <p className="text-gray-500">Administra cuentas, roles y accesos.</p>
            </div>
            <button onClick={() => openModal()} className="bg-cuchi-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-md hover:bg-blue-700 transition-all active:scale-95">
                <Plus size={20}/> Crear Usuario
            </button>
        </div>

        {/* FILTROS */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* TABS DE ROL */}
            <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
                {['todos', 'admin', 'docente', 'alumno'].map(rol => (
                    <button 
                        key={rol}
                        onClick={() => setFilterRol(rol)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filterRol === rol ? 'bg-white text-cuchi-text shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {rol}
                    </button>
                ))}
            </div>
            
            {/* BUSCADOR */}
            <div className="relative w-full md:w-72">
                <Search size={18} className="absolute left-3 top-3 text-gray-400"/>
                <input 
                    type="text" 
                    placeholder="Buscar por nombre o correo..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-cuchi-primary rounded-xl outline-none text-sm transition-all"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* TABLA DE USUARIOS */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                        <th className="p-5 font-bold">Usuario</th>
                        <th className="p-5 font-bold">Rol</th>
                        <th className="p-5 font-bold">Detalle ID</th>
                        <th className="p-5 font-bold text-center">Estatus</th>
                        <th className="p-5 font-bold text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                    {filteredUsers.map(u => (
                        <tr key={u.id} className={`transition-colors ${u.estatus === 'inactivo' ? 'bg-gray-50 opacity-75' : 'hover:bg-blue-50/30'}`}>
                            <td className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white ${u.estatus === 'activo' ? 'bg-cuchi-primary' : 'bg-gray-400'}`}>
                                        {u.nombre ? u.nombre.charAt(0).toUpperCase() : <User size={20}/>}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">{u.nombre}</p>
                                        <p className="text-xs text-gray-400">{u.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-5">{getRoleBadge(u.rol)}</td>
                            <td className="p-5 font-mono text-xs text-gray-500">
                                {u.matricula || u.numero_empleado || u.cargo || 'N/A'}
                            </td>
                            <td className="p-5 text-center">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase ${u.estatus === 'activo' ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-200'}`}>
                                    {u.estatus === 'activo' ? <CheckCircle size={12}/> : <XCircle size={12}/>}
                                    {u.estatus}
                                </span>
                            </td>
                            <td className="p-5 text-right flex justify-end gap-2 items-center">
                                <button onClick={() => openModal(u)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Edit size={18}/>
                                </button>
                                {/* SWITCH DE ACTIVAR/DESACTIVAR */}
                                <button 
                                    onClick={() => toggleStatus(u.id, u.estatus)}
                                    title={u.estatus === 'activo' ? 'Desactivar Cuenta' : 'Activar Cuenta'}
                                    className={`p-2 rounded-lg transition-colors ${u.estatus === 'activo' ? 'text-green-500 hover:text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-green-500 hover:bg-green-50'}`}
                                >
                                    <Power size={18}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                        <tr><td colSpan="5" className="p-10 text-center text-gray-400 italic">No se encontraron usuarios.</td></tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* MODAL CON PORTAL */}
        {isModalOpen && createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-sans">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                
                <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] animate-fade-in overflow-hidden">
                    <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h2 className="text-xl font-bold text-cuchi-text">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                        <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-full shadow-sm hover:text-red-500"><X size={20}/></button>
                    </div>

                    <div className="p-8 overflow-y-auto custom-scrollbar">
                        <form id="userForm" onSubmit={handleSave} className="space-y-5">
                            
                            {/* Selector de Rol (Solo si es nuevo) */}
                            {!editingUser && (
                                <div>
                                    <label className="lbl-input">Tipo de Usuario</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['alumno', 'docente', 'admin'].map(r => (
                                            <div 
                                                key={r}
                                                onClick={() => setForm({...form, rol: r})}
                                                className={`cursor-pointer text-center py-2 rounded-xl text-sm font-bold capitalize border transition-all ${form.rol === r ? 'bg-cuchi-primary text-white border-cuchi-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-cuchi-primary'}`}
                                            >
                                                {r}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="lbl-input">Nombre Completo</label>
                                <input type="text" required className="input-std" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                            </div>
                            
                            <div>
                                <label className="lbl-input">Correo Electrónico</label>
                                <input type="email" required className="input-std" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                            </div>

                            <div>
                                <label className="lbl-input">{editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}</label>
                                <input type="password" className="input-std" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" />
                            </div>

                            {/* CAMPOS DINÁMICOS */}
                            <div className="pt-2 border-t border-gray-100">
                                {renderDynamicFields()}
                            </div>

                        </form>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-200">Cancelar</button>
                        <button type="submit" form="userForm" className="px-6 py-2.5 rounded-xl font-bold text-white bg-cuchi-primary hover:bg-blue-700 shadow-md">
                            {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        )}

        <style>{`
            .input-std { width: 100%; padding: 0.7rem; border: 1px solid #E2E8F0; border-radius: 0.7rem; outline: none; transition: all 0.2s; color: #334155; }
            .input-std:focus { border-color: #4180AB; box-shadow: 0 0 0 3px rgba(65, 128, 171, 0.1); }
            .lbl-input { display: block; font-size: 0.7rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; margin-bottom: 0.3rem; margin-left: 2px; }
        `}</style>
    </div>
  );
};

export default UsuariosPage;