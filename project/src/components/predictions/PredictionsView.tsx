import React, { useState, useEffect } from 'react';
import PredictionForm from './PredictionForm';
import PredictionResults from './PredictionResults';
import Card from '../common/Card';
import { getPredictions, checkAPIConnection, getModelInfo } from '../../services/predictionsService';
import { Farm } from '../../services/farmService';
import { PredictionInput, CropPrediction } from '../../services/predictionsService';

interface PredictionsViewProps {
  farms: Farm[];
}

const PredictionsView: React.FC<PredictionsViewProps> = ({ farms }) => {
  const [predictions, setPredictions] = useState<CropPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Verificar conexión al cargar el componente
  useEffect(() => {
    const checkConnection = async () => {
      const online = await checkAPIConnection();
      setIsOnline(online);
      
      const info = await getModelInfo();
      setModelInfo(info);
    };
    
    checkConnection();
  }, []);

  const handleSubmit = async (data: PredictionInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🚀 Iniciando predicción con datos:', data);
      const results = await getPredictions(data);
      setPredictions(results);
      console.log('✅ Predicciones obtenidas:', results);
    } catch (error) {
      console.error('❌ Error en predicción:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido al obtener predicciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setPredictions([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Predicción Inteligente de Cultivos</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Utilice nuestro modelo de machine learning para predecir el rendimiento de diferentes cultivos basado en las características de su finca.
        </p>
        
        {modelInfo && (
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
            <div className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            {modelInfo.model_name} v{modelInfo.version} - {isOnline ? 'Conectado' : 'Modo Offline'}
          </div>
        )}
      </div>

      {error && (
        <Card title="Error">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error al obtener predicciones
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleRetry}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <PredictionForm 
            farms={farms} 
            onSubmit={handleSubmit} 
            isLoading={isLoading} 
          />
        </div>
        
        <div className="lg:col-span-2">
          {predictions.length > 0 ? (
            <PredictionResults predictions={predictions} />
          ) : (
            <Card title="Bienvenido al Sistema de Predicción">
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Comience su análisis
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Complete el formulario con los datos de su finca o seleccione una finca existente para obtener predicciones personalizadas de rendimiento de cultivos.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto text-sm text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-green-600 font-bold">1</span>
                    </div>
                    Ingrese datos
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    Obtenga predicciones
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-purple-600 font-bold">3</span>
                    </div>
                    Tome decisiones
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionsView;