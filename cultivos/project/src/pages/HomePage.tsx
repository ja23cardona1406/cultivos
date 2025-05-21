import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import FarmSummary from '../components/dashboard/FarmSummary';
import FarmDataGrid from '../components/dashboard/FarmDataGrid';
import FarmDetails from '../components/dashboard/FarmDetails';
import { Farm, getAllFarms } from '../services/farmService';
import { BarChart3, PlusCircle, MessageSquare } from 'lucide-react';

const HomePage: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  
  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const data = await getAllFarms();
        setFarms(data);
      } catch (err) {
        setError('Error al cargar las fincas. Por favor intenta nuevamente.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFarms();
  }, []);
  
  return (
    <Layout>
      <h1 className="text-2xl font-bold text-green-800 mb-6">Dashboard</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {farms.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <h2 className="text-xl font-medium text-gray-700 mb-4">
                  ¡Bienvenido a AgroDiversificación!
                </h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Para comenzar, registre su primera finca con los detalles del terreno 
                  para obtener predicciones de rendimiento para cultivos alternativos.
                </p>
                <Link to="/registrar-finca">
                  <Button>
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Registrar mi primera finca
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Link 
                  to="/registrar-finca" 
                  className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-green-100"
                >
                  <div className="flex items-center text-green-600 mb-2">
                    <PlusCircle className="h-8 w-8 mr-2" />
                    <h2 className="text-lg font-semibold">Registrar Finca</h2>
                  </div>
                  <p className="text-gray-600">
                    Agregue una nueva finca con sus características de suelo y clima.
                  </p>
                </Link>
                
                <Link 
                  to="/prediccion" 
                  className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-blue-100"
                >
                  <div className="flex items-center text-blue-600 mb-2">
                    <BarChart3 className="h-8 w-8 mr-2" />
                    <h2 className="text-lg font-semibold">Predecir Rendimiento</h2>
                  </div>
                  <p className="text-gray-600">
                    Compare el rendimiento estimado de cultivos alternativos vs. caña de azúcar.
                  </p>
                </Link>
                
                <Link 
                  to="/asistente" 
                  className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-purple-100"
                >
                  <div className="flex items-center text-purple-600 mb-2">
                    <MessageSquare className="h-8 w-8 mr-2" />
                    <h2 className="text-lg font-semibold">Consultar Asistente</h2>
                  </div>
                  <p className="text-gray-600">
                    Obtenga respuestas a sus preguntas sobre cultivos alternativos.
                  </p>
                </Link>
              </div>
              
              <FarmSummary farms={farms} />
              
              <FarmDataGrid 
                farms={farms} 
                onFarmSelect={(farm) => setSelectedFarm(farm)}
              />
            </>
          )}
        </div>
      )}
      
      {selectedFarm && (
        <FarmDetails 
          farm={selectedFarm} 
          onClose={() => setSelectedFarm(null)}
        />
      )}
    </Layout>
  );
};

export default HomePage;