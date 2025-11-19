import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, MapPin, Hash, Edit, Trash2, AlertTriangle, Server, Save, X, Camera 
} from 'lucide-react';

const EquipoDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [equipo, setEquipo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ESTADOS PARA EDICIÓN
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null); // Archivo real
  const [previewImage, setPreviewImage] = useState(null);   // URL para previsualizar

  useEffect(() => {
    fetchDetalle();
  }, [id]);

  const fetchDetalle = async () => {
    try {
      const token = localStorage.getItem('cuchi_token');
      const response = await axios.get(`http://localhost:3000/api/equipos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEquipo(response.data);
      setFormData(response.data); // Inicializamos el formulario con los datos actuales
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // MANEJAR CAMBIOS EN INPUTS DE TEXTO
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // MANEJAR CAMBIO DE IMAGEN
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file)); // Crear URL temporal para verla
    }
  };

  // GUARDAR CAMBIOS (PUT)
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('cuchi_token');
      
      // Usamos FormData porque vamos a enviar un archivo
      const dataToSend = new FormData();
      dataToSend.append('nombre_equipo', formData.nombre_equipo);
      dataToSend.append('modelo', formData.modelo);
      dataToSend.append('serial_number', formData.serial_number);
      dataToSend.append('tipo', formData.tipo);
      dataToSend.append('estado', formData.estado);
      dataToSend.append('ubicacion_id', formData.ubicacion_id); // Ojo: Asegúrate que el backend reciba esto bien
      
      if (selectedImage) {
        dataToSend.append('imagen', selectedImage);
      }

      const response = await axios.put(`http://localhost:3000/api/equipos/${id}`, dataToSend, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data' // Vital para enviar archivos
        }
      });

      // Actualizar vista
      setEquipo({ ...formData, imagen_url: response.data.imagen_url || equipo.imagen_url });
      setIsEditing(false);
      alert("Equipo actualizado correctamente");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar cambios");
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!equipo) return <div>No encontrado</div>;

  // Renderiza un Input o Texto según el modo
  const renderField = (name, label, value) => {
    if (isEditing) {
      return (
        <div className="mb-2">
            <label className="text-xs font-bold text-gray-400 uppercase">{label}</label>
            <input 
                type="text" 
                name={name} 
                value={value || ''} 
                onChange={handleInputChange}
                className="w-full p-2 border border-cuchi-primary rounded-lg bg-white focus:outline-none"
            />
        </div>
      );
    }
    return (
        <div>
            <p className="text-xs text-gray-500 uppercase font-bold">{label}</p>
            <p className="text-cuchi-text font-medium text-lg">{value || 'N/A'}</p>
        </div>
    );
  };

  return (
    <div className="fade-in max-w-6xl mx-auto pb-10">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 mb-6">
        <ArrowLeft size={20} className="mr-2" /> Volver
      </button>

      {/* ENCABEZADO */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 mb-8 flex flex-col md:flex-row gap-8 items-start">
        
        {/* SECCIÓN IMAGEN EDITABLE */}
        <div className="w-full md:w-1/3 relative group">
            <div className="bg-gray-50 rounded-3xl h-64 flex items-center justify-center overflow-hidden border border-gray-100 relative">
                {/* Mostramos la preview si hay una nueva, si no la original */}
                <img 
                    src={previewImage || equipo.imagen_url || "https://via.placeholder.com/300"} 
                    alt="Equipo" 
                    className="w-full h-full object-contain p-4" 
                />
                
                {/* Overlay de Cámara (Solo en modo edición) */}
                {isEditing && (
                    <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={40} className="text-white mb-2" />
                        <span className="text-white text-sm font-bold">Cambiar Imagen</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                )}
            </div>
        </div>

        {/* INFO + FORMULARIO */}
        <div className="flex-1 w-full">
          <div className="flex justify-between items-start mb-6">
             <div className="flex-1 mr-4">
                {/* SELECTOR DE ESTADO (Solo en edición) */}
                {isEditing ? (
                    <select 
                        name="estado" 
                        value={formData.estado} 
                        onChange={handleInputChange}
                        className="mb-2 px-3 py-1 rounded-full text-xs font-bold uppercase border border-gray-300"
                    >
                        <option value="operativo">Operativo</option>
                        <option value="falla">Falla</option>
                        <option value="mantenimiento">Mantenimiento</option>
                    </select>
                ) : (
                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase border ${equipo.estado === 'operativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {equipo.estado}
                    </span>
                )}

                {/* TÍTULO / NOMBRE */}
                {isEditing ? (
                    <input 
                        type="text" name="nombre_equipo" value={formData.nombre_equipo} onChange={handleInputChange}
                        className="block w-full text-3xl font-bold text-cuchi-text border-b-2 border-cuchi-primary focus:outline-none mt-2"
                    />
                ) : (
                    <h1 className="text-4xl font-bold text-cuchi-text mb-1">{equipo.nombre_equipo}</h1>
                )}
                
                {/* MODELO */}
                {isEditing ? (
                    <input 
                        type="text" name="modelo" value={formData.modelo} onChange={handleInputChange} placeholder="Modelo"
                        className="block w-full text-xl text-gray-400 border-b border-gray-300 mt-2"
                    />
                ) : (
                    <p className="text-xl text-gray-400">{equipo.modelo}</p>
                )}
             </div>
             
             {/* BOTONES DE ACCIÓN */}
             <div className="flex gap-2">
                {isEditing ? (
                    <>
                        <button onClick={handleSave} className="p-3 rounded-xl bg-cuchi-primary text-white hover:bg-blue-700 transition-colors shadow-lg" title="Guardar">
                            <Save size={20} />
                        </button>
                        <button onClick={() => { setIsEditing(false); setPreviewImage(null); setFormData(equipo); }} className="p-3 rounded-xl bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors" title="Cancelar">
                            <X size={20} />
                        </button>
                    </>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="p-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-200" title="Editar">
                        <Edit size={20} />
                    </button>
                )}
                {!isEditing && (
                    <button className="p-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors border border-gray-200" title="Eliminar">
                        <Trash2 size={20} />
                    </button>
                )}
             </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="flex items-start gap-4 p-4 bg-cuchi-base rounded-2xl">
                <div className="bg-white p-3 rounded-xl text-cuchi-primary shadow-sm mt-1"><Hash size={20} /></div>
                <div className="w-full">{renderField('serial_number', 'Número de Serie', formData.serial_number)}</div>
             </div>
             
             <div className="flex items-start gap-4 p-4 bg-cuchi-base rounded-2xl">
                <div className="bg-white p-3 rounded-xl text-cuchi-primary shadow-sm mt-1"><MapPin size={20} /></div>
                <div className="w-full">{renderField('ubicacion_id', 'ID Ubicación', formData.ubicacion_id)}</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipoDetallePage;