'use client';

interface CarCardProps {
  image: string;
  name: string;
  tags: string[];
  price: number;
  onAnalyze: () => void;
}

export default function CarCard({ image, name, tags, price, onAnalyze }: CarCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-transparent hover:border-blue-300 transition-all duration-200">
      <div className="text-center">
        <img 
          src={image} 
          alt={name}
          className="w-full h-32 object-cover rounded-lg mb-4"
        />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{name}</h3>
        <div className="flex flex-wrap gap-2 justify-center mb-3">
          {tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Desde {price.toLocaleString('es-ES')} €
        </p>
        <button 
          onClick={onAnalyze}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Analizar este coche
        </button>
      </div>
    </div>
  );
}
