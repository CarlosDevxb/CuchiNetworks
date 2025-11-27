import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);
// Función principal para agregar notificaciones
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    const newToast = { id, message, type };
    
    setToasts((prev) => [...prev, newToast]);

    // LÓGICA INTELIGENTE DE TIEMPO
    // Si es error o warning, dura 8 segundos. Si es éxito, solo 4.
    const duration = (type === 'error' || type === 'warning') ? 8000 : 4000;

    setTimeout(() => {
      removeToast(id);
    }, duration);
    
  }, [removeToast]);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// ... (El resto del componente ToastItem sigue igual) ...
const ToastItem = ({ message, type, onClose }) => {
  // ... estilos ...
  const styles = {
    success: { bg: 'bg-white', border: 'border-green-200', text: 'text-gray-700', icon: <CheckCircle className="text-green-500" size={20} />, bar: 'bg-green-500' },
    error: { bg: 'bg-white', border: 'border-red-200', text: 'text-gray-700', icon: <AlertCircle className="text-red-500" size={20} />, bar: 'bg-red-500' },
    warning: { bg: 'bg-white', border: 'border-yellow-200', text: 'text-gray-700', icon: <AlertCircle className="text-yellow-500" size={20} />, bar: 'bg-yellow-500' },
    info: { bg: 'bg-white', border: 'border-blue-200', text: 'text-gray-700', icon: <Info className="text-blue-500" size={20} />, bar: 'bg-blue-500' }
  };
  const style = styles[type];

  return (
    <div className={`pointer-events-auto flex items-center gap-3 px-4 py-3 w-80 rounded-xl shadow-xl border ${style.border} ${style.bg} animate-slide-in relative overflow-hidden`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.bar}`}></div>
      <div className="pl-2">{style.icon}</div>
      <p className={`flex-1 text-sm font-medium ${style.text}`}>{message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={16} /></button>
    </div>
  );
};