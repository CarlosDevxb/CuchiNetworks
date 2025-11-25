import { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen, Plus, Loader2, Save } from 'lucide-react';

const MateriasPage = () => {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nombre: '', carrera: '' });

  const fetchMaterias = async () => {
    try {
      const token = localStorage.getItem('cuchi_token');
      const res = await axios.get('http://localhost:3000/api/materias', { headers: { Authorization: `Bearer ${token}` } });
      setMaterias(res.data);
      setLoading(false);
    } catch (e) { console.error(e); setLoading(false); }
  };

  useEffect(() => { fetchMaterias(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('cuchi_token');
      await axios.post('http://localhost:3000/api/materias', form, { headers: { Authorization: `Bearer ${token}` } });
      setForm({ nombre: '', carrera: '' });
      fetchMaterias(); // Recargar lista
    } catch (e) { alert("Error al guardar"); }
  };

  return (
    <div className="fade-in max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-cuchi-text mb-6">Catálogo de Materias</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* FORMULARIO LATERAL */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Plus size={20}/> Nueva Materia</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                    type="text" placeholder="Nombre Materia" required 
                    className="w-full p-3 bg-gray-50 rounded-xl border focus:border-cuchi-primary outline-none"
                    value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
                />
                <input 
                    type="text" placeholder="Carrera / Área" 
                    className="w-full p-3 bg-gray-50 rounded-xl border focus:border-cuchi-primary outline-none"
                    value={form.carrera} onChange={e => setForm({...form, carrera: e.target.value})}
                />
                <button type="submit" className="w-full py-3 bg-cuchi-primary text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex justify-center gap-2">
                    <Save size={18}/> Guardar
                </button>
            </form>
        </div>

        {/* LISTA DE MATERIAS */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loading ? <Loader2 className="animate-spin"/> : materias.map(m => (
                <div key={m.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl text-cuchi-primary"><BookOpen size={20}/></div>
                    <div>
                        <h4 className="font-bold text-gray-800">{m.nombre}</h4>
                        <p className="text-xs text-gray-400 uppercase">{m.carrera || 'General'}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default MateriasPage;