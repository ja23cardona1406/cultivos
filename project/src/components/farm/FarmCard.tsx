import React from 'react';
import { Farm } from '../../services/farmService';
import Card from '../common/Card';
import { MapPin, Droplets, Thermometer, Cloud } from 'lucide-react';

interface FarmCardProps {
  farm: Farm;
  onClick?: () => void;
}

const FarmCard: React.FC<FarmCardProps> = ({ farm, onClick }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <div className="flex flex-col h-full">
        <h3 className="text-xl font-semibold text-green-800 mb-2">{farm.nombre}</h3>
        
        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{farm.ubicacion}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">pH del Suelo</div>
            <div className="font-medium">{farm.ph_suelo}</div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Tipo de Suelo</div>
            <div className="font-medium">{farm.tipo_suelo}</div>
          </div>
        </div>
        
        <div className="flex-grow">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center">
              <Thermometer className="h-5 w-5 text-red-500" />
              <div className="text-xs text-gray-500 mt-1">Temperatura</div>
              <div className="font-medium text-sm">{farm.temperatura}°C</div>
            </div>
            
            <div className="flex flex-col items-center">
              <Droplets className="h-5 w-5 text-blue-500" />
              <div className="text-xs text-gray-500 mt-1">Precipitación</div>
              <div className="font-medium text-sm">{farm.precipitacion} mm</div>
            </div>
            
            <div className="flex flex-col items-center">
              <Cloud className="h-5 w-5 text-blue-400" />
              <div className="text-xs text-gray-500 mt-1">Humedad</div>
              <div className="font-medium text-sm">{farm.humedad}%</div>
            </div>
          </div>
        </div>
        
        {farm.practicas_agricolas && farm.practicas_agricolas.length > 0 && (
          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-1">Prácticas Agrícolas</div>
            <div className="flex flex-wrap gap-1">
              {farm.practicas_agricolas.slice(0, 3).map((practica, index) => (
                <span 
                  key={index} 
                  className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                >
                  {practica}
                </span>
              ))}
              {farm.practicas_agricolas.length > 3 && (
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                  +{farm.practicas_agricolas.length - 3} más
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FarmCard;