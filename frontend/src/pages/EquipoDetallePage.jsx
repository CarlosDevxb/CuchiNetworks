import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, MapPin, Hash, Edit, Trash2, AlertTriangle, 
  Save, X, Camera, Cpu, Monitor, Server, Cable, CheckCircle, XCircle, Router as RouterIcon 
} from 'lucide-react';

const EquipoDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // ESTADOS DE DATOS
  const [equipo, setEquipo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listaUbicaciones, setListaUbicaciones] = useState([]); // Para el dropdown de edición
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState(null); // Para lógica de isla/mesa
  
  // ESTADOS DE EDICIÓN
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [detallesData, setDetallesData] = useState({}); // JSON aplanado

  // IMÁGENES
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // 1. CARGAR DATOS INICIALES
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('cuchi_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Cargar Ubicaciones (para el modo edición)
        const resUbicaciones = await axios.get('http://localhost:3000/api/ubicaciones', config);
        setListaUbicaciones(resUbicaciones.data);

        // Cargar Equipo
        const resEquipo = await axios.get(`http://localhost:3000/api/equipos/${id}`, config);
        const data = resEquipo.data;

        // Parsear JSON de detalles
        let parsedDetalles = {};
        if (data.detalles) {
            try {
                parsedDetalles = typeof data.detalles === 'string' ? JSON.parse(data.detalles) : data.detalles;
            } catch (e) { console.error("Error parseando JSON", e); }
        }

        setEquipo(data);
        
        // Preparar datos para el formulario de edición
        setFormData({
            ...data,
            ubicacion_id: data.ubicacion_id || '', // Asegurar que no sea null
            posicion_fisica: data.posicion_fisica || ''
        });

        // Detectar tipo de ubicación actual para configurar el selector
        const ubActual = resUbicaciones.data.find(u => u.id === data.ubicacion_id);
        setUbicacionSeleccionada(ubActual);

        // Aplanar JSON para inputs
        if (data.tipo === 'router' || data.tipo === 'switch') {
            setDetallesData({
                interfaces_fast: parsedDetalles?.interfaces?.fastEthernet || 0,
                interfaces_serial: parsedDetalles?.interfaces?.serial || 0,
                interfaces_giga: parsedDetalles?.interfaces?.gigabit || 0,
                tiene_cable_consola: parsedDetalles?.cables?.consola || false,
                tiene_cable_corriente: parsedDetalles?.cables?.corriente || false,
            });
        } else if (data.tipo === 'computadora') {
            setDetallesData({
                ram: parsedDetalles?.hardware?.ram || '',
                procesador: parsedDetalles?.hardware?.procesador || '',
                tiene_mouse: parsedDetalles?.perifericos?.mouse || false,
                tiene_teclado: parsedDetalles?.perifericos?.teclado || false,
                tiene_monitor: parsedDetalles?.perifericos?.monitor || false,
            });
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // HANDLERS DE CAMBIOS
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDetalleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setDetallesData({ ...detallesData, [e.target.name]: value });
  };

  const handleUbicacionChange = (e) => {
    const newId = parseInt(e.target.value);
    setFormData({ ...formData, ubicacion_id: newId, posicion_fisica: '' }); // Reset posición
    const ub = listaUbicaciones.find(u => u.id === newId);
    setUbicacionSeleccionada(ub);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // GUARDAR CAMBIOS (PUT)
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('cuchi_token');
      const dataToSend = new FormData();
      
      // Datos base
      dataToSend.append('nombre_equipo', formData.nombre_equipo);
      dataToSend.append('modelo', formData.modelo);
      dataToSend.append('serial_number', formData.serial_number);
      dataToSend.append('tipo', formData.tipo);
      dataToSend.append('estado', formData.estado);
      dataToSend.append('ubicacion_id', formData.ubicacion_id);
      dataToSend.append('posicion_fisica', formData.posicion_fisica); // ¡Nuevo campo!
      
      if (selectedImage) dataToSend.append('imagen', selectedImage);

      // Reconstruir JSON
      let detallesObjeto = {};
      if (formData.tipo === 'router' || formData.tipo === 'switch') {
          detallesObjeto = {
              interfaces: {
                  fastEthernet: detallesData.interfaces_fast,
                  serial: detallesData.interfaces_serial,
                  gigabit: detallesData.interfaces_giga
              },
              cables: {
                  consola: detallesData.tiene_cable_consola,
                  corriente: detallesData.tiene_cable_corriente
              }
          };
      } else if (formData.tipo === 'computadora') {
          detallesObjeto = {
              perifericos: {
                  mouse: detallesData.tiene_mouse,
                  teclado: detallesData.tiene_teclado,
                  monitor: detallesData.tiene_monitor
              },
              hardware: {
                  ram: detallesData.ram,
                  procesador: detallesData.procesador
              }
          };
      }
      dataToSend.append('detalles', JSON.stringify(detallesObjeto));

      const response = await axios.put(`http://localhost:3000/api/equipos/${id}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      // Actualizar estado local para reflejar cambios sin recargar
      setEquipo({ 
          ...formData, 
          detalles: detallesObjeto,
          ubicacion_nombre: ubicacionSeleccionada?.nombre || equipo.ubicacion_nombre, // Actualizar nombre visual
          imagen_url: response.data.imagen_url || equipo.imagen_url 
      });
      setIsEditing(false);
      alert("Equipo actualizado correctamente");

    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar cambios");
    }
  };

  // RENDERIZADORES (MODO LECTURA)
  const renderSpecs = () => {
      if (!equipo.detalles) return <p className="text-gray-400 text-sm italic">Sin especificaciones registradas.</p>;
      const d = typeof equipo.detalles === 'string' ? JSON.parse(equipo.detalles) : equipo.detalles;

      if (equipo.tipo === 'computadora') {
          return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-fade-in">
                  <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                      <h4 className="font-bold text-purple-800 mb-2 flex items-center gap-2"><Cpu size={18}/> Hardware</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                          <li><span className="font-bold">Procesador:</span> {d.hardware?.procesador || 'N/A'}</li>
                          <li><span className="font-bold">RAM:</span> {d.hardware?.ram || 'N/A'}</li>
                      </ul>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                      <h4 className="font-bold text-purple-800 mb-2 flex items-center gap-2"><Monitor size={18}/> Periféricos</h4>
                      <div className="flex gap-3 text-sm">
                          <span className={`flex items-center gap-1 ${d.perifericos?.mouse ? 'text-green-600' : 'text-gray-400'}`}>{d.perifericos?.mouse ? <CheckCircle size={14}/> : <XCircle size={14}/>} Mouse</span>
                          <span className={`flex items-center gap-1 ${d.perifericos?.teclado ? 'text-green-600' : 'text-gray-400'}`}>{d.perifericos?.teclado ? <CheckCircle size={14}/> : <XCircle size={14}/>} Teclado</span>
                      </div>
                  </div>
              </div>
          );
      } else if (equipo.tipo === 'router' || equipo.tipo === 'switch') {
          return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-fade-in">
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                      <h4 className="font-bold text-cuchi-primary mb-2 flex items-center gap-2"><RouterIcon size={18}/> Interfaces</h4>
                      <div className="flex justify-between text-sm text-gray-600">
                          <div className="text-center"><span className="block font-bold text-lg">{d.interfaces?.fastEthernet || 0}</span>Fast</div>
                          <div className="text-center"><span className="block font-bold text-lg">{d.interfaces?.serial || 0}</span>Serial</div>
                          <div className="text-center"><span className="block font-bold text-lg">{d.interfaces?.gigabit || 0}</span>Giga</div>
                      </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                      <h4 className="font-bold text-cuchi-primary mb-2 flex items-center gap-2"><Cable size={18}/> Cables</h4>
                      <div className="flex flex-col gap-1 text-sm">
                          <span className={`flex items-center gap-2 ${d.cables?.consola ? 'text-blue-700 font-medium' : 'text-gray-400'}`}>{d.cables?.consola ? <CheckCircle size={14}/> : <XCircle size={14}/>} Consola</span>
                          <span className={`flex items-center gap-2 ${d.cables?.corriente ? 'text-blue-700 font-medium' : 'text-gray-400'}`}>{d.cables?.corriente ? <CheckCircle size={14}/> : <XCircle size={14}/>} Corriente</span>
                      </div>
                  </div>
              </div>
          );
      }
      return null;
  };

  // RENDERIZADORES (MODO EDICIÓN)
  const renderEditSpecs = () => {
      if (formData.tipo === 'computadora') {
          return (
              <div className="bg-purple-50 p-4 rounded-2xl mt-4 border border-purple-200">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                      <input type="text" name="ram" placeholder="RAM" value={detallesData.ram} onChange={handleDetalleChange} className="p-2 rounded border w-full" />
                      <input type="text" name="procesador" placeholder="CPU" value={detallesData.procesador} onChange={handleDetalleChange} className="p-2 rounded border w-full" />
                  </div>
                  <div className="flex gap-4">
                      <label><input type="checkbox" name="tiene_mouse" checked={detallesData.tiene_mouse} onChange={handleDetalleChange} /> Mouse</label>
                      <label><input type="checkbox" name="tiene_teclado" checked={detallesData.tiene_teclado} onChange={handleDetalleChange} /> Teclado</label>
                  </div>
              </div>
          );
      }
      if (formData.tipo === 'router' || formData.tipo === 'switch') {
          return (
            <div className="bg-blue-50 p-4 rounded-2xl mt-4 border border-blue-200">
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <label className="text-xs block">Fast <input type="number" name="interfaces_fast" value={detallesData.interfaces_fast} onChange={handleDetalleChange} className="w-full p-1 border rounded" /></label>
                    <label className="text-xs block">Serial <input type="number" name="interfaces_serial" value={detallesData.interfaces_serial} onChange={handleDetalleChange} className="w-full p-1 border rounded" /></label>
                    <label className="text-xs block">Giga <input type="number" name="interfaces_giga" value={detallesData.interfaces_giga} onChange={handleDetalleChange} className="w-full p-1 border rounded" /></label>
                </div>
                <div className="flex gap-4">
                    <label><input type="checkbox" name="tiene_cable_consola" checked={detallesData.tiene_cable_consola} onChange={handleDetalleChange} /> Consola</label>
                    <label><input type="checkbox" name="tiene_cable_corriente" checked={detallesData.tiene_cable_corriente} onChange={handleDetalleChange} /> Corriente</label>
                </div>
            </div>
          );
      }
      return null;
  };

  const renderSelectorPosicion = () => {
      if (!ubicacionSeleccionada) return <div className="p-2 text-xs text-gray-400">Selecciona Zona</div>;
      
      if (ubicacionSeleccionada.tipo_zona === 'isla') {
          return (
              <select name="posicion_fisica" value={formData.posicion_fisica} onChange={handleInputChange} className="w-full p-2 border rounded bg-white">
                  <option value="">Selecciona...</option>
                  <option value="R1">R1</option>
                  <option value="R2">R2</option>
                  <option value="SW1">SW1</option>
                  <option value="SW2">SW2</option>
                  <option value="PC1">PC1</option>
              </select>
          );
      }
      return <input type="text" name="posicion_fisica" value={formData.posicion_fisica} onChange={handleInputChange} className="w-full p-2 border rounded" placeholder="Ej. Estación 5" />;
  };


  if (loading) return <div className="flex justify-center mt-20">Cargando...</div>;
  if (!equipo) return <div>No encontrado</div>;

  return (
    <div className="fade-in max-w-6xl mx-auto pb-10 font-sans">
      <button onClick={() => navigate('/admin/equipos')} className="flex items-center text-gray-500 mb-6 hover:text-cuchi-primary">
        <ArrowLeft size={20} className="mr-2" /> Volver
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12 flex flex-col md:flex-row gap-10 items-start">
        
        {/* FOTO DEL EQUIPO */}
        <div className="w-full md:w-1/3 relative group">
            <div className="bg-gray-50 rounded-[2rem] h-80 flex items-center justify-center overflow-hidden border border-gray-100 relative">
                <img src={previewImage || equipo.imagen_url || "https://via.placeholder.com/300?text=No+Image"} alt="Equipo" className="w-full h-full object-contain p-6" />
                {isEditing && (
                    <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={48} className="text-white mb-2" />
                        <span className="text-white text-sm font-bold">Cambiar Imagen</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                )}
            </div>
        </div>

        {/* INFORMACIÓN */}
        <div className="flex-1 w-full">
          <div className="flex justify-between items-start mb-4">
             <div className="flex-1 mr-4">
                {isEditing ? (
                    <div className="space-y-3">
                        <input type="text" name="nombre_equipo" value={formData.nombre_equipo} onChange={handleInputChange} className="text-3xl font-bold w-full border-b-2 border-cuchi-primary focus:outline-none" />
                        <input type="text" name="modelo" value={formData.modelo} onChange={handleInputChange} className="text-xl text-gray-500 w-full border-b focus:outline-none" placeholder="Modelo" />
                    </div>
                ) : (
                    <>
                        <div className="flex gap-2 mb-3">
                            <span className="bg-blue-50 text-cuchi-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{equipo.tipo}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${equipo.estado === 'operativo' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>{equipo.estado}</span>
                        </div>
                        <h1 className="text-4xl font-bold text-cuchi-text mb-2">{equipo.nombre_equipo}</h1>
                        <p className="text-xl text-gray-400 font-medium">{equipo.modelo}</p>
                    </>
                )}
             </div>
             
             <div className="flex gap-2">
                {isEditing ? (
                    <>
                        <button onClick={handleSave} className="p-3 rounded-xl bg-cuchi-primary text-white shadow-lg hover:bg-blue-700 transition-all"><Save size={20} /></button>
                        <button onClick={() => { setIsEditing(false); setPreviewImage(null); setFormData(equipo); }} className="p-3 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200"><X size={20} /></button>
                    </>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="p-3 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-cuchi-primary hover:border-cuchi-primary transition-colors shadow-sm"><Edit size={20} /></button>
                )}
             </div>
          </div>
            
          {/* UBICACIÓN Y SERIAL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 border-t border-b border-gray-50 my-6">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-cuchi-primary rounded-xl"><MapPin size={24}/></div>
                <div className="w-full">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Ubicación</p>
                    {isEditing ? (
                        <div className="space-y-2">
                            <select name="ubicacion_id" value={formData.ubicacion_id} onChange={handleUbicacionChange} className="w-full p-2 border rounded text-sm bg-white">
                                {listaUbicaciones.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                            </select>
                            {renderSelectorPosicion()}
                        </div>
                    ) : (
                        <div>
                            <p className="text-cuchi-text font-bold text-lg">{equipo.ubicacion_nombre || 'Sin asignar'}</p>
                            {equipo.posicion_fisica && <p className="text-cuchi-primary text-sm font-bold mt-1">{equipo.posicion_fisica}</p>}
                        </div>
                    )}
                </div>
             </div>

             <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Hash size={24}/></div>
                <div>
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Número de Serie</p>
                    {isEditing ? (
                        <input type="text" name="serial_number" value={formData.serial_number} onChange={handleInputChange} className="w-full p-2 border rounded text-sm" />
                    ) : (
                        <p className="text-cuchi-text font-mono font-medium text-lg">{equipo.serial_number || 'N/A'}</p>
                    )}
                </div>
             </div>
          </div>

          {/* ESPECIFICACIONES TÉCNICAS */}
          <div>
             <h3 className="font-bold text-gray-800 text-lg mb-2">Detalles Técnicos</h3>
             {isEditing ? renderEditSpecs() : renderSpecs()}
             
             {/* Selector de estado extra al editar */}
             {isEditing && (
                 <div className="mt-6 pt-4 border-t border-gray-100">
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Estado del Equipo</label>
                     <select name="estado" value={formData.estado} onChange={handleInputChange} className="w-full p-3 border rounded-xl bg-gray-50 font-bold">
                         <option value="operativo">Operativo</option>
                         <option value="mantenimiento">En Mantenimiento</option>
                         <option value="falla">Con Falla</option>
                     </select>
                 </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default EquipoDetallePage;