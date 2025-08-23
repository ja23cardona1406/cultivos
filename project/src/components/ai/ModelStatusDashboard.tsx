import React, { useState, useEffect } from 'react';
import { Brain, Cpu, Database, TrendingUp, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { getModelStatistics, retrainModel, initializeAISystem } from '../../services/chatService';

const ModelStatusDashboard = () => {
  const [modelStats, setModelStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetraining, setIsRetraining] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadModelStats();
    initializeSystem();
  }, []);

  const initializeSystem = async () => {
    setIsLoading(true);
    try {
      await initializeAISystem();
      await loadModelStats();
    } catch (error) {
      console.error('Error inicializando sistema:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadModelStats = async () => {
    try {
      const stats = await getModelStatistics();
      setModelStats(stats);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleRetrain = async () => {
    setIsRetraining(true);
    try {
      const success = await retrainModel();
      if (success) {
        alert('✅ Modelo reentrenado exitosamente!');
        await loadModelStats();
      } else {
        alert('❌ Error durante el reentrenamiento');
      }
    } catch (error) {
      console.error('Error reentrenando:', error);
      alert('❌ Error durante el reentrenamiento');
    } finally {
      setIsRetraining(false);
    }
  };

  const getStatusIcon = (isInitialized: boolean) => {
    if (isLoading) {
      return <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />;
    }
    return isInitialized 
      ? <CheckCircle className="h-5 w-5 text-green-500" />
      : <AlertCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusColor = (isInitialized: boolean) => {
    if (isLoading) return 'border-yellow-200 bg-yellow-50';
    return isInitialized 
      ? 'border-green-200 bg-green-50' 
      : 'border-red-200 bg-red-50';
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mr-3" />
            <span className="text-lg font-medium text-gray-700">
              Inicializando sistema de IA integrado...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Estado General */}
      <div className={`rounded-lg shadow-lg border-2 p-6 ${getStatusColor(modelStats?.isInitialized)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Sistema de IA Agrícola Integrado
              </h2>
              <p className="text-gray-600">
                CNN + Machine Learning + Sistema Experto
              </p>
            </div>
          </div>
          {getStatusIcon(modelStats?.isInitialized)}
        </div>
        
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <span>Última actualización: {lastUpdate.toLocaleString()}</span>
        </div>
      </div>

      {/* Estadísticas del Modelo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow border p-4">
          <div className="flex items-center">
            <Database className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Vocabulario</p>
              <p className="text-2xl font-bold text-gray-900">
                {modelStats?.vocabSize || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Ejemplos</p>
              <p className="text-2xl font-bold text-gray-900">
                {modelStats?.trainingExamples || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-4">
          <div className="flex items-center">
            <Cpu className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Secuencia Max</p>
              <p className="text-2xl font-bold text-gray-900">
                {modelStats?.maxSequenceLength || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-4">
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-indigo-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Categorías</p>
              <p className="text-2xl font-bold text-gray-900">
                {modelStats?.categories?.length || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información Detallada */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Detalles del Sistema
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Estado</h4>
            <p className="text-sm text-gray-600 mb-4">
              {modelStats?.isInitialized 
                ? '✅ Sistema integrado listo y funcionando' 
                : '❌ Sistema no inicializado'}
            </p>
            
            <h4 className="font-medium text-gray-700 mb-2">Tipo de Sistema</h4>
            <p className="text-sm text-gray-600 mb-4">
              {modelStats?.systemType || 'Sistema híbrido CNN + ML + Experto'}
            </p>
            
            <h4 className="font-medium text-gray-700 mb-2">Capacidades</h4>
            <div className="text-sm text-gray-600">
              {modelStats?.capabilities?.slice(0, 3).map((cap: string, index: number) => (
                <div key={index}>• {cap}</div>
              )) || (
                <div>• Procesamiento de lenguaje natural</div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Categorías Soportadas</h4>
            <div className="flex flex-wrap gap-2">
              {modelStats?.categories?.map((category: string, index: number) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {category}
                </span>
              )) || (
                <span className="text-sm text-gray-500">
                  Categorías agrícolas básicas
                </span>
              )}
            </div>
            
            <h4 className="font-medium text-gray-700 mb-2 mt-4">Datos de Entrenamiento</h4>
            <div className="text-sm text-gray-600">
              <div>• CNN: {modelStats?.trainingInfo?.cnn || 'Corpus agrícola'}</div>
              <div>• ML: {modelStats?.trainingInfo?.ml || 'Dataset de cultivos'}</div>
              <div>• Experto: {modelStats?.trainingInfo?.expert || 'Reglas agrícolas'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Controles del Sistema
        </h3>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={loadModelStats}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar Estado
          </button>
          
          <button
            onClick={handleRetrain}
            disabled={isRetraining || !modelStats?.isInitialized}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Brain className={`h-4 w-4 mr-2 ${isRetraining ? 'animate-pulse' : ''}`} />
            {isRetraining ? 'Actualizando...' : 'Actualizar Sistema'}
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>🎯 Sistema Independiente:</strong> Este sistema funciona completamente
            de forma local sin necesidad de APIs externas. Incluye procesamiento de lenguaje 
            natural con CNN, predicciones de rendimiento y sistema experto agrícola.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModelStatusDashboard;