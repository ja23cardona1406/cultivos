import React, { useState } from 'react';
import { Farm } from '../../services/farmService';
import Card from '../common/Card';
import Button from '../common/Button';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

interface FarmDataGridProps {
  farms: Farm[];
  onFarmSelect: (farm: Farm) => void;
}

type SortField = 'nombre' | 'ph_suelo' | 'temperatura' | 'precipitacion' | 'humedad';

const FarmDataGrid: React.FC<FarmDataGridProps> = ({ farms, onFarmSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('nombre');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const filteredFarms = farms.filter(farm => 
    farm.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedFarms = [...filteredFarms].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'nombre') {
      comparison = a.nombre.localeCompare(b.nombre);
    } else {
      const aValue = a[sortField];
      const bValue = b[sortField];
      comparison = (aValue as number) - (bValue as number);
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };
  
  if (farms.length === 0) {
    return (
      <Card>
        <div className="text-center py-8 text-gray-500">
          No hay fincas registradas aún. Registre una finca para ver la lista.
        </div>
      </Card>
    );
  }
  
  return (
    <Card title="Lista de Fincas">
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre o ubicación..."
          className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('nombre')}
              >
                <div className="flex items-center">
                  Nombre
                  {renderSortIcon('nombre')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ubicación
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('ph_suelo')}
              >
                <div className="flex items-center">
                  pH Suelo
                  {renderSortIcon('ph_suelo')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('temperatura')}
              >
                <div className="flex items-center">
                  Temp (°C)
                  {renderSortIcon('temperatura')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('precipitacion')}
              >
                <div className="flex items-center">
                  Prec. (mm)
                  {renderSortIcon('precipitacion')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedFarms.map((farm) => (
              <tr key={farm.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {farm.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {farm.ubicacion}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {farm.ph_suelo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {farm.temperatura}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {farm.precipitacion}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onFarmSelect(farm)}
                  >
                    Ver detalles
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default FarmDataGrid;