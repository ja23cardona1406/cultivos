import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import FarmForm from '../components/farm/FarmForm';
import { FarmInsert, createFarm } from '../services/farmService';

const RegisterFarmPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const handleSubmit = async (data: FarmInsert) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await createFarm(data);
      navigate('/');
    } catch (err) {
      setError('Error al registrar la finca. Por favor intenta nuevamente.');
      console.error(err);
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <h1 className="text-2xl font-bold text-green-800 mb-6">Registrar Finca</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <FarmForm onSubmit={handleSubmit} isLoading={isLoading} />
    </Layout>
  );
};

export default RegisterFarmPage;