import React, { useState } from 'react';
import { Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Card from '../common/Card';
import { CropPrediction, SUGAR_CANE_YIELD, getCropNameInSpanish } from '../../services/predictionsService';
import { TrendingUp, Target, Zap, AlertTriangle, CheckCircle, Info } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

interface PredictionResultsProps {
  predictions: CropPrediction[];
  isOnline?: boolean;
}

const PredictionResults: React.FC<PredictionResultsProps> = ({ predictions, isOnline = false }) => {
  const [activeView, setActiveView] = useState<'yield' | 'suitability'>('yield');
  
  // Sort predictions by yield (descending)
  const sortedPredictions = [...predictions].sort((a, b) => b.yield - a.yield);
  
  // Prepare data for yield comparison chart
  const yieldChartData = {
    labels: sortedPredictions.map(p => getCropNameInSpanish(p.crop)),
    datasets: [
      {
        label: 'Rendimiento Estimado (kg/ha)',
        data: sortedPredictions.map(p => p.yield),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(249, 115, 22)',
          'rgb(236, 72, 153)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
      // Segundo dataset para la línea de referencia de caña de azúcar
      {
        label: 'Caña de Azúcar (Referencia)',
        data: sortedPredictions.map(() => SUGAR_CANE_YIELD),
        backgroundColor: 'rgba(156, 163, 175, 0.4)',
        borderColor: 'rgb(156, 163, 175)',
        borderWidth: 2,
        // Removemos borderDash y type para mantener como bar
        borderSkipped: false,
      },
    ],
  };
  
  const yieldChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },
      title: {
        display: true,
        text: 'Predicción de Rendimiento por Cultivo',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: 20,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            const percentage = ((value / SUGAR_CANE_YIELD) * 100).toFixed(1);
            return `${label}: ${value.toLocaleString()} kg/ha (${percentage}% vs Caña)`;
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
          font: {
            size: 14,
            weight: 'bold' as const,
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart' as const,
    }
  };

  // Prepare data for suitability radar chart
  const bestPrediction = sortedPredictions[0];
  const suitabilityData = {
    labels: ['pH del Suelo', 'Temperatura', 'Humedad', 'Precipitación'],
    datasets: sortedPredictions.slice(0, 3).map((prediction, predictionIndex) => {
      const colors = [
        'rgba(34, 197, 94, 0.6)',
        'rgba(59, 130, 246, 0.6)',
        'rgba(249, 115, 22, 0.6)',
      ];
      const borderColors = [
        'rgb(34, 197, 94)',
        'rgb(59, 130, 246)',
        'rgb(249, 115, 22)',
      ];
      
      return {
        label: getCropNameInSpanish(prediction.crop),
        data: prediction.suitability_factors ? [
          prediction.suitability_factors.ph_suitability,
          prediction.suitability_factors.temperature_suitability,
          prediction.suitability_factors.humidity_suitability,
          prediction.suitability_factors.precipitation_suitability,
        ] : [0, 0, 0, 0],
        backgroundColor: colors[predictionIndex],
        borderColor: borderColors[predictionIndex],
        borderWidth: 2,
        pointBackgroundColor: borderColors[predictionIndex],
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: borderColors[predictionIndex],
      };
    }),
  };

  const suitabilityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },
      title: {
        display: true,
        text: 'Factores de Idoneidad por Cultivo',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: 20,
      },
    },
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        suggestedMin: 0,
        suggestedMax: 1,
        ticks: {
          display: true,
          stepSize: 0.2,
          callback: function(value: any) {
            return (value * 100).toFixed(0) + '%';
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart' as const,
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100';
    if (confidence >= 0.8) return 'text-blue-600 bg-blue-100';
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.9) return <CheckCircle className="w-4 h-4" />;
    if (confidence >= 0.8) return <Target className="w-4 h-4" />;
    if (confidence >= 0.7) return <Zap className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const getProfitabilityStatus = (percentage: number) => {
    if (percentage >= 90) return {
      label: 'Excelente',
      color: 'bg-green-100 text-green-800',
      icon: <TrendingUp className="w-4 h-4" />
    };
    if (percentage >= 70) return {
      label: 'Buena',
      color: 'bg-blue-100 text-blue-800',
      icon: <Target className="w-4 h-4" />
    };
    if (percentage >= 50) return {
      label: 'Media',
      color: 'bg-yellow-100 text-yellow-800',
      icon: <Info className="w-4 h-4" />
    };
    return {
      label: 'Baja',
      color: 'bg-red-100 text-red-800',
      icon: <AlertTriangle className="w-4 h-4" />
    };
  };

  return (
    <div className="space-y-6">
      {/* Status Indicator */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-sm font-medium text-gray-700">
              {isOnline ? 'Modelo ML en línea' : 'Modo offline (simulación avanzada)'}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {predictions.length} cultivos analizados
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <Card title="Análisis Visual">
        <div className="mb-6">
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveView('yield')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeView === 'yield'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Rendimiento
            </button>
            <button
              onClick={() => setActiveView('suitability')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeView === 'suitability'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Idoneidad
            </button>
          </div>
        </div>

        <div className="h-96">
          {activeView === 'yield' ? (
            <Bar data={yieldChartData} options={yieldChartOptions} />
          ) : (
            <Radar data={suitabilityData} options={suitabilityOptions} />
          )}
        </div>
      </Card>

      {/* Detailed Results Table */}
      <Card title="Resultados Detallados">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cultivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rendimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confianza
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  vs Caña de Azúcar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Viabilidad
                </th>
                {sortedPredictions[0]?.suitability_factors && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Idoneidad Promedio
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPredictions.map((prediction, rowIndex) => {
                const percentageOfSugarCane = (prediction.yield / SUGAR_CANE_YIELD) * 100;
                const profitability = getProfitabilityStatus(percentageOfSugarCane);
                const avgSuitability = prediction.suitability_factors ? 
                  (Object.values(prediction.suitability_factors).reduce((a, b) => a + b, 0) / 4) : 0;
                
                return (
                  <tr key={prediction.crop} className={rowIndex === 0 ? 'bg-green-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          rowIndex === 0 ? 'bg-green-500' : 
                          rowIndex === 1 ? 'bg-blue-500' : 
                          rowIndex === 2 ? 'bg-orange-500' : 'bg-pink-500'
                        }`}></div>
                        <div className="text-sm font-medium text-gray-900">
                          {getCropNameInSpanish(prediction.crop)}
                          {rowIndex === 0 && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Recomendado
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {prediction.yield.toLocaleString()} kg/ha
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(prediction.confidence)}`}>
                        {getConfidenceIcon(prediction.confidence)}
                        <span className="ml-1">
                          {(prediction.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(100, percentageOfSugarCane)}%` }}
                          ></div>
                        </div>
                        <span className="font-medium">
                          {percentageOfSugarCane.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profitability.color}`}>
                        {profitability.icon}
                        <span className="ml-1">{profitability.label}</span>
                      </span>
                    </td>
                    {prediction.suitability_factors && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${avgSuitability * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {(avgSuitability * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              
              {/* Sugar Cane Reference Row */}
              <tr className="bg-blue-50 border-t-2 border-blue-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-3 bg-blue-500 opacity-60"></div>
                    <div className="text-sm font-medium text-blue-900">
                      Caña de Azúcar (Referencia)
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700">
                  {SUGAR_CANE_YIELD.toLocaleString()} kg/ha
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700">
                  -
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700">
                  100%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Info className="w-4 h-4 mr-1" />
                    Base
                  </span>
                </td>
                {sortedPredictions[0]?.suitability_factors && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700">
                    -
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recommendations */}
      <Card title="Recomendaciones Personalizadas">
        <div className="space-y-6">
          {/* Best Crop Recommendation */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-green-800 mb-2">Cultivo Recomendado</h4>
                <p className="text-gray-700 mb-3">
                  Basado en las condiciones de su terreno, <strong>{getCropNameInSpanish(bestPrediction.crop)}</strong> presenta 
                  el mayor potencial con <strong>{bestPrediction.yield.toLocaleString()} kg/ha</strong> de rendimiento estimado 
                  y una confianza del <strong>{(bestPrediction.confidence * 100).toFixed(1)}%</strong>.
                </p>
                {bestPrediction.suitability_factors && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">pH Suelo</div>
                      <div className="text-lg font-semibold text-green-600">
                        {(bestPrediction.suitability_factors.ph_suitability * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Temperatura</div>
                      <div className="text-lg font-semibold text-green-600">
                        {(bestPrediction.suitability_factors.temperature_suitability * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Humedad</div>
                      <div className="text-lg font-semibold text-green-600">
                        {(bestPrediction.suitability_factors.humidity_suitability * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Precipitación</div>
                      <div className="text-lg font-semibold text-green-600">
                        {(bestPrediction.suitability_factors.precipitation_suitability * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Diversification Strategy */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">Estrategia de Diversificación</h4>
                <p className="text-gray-700 mb-3">
                  Para reducir riesgos y maximizar la rentabilidad, considere una rotación entre 
                  <strong> {sortedPredictions.slice(0, 2).map(p => getCropNameInSpanish(p.crop)).join(' y ')}</strong>. 
                  Esta combinación aprovecha las fortalezas de ambos cultivos en sus condiciones específicas.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedPredictions.slice(0, 2).map((prediction) => (
                    <div key={prediction.crop} className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="flex justify-between items-center">
                        <h5 className="font-medium text-gray-900">
                          {getCropNameInSpanish(prediction.crop)}
                        </h5>
                        <span className="text-sm text-gray-500">
                          {((prediction.yield / SUGAR_CANE_YIELD) * 100).toFixed(1)}% vs Caña
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {prediction.yield.toLocaleString()} kg/ha
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Economic Analysis */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-yellow-800 mb-2">Consideraciones Económicas</h4>
                <p className="text-gray-700 mb-3">
                  Aunque el rendimiento es importante, considere también los precios de mercado, costos de producción 
                  y demanda local. Los cultivos con menor rendimiento pueden ser más rentables según el contexto económico.
                </p>
                <div className="text-sm text-gray-600">
                  <p>💡 <strong>Consejo:</strong> Investigue los precios actuales de mercado y costos de insumos para cada cultivo antes de tomar la decisión final.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PredictionResults;