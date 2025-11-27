import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) => {
  if (!isOpen) return null;

  // Colores dinámicos según el tipo de acción
  const styles = type === 'danger' ? {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      btnConfirm: 'bg-red-600 hover:bg-red-700 text-white'
  } : {
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      btnConfirm: 'bg-yellow-500 hover:bg-yellow-600 text-white'
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        
        {/* Icono y Header */}
        <div className="p-6 text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${styles.iconBg}`}>
                <AlertTriangle size={32} className={styles.iconColor} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
                {message}
            </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3 p-6 pt-0 justify-center">
            <button 
                onClick={onClose} 
                className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
            >
                Cancelar
            </button>
            <button 
                onClick={onConfirm} 
                className={`px-6 py-3 rounded-xl font-bold shadow-lg shadow-red-200 transition-all transform active:scale-95 ${styles.btnConfirm}`}
            >
                Confirmar Acción
            </button>
        </div>

        {/* Botón de cierre X absoluta */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default ConfirmModal;