import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Camera, UploadCloud } from 'lucide-react';

const EquipoCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Estado del Formulario
  const [formData, setFormData] = useState({
    nombre_equipo: '',
    modelo: '',
    serial_number: '',
    tipo: 'computadora', // Valor por defecto
    estado: 'operativo',
    ubicacion_id: '' 
  });
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('cuchi_token');
      const dataToSend = new FormData();
      
      // Agregar campos de texto
      Object.keys(formData).forEach(key => {
        dataToSend.append(key, formData[key]);
      });

      // Agregar imagen si existe
      if (selectedImage) {
        dataToSend.append('imagen', selectedImage);
      }

      await axios.post('http://localhost:3000/api/equipos', dataToSend, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
      });

      alert("Equipo registrado con éxito");
      navigate('/admin/equipos'); // Volver a la lista

    } catch (error) {
      console.error("Error creando equipo:", error);
      alert("Error al registrar el equipo. Verifica los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in max-w-4xl mx-auto pb-10">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 mb-6 hover:text-cuchi-primary transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Cancelar
      </button>

      <div className="bg-white rounded-[2rem] shadow-lg p-8 md:p-12 border border-gray-100">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cuchi-text">Registrar Nuevo Equipo</h1>
          <p className="text-gray-500">Ingresa los detalles técnicos para dar de alta el dispositivo.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: FOTO */}
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">Fotografía</label>
            <div className="relative group cursor-pointer border-2 border-dashed border-gray-300 rounded-3xl h-64 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-cuchi-primary transition-all overflow-hidden">
                {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-contain p-2" />
                ) : (
                    <div className="text-center p-4">
                        <UploadCloud size={40} className="mx-auto text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Click para subir imagen</span>
                    </div>
                )}
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageChange} />
            </div>
          </div>

          {/* COLUMNA DERECHA: CAMPOS */}
          <div className="md:col-span-2 space-y-6">
             
             {/* Nombre y Modelo */}
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Equipo</label>
                    <input type="text" name="nombre_equipo" required placeholder="Ej. PC-05 Laboratorio" 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-cuchi-primary focus:ring-2 focus:ring-cuchi-primary/20"
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Modelo / Marca</label>
                    <input type="text" name="modelo" placeholder="Ej. Dell Optiplex 7050" 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-cuchi-primary focus:ring-2 focus:ring-cuchi-primary/20"
                        onChange={handleInputChange}
                    />
                </div>
             </div>

             {/* Serial y Tipo */}
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Número de Serie</label>
                    <input type="text" name="serial_number" placeholder="S/N 123456" 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-cuchi-primary focus:ring-2 focus:ring-cuchi-primary/20"
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Dispositivo</label>
                    <select name="tipo" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-cuchi-primary" onChange={handleInputChange}>
                        <option value="computadora">Computadora</option>
                        <option value="monitor">Monitor</option>
                        <option value="impresora">Impresora</option>
                        <option value="router">Router/Switch</option>
                        <option value="servidor">Servidor</option>
                    </select>
                </div>
             </div>

             {/* Ubicación y Estado */}
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ID Ubicación</label>
                    <input type="number" name="ubicacion_id" placeholder="Ej. 1" 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-cuchi-primary"
                        onChange={handleInputChange}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">*Temporal: usa el ID numérico</p>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estado Inicial</label>
                    <select name="estado" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-cuchi-primary" onChange={handleInputChange}>
                        <option value="operativo">Operativo</option>
                        <option value="mantenimiento">En Mantenimiento</option>
                        <option value="falla">Con Falla</option>
                    </select>
                </div>
             </div>

             {/* BOTÓN GUARDAR */}
             <div className="pt-4">
                <button type="submit" disabled={loading} 
                    className={`w-full py-4 rounded-xl text-white font-bold shadow-lg transition-all
                    ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-cuchi-primary hover:bg-blue-700 hover:shadow-xl'}`}>
                    {loading ? 'Guardando...' : 'Registrar Equipo'}
                </button>
             </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipoCreatePage;