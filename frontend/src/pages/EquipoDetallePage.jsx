import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MapPin, Hash, Edit, Trash2, Save, X, Camera, Cpu, Monitor, Server, Cable, CheckCircle, XCircle, Router as RouterIcon } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal'; // IMPORTAR

const EquipoDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [equipo, setEquipo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listaUbicaciones, setListaUbicaciones] = useState([]);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState(null);
  
  // EDICIÓN
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [detallesData, setDetallesData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // CONFIRMACIÓN BORRADO
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('cuchi_token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [resUb, resEq] = await Promise.all([
            axios.get('http://localhost:3000/api/ubicaciones', { headers }),
            axios.get(`http://localhost:3000/api/equipos/${id}`, { headers })
        ]);

        setListaUbicaciones(resUb.data);
        
        const data = resEq.data;
        // Parsear JSON
        let parsedDetalles = {};
        try { parsedDetalles = typeof data.detalles === 'string' ? JSON.parse(data.detalles) : data.detalles || {}; } catch (e) {}

        setEquipo(data);
        setFormData({ ...data, ubicacion_id: data.ubicacion_id || '', posicion_fisica: data.posicion_fisica || '' });
        
        const ubActual = resUb.data.find(u => u.id === data.ubicacion_id);
        setUbicacionSeleccionada(ubActual);

        // Mapeo de detalles para inputs (Simplificado para el ejemplo)
        if (data.tipo === 'computadora') {
            setDetallesData({
                ram: parsedDetalles.hardware?.ram || '',
                procesador: parsedDetalles.hardware?.procesador || '',
                tiene_mouse: parsedDetalles.perifericos?.mouse || false,
                tiene_teclado: parsedDetalles.perifericos?.teclado || false,
                tiene_monitor: parsedDetalles.perifericos?.monitor || false,
            });
        } else {
            // Router/Switch logic similar al anterior...
             setDetallesData({
                interfaces_fast: parsedDetalles?.interfaces?.fastEthernet || 0,
                interfaces_serial: parsedDetalles?.interfaces?.serial || 0,
                interfaces_giga: parsedDetalles?.interfaces?.gigabit || 0,
                tiene_cable_consola: parsedDetalles?.cables?.consola || false,
                tiene_cable_corriente: parsedDetalles?.cables?.corriente || false,
            });
        }

        setLoading(false);
      } catch (err) {
        toast.error("Error cargando detalles");
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ... (Handlers handleInputChange, handleDetalleChange, handleUbicacionChange, handleImageChange SON IGUALES al código anterior) ...
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleDetalleChange = (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setDetallesData({ ...detallesData, [e.target.name]: value });
  };
  const handleUbicacionChange = (e) => {
    const newId = parseInt(e.target.value);
    setFormData({ ...formData, ubicacion_id: newId, posicion_fisica: '' });
    setUbicacionSeleccionada(listaUbicaciones.find(u => u.id === newId));
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setSelectedImage(file); setPreviewImage(URL.createObjectURL(file)); }
  };

  // GUARDAR
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('cuchi_token');
      const dataToSend = new FormData();
      
      // Append de campos... (Igual que antes)
      Object.keys(formData).forEach(key => {
          if (key !== 'detalles' && key !== 'imagen_url') dataToSend.append(key, formData[key]);
      });
      if (selectedImage) dataToSend.append('imagen', selectedImage);

      // Reconstruir JSON (Igual que antes, simplificado aquí)
      let detallesObjeto = {};
      if (formData.tipo === 'computadora') {
          detallesObjeto = { hardware: { ram: detallesData.ram, procesador: detallesData.procesador }, perifericos: { mouse: detallesData.tiene_mouse, teclado: detallesData.tiene_teclado, monitor: detallesData.tiene_monitor } };
      } else {
          detallesObjeto = { interfaces: { fastEthernet: detallesData.interfaces_fast, serial: detallesData.interfaces_serial, gigabit: detallesData.interfaces_giga }, cables: { consola: detallesData.tiene_cable_consola, corriente: detallesData.tiene_cable_corriente } };
      }
      dataToSend.append('detalles', JSON.stringify(detallesObjeto));

      const response = await axios.put(`http://localhost:3000/api/equipos/${id}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      setEquipo({ ...formData, detalles: detallesObjeto, imagen_url: response.data.imagen_url || equipo.imagen_url, ubicacion_nombre: ubicacionSeleccionada?.nombre });
      setIsEditing(false);
      toast.success("Equipo actualizado correctamente"); // TOAST EXITOSO

    } catch (error) {
      toast.error(error.response?.data?.message || "Error al guardar"); // TOAST ERROR
    }
  };

  // ELIMINAR
  const handleDelete = async () => {
      try {
          const token = localStorage.getItem('cuchi_token');
          await axios.delete(`http://localhost:3000/api/equipos/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          toast.success("Equipo eliminado");
          navigate('/admin/equipos');
      } catch (error) {
          toast.error("No se pudo eliminar el equipo");
      }
  };

  // ... (Render functions renderSpecs, renderEditSpecs, renderSelectorPosicion SON IGUALES) ...
  // Para no saturar la respuesta, asumo que las copias del código anterior, solo cambia el JSX final para incluir el Modal.

  if (loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-cuchi-primary"/></div>;
  if (!equipo) return <div className="p-10">No encontrado</div>;

  return (
    <div className="fade-in max-w-6xl mx-auto pb-10 font-sans">
        {/* ... (Todo el JSX del diseño anterior se mantiene igual) ... */}
        
        {/* BOTÓN DE BORRAR CON MODAL */}
        {/* En la sección de botones de acción, el botón de Trash2 ahora hace setShowConfirm(true) en lugar de borrar directo */}
        
        {/* Ejemplo de cómo se vería el botón en el JSX */}
        {/* <button onClick={() => setShowConfirm(true)} className="p-3 ..."><Trash2/></button> */}

        <ConfirmModal 
            isOpen={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={handleDelete}
            title="¿Eliminar Equipo?"
            message={`Estás a punto de eliminar "${equipo.nombre_equipo}". Esta acción es irreversible.`}
            type="danger"
        />
    </div>
  );
};
// Nota: He resumido las partes repetitivas del render, pero la lógica de Toast y ConfirmModal está completa.
export default EquipoDetallePage;