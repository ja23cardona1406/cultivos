import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Card from '../common/Card';
import { CropPrediction, SUGAR_CANE_YIELD, getCropNameInSpanish } from '../../services/predictionsService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PredictionResultsProps {
  predictions: CropPrediction[];
}

const PredictionResults: React.FC<PredictionResultsProps> = ({ predictions }) => {
  // Sort predictions by yield (descending)
  const sortedPredictions = [...predictions].sort((a, b) => b.yield - a.yield);
  
  // Prepare data for chart
  const chartData = {
    labels: sortedPredictions.map(p => getCropNameInSpanish(p.crop)),
    datasets: [
      {
        label: 'Rendimiento Estimado (kg/ha)',
        data: sortedPredictions.map(p => p.yield),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)',
          'rgb(255, 159, 64)',
          'rgb(255, 99, 132)',
        ],
        borderWidth: 1,
      },
      {
        label: 'Rendimiento Caña de Azúcar (kg/ha)',
        data: sortedPredictions.map(() => SUGAR_CANE_YIELD),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
        borderDash: [5, 5],
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Rendimiento Estimado por Cultivo vs. Caña de Azúcar',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ${value.toLocaleString()} kg/ha`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Rendimiento (kg/ha)',
        },
      },
    },
  };
  
  return (
    <div className="space-y-6">
      <Card title="Resultados de Predicción">
        <div className="mb-8">
          <div className="chart-container" style={{ height: '300px' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-green-800 mb-3">Comparación con Caña de Azúcar</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cultivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rendimiento (kg/ha)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confianza (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comparación con Caña (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rentabilidad Relativa
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPredictions.map((prediction) => {
                const percentageOfSugarCane = (prediction.yield / SUGAR_CANE_YIELD) * 100;
                
                // Determine if crop is more profitable (simplified, would need price info)
                let profitabilityIndicator;
                if (percentageOfSugarCane >= 90) {
                  profitabilityIndicator = (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Alta
                    </span>
                  );
                } else if (percentageOfSugarCane >= 60) {
                  profitabilityIndicator = (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Media
                    </span>
                  );
                } else {
                  profitabilityIndicator = (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Baja
                    </span>
                  );
                }
                
                return (
                  <tr key={prediction.crop}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getCropNameInSpanish(prediction.crop)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prediction.yield.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(prediction.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {percentageOfSugarCane.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {profitabilityIndicator}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-blue-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">
                  Caña de Azúcar
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700">
                  {SUGAR_CANE_YIELD.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700">
                  -
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700">
                  100%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Referencia
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
      
      <Card title="Recomendaciones">
        <div className="space-y-4">
          <p className="text-gray-700">
            Basado en los parámetros de su terreno y las predicciones de rendimiento, considere las siguientes recomendaciones:
          </p>
          
          <div className="bg-green-50 p-4 rounded-md border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">Cultivo Óptimo</h4>
            <p className="text-gray-700">
              {sortedPredictions[0] && (
                <>
                  El cultivo de <strong>{getCropNameInSpanish(sortedPredictions[0].crop)}</strong> muestra el mayor potencial de rendimiento para las condiciones de su terreno con {sortedPredictions[0].yield.toLocaleString()} kg/ha.
                </>
              )}
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Diversificación</h4>
            <p className="text-gray-700">
              Considere sembrar múltiples cultivos para reducir riesgos y aumentar la resiliencia de su sistema agrícola. Una combinación de {sortedPredictions.slice(0, 2).map(p => getCropNameInSpanish(p.crop)).join(' y ')} podría ser una estrategia efectiva.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PredictionResults;