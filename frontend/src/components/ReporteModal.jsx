import { useState, useEffect } from 'react';
import { X, AlertTriangle, Save } from 'lucide-react';
import { createPortal } from 'react-dom';
import client from '../config/axios';
import toast from 'react-hot-toast';

const ReporteModal = ({ isOpen, onClose, onSuccess }) => {
    const [descripcion, setDescripcion] = useState('');
    const [loading, setLoading] = useState(false);
    const [equipos, setEquipos] = useState([]);
    const [equipoId, setEquipoId] = useState('');

    // Cargar equipos para que pueda seleccionar cuál falló (Opcional)
    useEffect(() => {
        if (isOpen) {
            client.get('/equipos').then(res => setEquipos(res.data)).catch(console.error);
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await client.post('/reportes', {
                descripcion_problema: descripcion,
                equipo_id: equipoId || null
            });
            toast.success("Reporte enviado al administrador");
            setDescripcion('');
            setEquipoId('');
            onSuccess && onSuccess(); // Recargar dashboard
            onClose();
        } catch (error) {
            toast.error("Error al enviar reporte");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8 animate-fade-in">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className="text-orange-500" /> Reportar Falla
                </h2>
                <p className="text-gray-400 text-sm mb-6">Describe el problema para que soporte técnico lo atienda.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Equipo (Opcional)</label>
                        <select 
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                            value={equipoId}
                            onChange={e => setEquipoId(e.target.value)}
                        >
                            <option value="">-- Ninguno / General --</option>
                            {equipos.map(eq => (
                                <option key={eq.id} value={eq.id}>{eq.nombre_equipo} ({eq.modelo})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción del Problema</label>
                        <textarea 
                            required
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl h-32 resize-none focus:border-cuchi-primary outline-none"
                            placeholder="Ej. El monitor parpadea y no da imagen..."
                            value={descripcion}
                            onChange={e => setDescripcion(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2"
                    >
                        {loading ? 'Enviando...' : <><Save size={18}/> Enviar Reporte</>}
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default ReporteModal;