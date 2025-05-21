import React from 'react';
import Layout from '../components/common/Layout';
import ChatInterface from '../components/chat/ChatInterface';

const AssistantPage: React.FC = () => {
  return (
    <Layout>
      <h1 className="text-2xl font-bold text-green-800 mb-6">Asistente Agrícola</h1>
      
      <div className="mb-6">
        <p className="text-gray-700">
          Use este asistente para obtener recomendaciones personalizadas sobre cultivos alternativos,
          prácticas agrícolas y respuestas a sus dudas sobre diversificación de cultivos.
        </p>
      </div>
      
      <ChatInterface />
    </Layout>
  );
};

export default AssistantPage;