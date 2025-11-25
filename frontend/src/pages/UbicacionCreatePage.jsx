import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MapPin, Server, Layout, Box, CheckCircle } from 'lucide-react';

const UbicacionCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo_zona: 'isla' // Valor por defecto
  });

  // OPCIONES DE ZONA (Para el selector visual)
  const zonaOptions = [
      { id: 'isla', label: 'Isla / Rack', icon: <Server size={24}/>, desc: 'Estructura con Racks y Equipos de red.' },
      { id: 'mesa_central', label: 'Mesa de Trabajo', icon: <Layout size={24}/>, desc: 'Estaciones para PCs de alumnos.' },
      { id: 'bodega', label: 'Bodega / Almacén', icon: <Box size={24}/>, desc: 'Inventario no activo o refacciones.' },
      { id: 'otro', label: 'Otra Zona', icon: <MapPin size={24}/>, desc: 'Cualquier otra área del laboratorio.' },
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTypeSelect = (id) => {
      setFormData({ ...formData, tipo_zona: id });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('cuchi_token');
      await axios.post('http://localhost:3000/api/ubicaciones', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Ubicación creada correctamente");
      navigate('/admin/ubicaciones');

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Error al crear la ubicación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in max-w-4xl mx-auto pb-10 font-sans">
      <button onClick={() => navigate('/admin/ubicaciones')} className="flex items-center text-gray-500 mb-6 hover:text-cuchi-primary transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Cancelar
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100 p-8 md:p-12 border border-gray-50">
        
        <div className="mb-8 pb-6 border-b border-gray-50">
          <h1 className="text-3xl font-bold text-cuchi-text">Nueva Ubicación</h1>
          <p className="text-gray-400 mt-1">Registra una nueva zona física en el laboratorio para asignar equipos.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. DATOS BÁSICOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Nombre de la Zona</label>
                  <input 
                    type="text" 
                    name="nombre" 
                    required 
                    placeholder="Ej. Isla 4" 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-cuchi-primary focus:ring-4 focus:ring-cuchi-primary/10 transition-all font-bold text-gray-700"
                    onChange={handleInputChange}
                  />
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Descripción Corta</label>
                  <input 
                    type="text" 
                    name="descripcion" 
                    placeholder="Ej. Lado izquierdo junto a la ventana" 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-cuchi-primary focus:ring-4 focus:ring-cuchi-primary/10 transition-all"
                    onChange={handleInputChange}
                  />
              </div>
          </div>

          {/* 2. SELECTOR VISUAL DE TIPO */}
          <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-4 ml-1">Tipo de Zona (Define la estructura)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {zonaOptions.map((option) => (
                      <div 
                        key={option.id}
                        onClick={() => handleTypeSelect(option.id)}
                        className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center text-center h-40 justify-center group
                            ${formData.tipo_zona === option.id 
                                ? 'border-cuchi-primary bg-blue-50 shadow-md' 
                                : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'}`}
                      >
                          {/* Icono Check si está seleccionado */}
                          {formData.tipo_zona === option.id && (
                              <div className="absolute top-2 right-2 text-cuchi-primary">
                                  <CheckCircle size={20} fill="currentColor" className="text-white" />
                              </div>
                          )}

                          <div className={`p-3 rounded-full mb-3 ${formData.tipo_zona === option.id ? 'bg-cuchi-primary text-white' : 'bg-gray-100 text-gray-400 group-hover:text-cuchi-primary'}`}>
                              {option.icon}
                          </div>
                          <span className={`font-bold text-sm ${formData.tipo_zona === option.id ? 'text-cuchi-primary' : 'text-gray-600'}`}>
                              {option.label}
                          </span>
                          <p className="text-[10px] text-gray-400 mt-1 leading-tight">{option.desc}</p>
                      </div>
                  ))}
              </div>
          </div>

          {/* BOTÓN GUARDAR */}
          <div className="pt-4 border-t border-gray-50">
            <button type="submit" disabled={loading} 
                className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg shadow-cuchi-primary/20 transition-all transform
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-cuchi-primary hover:bg-blue-700 hover:-translate-y-1'}`}>
                {loading ? 'Creando...' : 'Crear Ubicación'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default UbicacionCreatePage;