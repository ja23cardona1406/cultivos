import React from 'react';
import Card from '../common/Card';
import { Farm } from '../../services/farmService';
import { MapPin, TrendingUp, Users, Calendar } from 'lucide-react';

interface DashboardProps {
  farms: Farm[];
}

const Dashboard: React.FC<DashboardProps> = ({ farms }) => {
  const totalFarms = farms.length;
  const avgTemperature = farms.length > 0 
    ? (farms.reduce((sum, farm) => sum + farm.temperatura, 0) / farms.length).toFixed(1)
    : 0;
  const avgPH = farms.length > 0 
    ? (farms.reduce((sum, farm) => sum + farm.ph_suelo, 0) / farms.length).toFixed(1)
    : 0;

  const stats = [
    {
      name: 'Fincas Registradas',
      value: totalFarms,
      icon: MapPin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Temperatura Promedio',
      value: `${avgTemperature}°C`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'pH Promedio',
      value: avgPH,
      icon: Users,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      name: 'Predicciones',
      value: 'Activo',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Agrícola
        </h1>
        <p className="text-lg text-gray-600">
          Monitoreo y análisis de sus fincas y cultivos
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Welcome Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Bienvenido al Sistema AgroPredict">
          <div className="space-y-4">
            <p className="text-gray-600">
              Este sistema le permite gestionar sus fincas y obtener predicciones inteligentes sobre el rendimiento de diferentes cultivos.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Gestión completa de fincas
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Predicciones con IA
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Análisis comparativo
              </div>
            </div>
          </div>
        </Card>

        <Card title="Acciones Rápidas">
          <div className="space-y-4">
            <button className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors border border-green-200">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-green-800">Agregar Nueva Finca</p>
                  <p className="text-sm text-green-600">Registre una nueva propiedad</p>
                </div>
              </div>
            </button>
            
            <button className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-blue-800">Nueva Predicción</p>
                  <p className="text-sm text-blue-600">Analizar rendimiento de cultivos</p>
                </div>
              </div>
            </button>
          </div>
        </Card>
      </div>

      {/* Recent Farms */}
      {farms.length > 0 && (
        <Card title="Fincas Recientes">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo de Suelo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Temperatura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    pH
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {farms.slice(0, 5).map((farm) => (
                  <tr key={farm.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {farm.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {farm.tipo_suelo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {farm.temperatura}°C
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {farm.ph_suelo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;