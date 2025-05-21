import React from 'react';
import { Farm } from '../../services/farmService';
import Card from '../common/Card';

interface FarmSummaryProps {
  farms: Farm[];
}

const FarmSummary: React.FC<FarmSummaryProps> = ({ farms }) => {
  if (farms.length === 0) {
    return (
      <Card>
        <div className="text-center py-8 text-gray-500">
          No hay fincas registradas aún. Registre una finca para ver el resumen.
        </div>
      </Card>
    );
  }
  
  // Calculate statistics
  const calculateAvg = (property: keyof Farm) => {
    if (typeof farms[0][property] === 'number') {
      const sum = farms.reduce((acc, farm) => acc + (farm[property] as number), 0);
      return (sum / farms.length).toFixed(1);
    }
    return 0;
  };
  
  // Get all unique agricultural practices
  const allPractices = farms.flatMap(farm => farm.practicas_agricolas || []);
  const practiceCount: Record<string, number> = {};
  
  allPractices.forEach(practice => {
    practiceCount[practice] = (practiceCount[practice] || 0) + 1;
  });
  
  // Sort practices by frequency
  const sortedPractices = Object.entries(practiceCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  // Get soil types distribution
  const soilTypes: Record<string, number> = {};
  farms.forEach(farm => {
    soilTypes[farm.tipo_suelo] = (soilTypes[farm.tipo_suelo] || 0) + 1;
  });
  
  return (
    <Card title="Resumen de Fincas">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-700 mb-1">Total de Fincas</div>
          <div className="text-2xl font-semibold text-blue-900">{farms.length}</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-700 mb-1">Temperatura Promedio</div>
          <div className="text-2xl font-semibold text-green-900">{calculateAvg('temperatura')}°C</div>
        </div>
        
        <div className="bg-amber-50 p-4 rounded-lg">
          <div className="text-sm text-amber-700 mb-1">pH Promedio</div>
          <div className="text-2xl font-semibold text-amber-900">{calculateAvg('ph_suelo')}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Prácticas Agrícolas Populares</h3>
          <div className="space-y-2">
            {sortedPractices.map(([practice, count], index) => (
              <div key={practice} className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-4 mr-2">
                  <div 
                    className="bg-green-600 h-4 rounded-full" 
                    style={{ width: `${(count / farms.length) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm whitespace-nowrap">
                  {practice} ({Math.round((count / farms.length) * 100)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Distribución de Tipos de Suelo</h3>
          <div className="space-y-2">
            {Object.entries(soilTypes).map(([type, count], index) => (
              <div key={type} className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-4 mr-2">
                  <div 
                    className="bg-amber-500 h-4 rounded-full" 
                    style={{ width: `${(count / farms.length) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm whitespace-nowrap">
                  {type} ({Math.round((count / farms.length) * 100)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FarmSummary;