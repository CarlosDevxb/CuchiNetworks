import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, UploadCloud, Server, Monitor, Cpu } from 'lucide-react';
import { useToast } from '../context/ToastContext';
const EquipoCreatePage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const toast = useToast();
  // ESTADO DEL FORMULARIO PRINCIPAL
  const [formData, setFormData] = useState({
    nombre_equipo: '',
    modelo: '',
    serial_number: '',
    tipo: 'computadora',
    estado: 'operativo',
    ubicacion_id: '',
    posicion_fisica: '' // Campo nuevo para R1, Mesa 5, etc.
  });
  
  // ESTADO PARA LOS DETALLES TÉCNICOS (JSON)
  const [detalles, setDetalles] = useState({
    // Routers/Switches
    interfaces_fast: 0,
    interfaces_serial: 0,
    interfaces_giga: 0,
    tiene_cable_consola: false,
    tiene_cable_corriente: false,
    // PCs
    tiene_mouse: false,
    tiene_teclado: false,
    tiene_monitor: false,
    ram: '',
    procesador: ''
  });

  // ESTADOS PARA IMAGEN
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // ESTADOS PARA UBICACIONES INTELIGENTES
  const [listaUbicaciones, setListaUbicaciones] = useState([]);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState(null);

  // 1. CARGAR UBICACIONES AL MONTAR
  useEffect(() => {
    const fetchUbicaciones = async () => {
        try {
            const token = localStorage.getItem('cuchi_token');
            const res = await axios.get('http://localhost:3000/api/ubicaciones', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setListaUbicaciones(res.data);
        } catch (e) { console.error("Error cargando ubicaciones", e); }
    };
    fetchUbicaciones();
  }, []);

  // HANDLERS
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleDetalleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setDetalles({ ...detalles, [e.target.name]: value });
  };

  const handleUbicacionChange = (e) => {
    const id = parseInt(e.target.value);
    setFormData({ ...formData, ubicacion_id: id, posicion_fisica: '' }); // Reseteamos posición al cambiar zona
    
    // Encontrar el objeto ubicación completo para saber su tipo (isla/mesa)
    const ub = listaUbicaciones.find(u => u.id === id);
    setUbicacionSeleccionada(ub);
  };

  // ENVÍO DEL FORMULARIO
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('cuchi_token');
      const dataToSend = new FormData();
      
      // Agregar campos base
      Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));
      if (selectedImage) dataToSend.append('imagen', selectedImage);

      // CONSTRUIR JSON DE DETALLES
      let detallesObjeto = {};

      if (formData.tipo === 'router' || formData.tipo === 'switch') {
          detallesObjeto = {
              interfaces: {
                  fastEthernet: detalles.interfaces_fast,
                  serial: detalles.interfaces_serial,
                  gigabit: detalles.interfaces_giga
              },
              cables: {
                  consola: detalles.tiene_cable_consola,
                  corriente: detalles.tiene_cable_corriente
              }
          };
      } else if (formData.tipo === 'computadora') {
          detallesObjeto = {
              perifericos: {
                  mouse: detalles.tiene_mouse,
                  teclado: detalles.tiene_teclado,
                  monitor: detalles.tiene_monitor
              },
              hardware: {
                  ram: detalles.ram,
                  procesador: detalles.procesador
              }
          };
      }

      dataToSend.append('detalles', JSON.stringify(detallesObjeto));

      await axios.post('http://localhost:3000/api/equipos', dataToSend, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
      });

      toast.success("Equipo registrado exitosamente.");
      navigate('/admin/equipos');

    } catch (error) {
     toast.error("Error al registrar el equipo. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // RENDERIZADO: DETALLES TÉCNICOS DINÁMICOS
  const renderCamposDinamicos = () => {
      const tipo = formData.tipo;

      if (tipo === 'router' || tipo === 'switch') {
          return (
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mt-4 animate-fade-in">
                  <h3 className="text-cuchi-primary font-bold flex items-center gap-2 mb-4">
                      <Server size={20} /> Especificaciones de Red
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                          <label className="text-xs font-bold text-gray-500">FastEthernet</label>
                          <input type="number" name="interfaces_fast" min="0" className="input-std" 
                                 value={detalles.interfaces_fast} onChange={handleDetalleChange} />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500">Seriales</label>
                          <input type="number" name="interfaces_serial" min="0" className="input-std" 
                                 value={detalles.interfaces_serial} onChange={handleDetalleChange} />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500">Gigabit</label>
                          <input type="number" name="interfaces_giga" min="0" className="input-std" 
                                 value={detalles.interfaces_giga} onChange={handleDetalleChange} />
                      </div>
                  </div>
                  <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" name="tiene_cable_consola" checked={detalles.tiene_cable_consola} onChange={handleDetalleChange} className="w-5 h-5 text-cuchi-primary rounded" />
                          <span className="text-sm font-medium text-gray-600">Cable Consola</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" name="tiene_cable_corriente" checked={detalles.tiene_cable_corriente} onChange={handleDetalleChange} className="w-5 h-5 text-cuchi-primary rounded" />
                          <span className="text-sm font-medium text-gray-600">Cable Corriente</span>
                      </label>
                  </div>
              </div>
          );
      }

      if (tipo === 'computadora') {
          return (
              <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 mt-4 animate-fade-in">
                  <h3 className="text-purple-700 font-bold flex items-center gap-2 mb-4">
                      <Monitor size={20} /> Periféricos y Hardware
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                          <label className="text-xs font-bold text-gray-500">RAM</label>
                          <input type="text" name="ram" placeholder="Ej. 16GB" className="input-std" 
                                 value={detalles.ram} onChange={handleDetalleChange} />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500">Procesador</label>
                          <input type="text" name="procesador" placeholder="Ej. Intel i5" className="input-std" 
                                 value={detalles.procesador} onChange={handleDetalleChange} />
                      </div>
                  </div>
                  <div className="flex gap-4 flex-wrap">
                      <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" name="tiene_mouse" checked={detalles.tiene_mouse} onChange={handleDetalleChange} className="w-5 h-5 text-purple-600 rounded" />
                          <span className="text-sm font-medium text-gray-600">Mouse</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" name="tiene_teclado" checked={detalles.tiene_teclado} onChange={handleDetalleChange} className="w-5 h-5 text-purple-600 rounded" />
                          <span className="text-sm font-medium text-gray-600">Teclado</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" name="tiene_monitor" checked={detalles.tiene_monitor} onChange={handleDetalleChange} className="w-5 h-5 text-purple-600 rounded" />
                          <span className="text-sm font-medium text-gray-600">Monitor</span>
                      </label>
                  </div>
              </div>
          );
      }
      return null;
  };

  // RENDERIZADO: POSICIÓN FÍSICA INTELIGENTE
  const renderSelectorPosicion = () => {
      if (!ubicacionSeleccionada) return (
        <div className="mt-2 p-3 bg-gray-50 rounded-xl text-xs text-gray-400 italic border border-gray-100">
            Selecciona una zona primero
        </div>
      );

      if (ubicacionSeleccionada.tipo_zona === 'isla') {
          return (
              <div className="animate-fade-in mt-2">
                  <label className="text-label text-blue-600">Posición en Rack</label>
                  <select name="posicion_fisica" onChange={handleInputChange} className="input-std border-blue-200 bg-blue-50">
                      <option value="">Selecciona posición...</option>
                      <option value="R1">Router 1 (R1)</option>
                      <option value="R2">Router 2 (R2)</option>
                      <option value="R3">Router 3 (R3)</option>
                      <option value="SW1">Switch 1 (SW1)</option>
                      <option value="SW2">Switch 2 (SW2)</option>
                      <option value="PC1">PC de Gestión</option>
                      <option value="Srv">Servidor de Rack</option>
                  </select>
              </div>
          );
      } 
      
      if (ubicacionSeleccionada.tipo_zona === 'mesa_central') {
          return (
            <div className="animate-fade-in mt-2">
                <label className="text-label text-purple-600">Número de Estación</label>
                <input type="text" name="posicion_fisica" placeholder="Ej. Estación 05" 
                    onChange={handleInputChange} className="input-std border-purple-200 bg-purple-50" />
            </div>
          );
      }

      return (
        <div className="mt-2">
            <label className="text-label">Detalle Ubicación</label>
            <input type="text" name="posicion_fisica" placeholder="Ej. Estante 4" 
                onChange={handleInputChange} className="input-std" />
        </div>
      );
  };

  return (
    <div className="fade-in max-w-5xl mx-auto pb-10 font-sans">
      <button onClick={() => navigate('/admin/equipos')} className="flex items-center text-gray-500 mb-6 hover:text-cuchi-primary transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Cancelar
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100 p-8 md:p-12 border border-gray-50">
        <div className="mb-8 pb-6 border-b border-gray-50">
          <h1 className="text-3xl font-bold text-cuchi-text">Registrar Nuevo Equipo</h1>
          <p className="text-gray-400 mt-1">Ingresa los detalles técnicos para dar de alta el dispositivo en el inventario.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* COLUMNA IZQUIERDA: FOTO */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">Fotografía del Equipo</label>
            <div className="relative group cursor-pointer border-2 border-dashed border-gray-200 rounded-[2rem] h-72 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-cuchi-primary transition-all overflow-hidden">
                {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-contain p-4" />
                ) : (
                    <div className="text-center p-6">
                        <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-3">
                            <UploadCloud size={32} className="text-cuchi-primary" />
                        </div>
                        <p className="text-sm font-bold text-gray-600">Click para subir imagen</p>
                        <p className="text-xs text-gray-400 mt-1">Soporta JPG, PNG</p>
                    </div>
                )}
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageChange} />
            </div>
          </div>

          {/* COLUMNA DERECHA: CAMPOS */}
          <div className="lg:col-span-2 space-y-6">
             
             {/* 1. DATOS GENERALES */}
             <div className="grid grid-cols-2 gap-5">
                <div>
                    <label className="text-label">Nombre del Equipo</label>
                    <input type="text" name="nombre_equipo" required placeholder="Ej. R1-Isla1" className="input-std" onChange={handleInputChange} />
                </div>
                <div>
                    <label className="text-label">Modelo / Marca</label>
                    <input type="text" name="modelo" placeholder="Ej. Cisco 2901" className="input-std" onChange={handleInputChange} />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-5">
                <div>
                    <label className="text-label">Serial (S/N)</label>
                    <input type="text" name="serial_number" placeholder="ABC-123-XYZ" className="input-std" onChange={handleInputChange} />
                </div>
                <div>
                    <label className="text-label">Tipo de Dispositivo</label>
                    <select name="tipo" className="input-std font-semibold text-gray-600" onChange={handleInputChange} value={formData.tipo}>
                        <option value="computadora">Computadora</option>
                        <option value="router">Router</option>
                        <option value="switch">Switch</option>
                        <option value="servidor">Servidor</option>
                        <option value="impresora">Impresora</option>
                    </select>
                </div>
             </div>

             {/* 2. ESPECIFICACIONES DINÁMICAS */}
             {renderCamposDinamicos()}

             {/* 3. UBICACIÓN INTELIGENTE */}
             <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mt-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                    <Server size={14}/> Ubicación Física
                </h3>
                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="text-label">Zona / Área</label>
                        <select name="ubicacion_id" className="input-std bg-white" onChange={handleUbicacionChange} value={formData.ubicacion_id}>
                            <option value="">-- Seleccionar Zona --</option>
                            {listaUbicaciones.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.nombre} ({u.tipo_zona === 'mesa_central' ? 'Mesa' : 'Isla'})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        {renderSelectorPosicion()}
                    </div>
                </div>
             </div>
             
             {/* 4. ESTADO */}
             <div>
                <label className="text-label">Estado Inicial</label>
                <select name="estado" className="input-std" onChange={handleInputChange}>
                    <option value="operativo">🟢 Operativo</option>
                    <option value="mantenimiento">🟡 En Mantenimiento</option>
                    <option value="falla">🔴 Con Falla</option>
                </select>
             </div>

             {/* BOTÓN GUARDAR */}
             <div className="pt-6">
                <button type="submit" disabled={loading} 
                    className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg shadow-cuchi-primary/20 transition-all
                    ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-cuchi-primary hover:bg-blue-700 hover:-translate-y-1'}`}>
                    {loading ? 'Guardando en Inventario...' : 'Registrar Equipo'}
                </button>
             </div>

          </div>
        </form>
      </div>
      
      <style>{`
        .input-std { width: 100%; padding: 0.85rem; background-color: #fff; border: 1px solid #E5E7EB; border-radius: 1rem; outline: none; transition: all 0.2s; }
        .input-std:focus { border-color: #4180AB; box-shadow: 0 0 0 4px rgba(65, 128, 171, 0.1); }
        .text-label { display: block; font-size: 0.7rem; font-weight: 800; color: #9CA3AF; text-transform: uppercase; margin-bottom: 0.35rem; letter-spacing: 0.05em; }
      `}</style>
    </div>
  );
};

export default EquipoCreatePage;