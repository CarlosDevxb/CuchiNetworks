const Skeleton = ({ className }) => {
  return (
    <div 
      className={`bg-gray-200 animate-pulse rounded-md ${className}`} 
    />
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header simulado */}
      <div className="bg-gray-50 p-4 border-b border-gray-100 flex gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-6 w-1/4" />
        ))}
      </div>
      
      {/* Filas simuladas */}
      <div className="p-4 space-y-4">
        {Array(rows).fill(0).map((_, index) => (
          <div key={index} className="flex items-center gap-4">
             {/* Avatar circular */}
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            
            {/* Líneas de texto */}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            
            {/* Botón de acción */}
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skeleton;