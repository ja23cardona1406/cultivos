import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import PredictionForm from '../components/predictions/PredictionForm';
import PredictionResults from '../components/predictions/PredictionResults';
import { PredictionInput, CropPrediction, getPredictions } from '../services/predictionsService';
import { Farm, getAllFarms } from '../services/farmService';

const PredictionPage: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoadingFarms, setIsLoadingFarms] = useState(true);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<CropPrediction[] | null>(null);
  
  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const data = await getAllFarms();
        setFarms(data);
      } catch (err) {
        setError('Error al cargar las fincas. Por favor intenta nuevamente.');
        console.error(err);
      } finally {
        setIsLoadingFarms(false);
      }
    };
    
    fetchFarms();
  }, []);
  
  const handleSubmit = async (data: PredictionInput) => {
    setIsLoadingPrediction(true);
    setError(null);
    setPredictions(null);
    
    try {
      const results = await getPredictions(data);
      setPredictions(results);
    } catch (err) {
      setError('Error al obtener las predicciones. Por favor intenta nuevamente.');
      console.error(err);
    } finally {
      setIsLoadingPrediction(false);
    }
  };
  
  return (
    <Layout>
      <h1 className="text-2xl font-bold text-green-800 mb-6">Predicción de Rendimiento</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {isLoadingFarms ? (
        <div className="flex justify-center items-center p-12">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-8">
          <PredictionForm 
            farms={farms} 
            onSubmit={handleSubmit} 
            isLoading={isLoadingPrediction} 
          />
          
          {isLoadingPrediction && (
            <div className="flex justify-center items-center p-12">
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            </div>
          )}
          
          {predictions && !isLoadingPrediction && (
            <PredictionResults predictions={predictions} />
          )}
        </div>
      )}
    </Layout>
  );
};

export default PredictionPage;