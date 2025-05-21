import React from 'react';
import { Farm } from '../../services/farmService';
import Card from '../common/Card';
import Button from '../common/Button';
import { X, Thermometer, Droplets, Cloud, AArrowDown as PH } from 'lucide-react';

interface FarmDetailsProps {
  farm: Farm;
  onClose: () => void;
}

const FarmDetails: React.FC<FarmDetailsProps> = ({ farm, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-green-800">{farm.nombre}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Ubicación</div>
                <div className="font-medium">{farm.ubicacion}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Fecha de Registro</div>
                <div className="font-medium">
                  {new Date(farm.created_at).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-3">Características del Suelo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-green-50 p-4">
                <div className="flex items-center justify-center mb-2">
                  <PH className="w-10 h-10 text-green-700" />
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">pH del Suelo</div>
                  <div className="text-xl font-semibold text-green-800">{farm.ph_suelo}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {farm.ph_suelo < 6 ? 'Ácido' : farm.ph_suelo > 7 ? 'Alcalino' : 'Neutro'}
                  </div>
                </div>
              </Card>
              
              <Card className="bg-amber-50 p-4">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Tipo de Suelo</div>
                  <div className="text-xl font-semibold text-amber-800">{farm.tipo_suelo}</div>
                </div>
              </Card>
              
              <Card className="bg-amber-50 p-4">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Textura</div>
                  <div className="text-xl font-semibold text-amber-800">{farm.textura_suelo}</div>
                </div>
              </Card>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-3">Condiciones Climáticas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-red-50 p-4">
                <div className="flex items-center justify-center mb-2">
                  <Thermometer className="w-10 h-10 text-red-500" />
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Temperatura</div>
                  <div className="text-xl font-semibold text-red-700">{farm.temperatura}°C</div>
                </div>
              </Card>
              
              <Card className="bg-blue-50 p-4">
                <div className="flex items-center justify-center mb-2">
                  <Droplets className="w-10 h-10 text-blue-500" />
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Precipitación</div>
                  <div className="text-xl font-semibold text-blue-700">{farm.precipitacion} mm</div>
                </div>
              </Card>
              
              <Card className="bg-blue-50 p-4">
                <div className="flex items-center justify-center mb-2">
                  <Cloud className="w-10 h-10 text-blue-500" />
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Humedad</div>
                  <div className="text-xl font-semibold text-blue-700">{farm.humedad}%</div>
                </div>
              </Card>
            </div>
          </div>
          
          {farm.practicas_agricolas && farm.practicas_agricolas.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Prácticas Agrícolas</h3>
              <div className="flex flex-wrap gap-2">
                {farm.practicas_agricolas.map((practica, index) => (
                  <span 
                    key={index} 
                    className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm"
                  >
                    {practica}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-8 flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmDetails;