// This service will handle API calls to the external prediction model
// The URL should be replaced with your actual model API endpoint

export type CropType = 'papa' | 'zanahoria' | 'papaya' | 'mango';

export interface PredictionInput {
  ph_suelo: number;
  tipo_suelo: string;
  textura_suelo: string;
  temperatura: number;
  precipitacion: number;
  humedad: number;
  practicas_agricolas: string[];
}

export interface CropPrediction {
  crop: CropType;
  yield: number;  // kg/hectárea
  confidence: number;  // 0-1
}

// Constants for comparison with sugar cane
export const SUGAR_CANE_YIELD = 80000; // kg/hectárea (aproximado)

export const getPredictions = async (input: PredictionInput): Promise<CropPrediction[]> => {
  try {
    // Replace with your actual prediction API endpoint
    const response = await fetch('https://your-prediction-api.com/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error('Prediction API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching predictions:', error);
    
    // For development purposes, return mock data
    // Remove this in production when connecting to real API
    return [
      { crop: 'papa', yield: 25000, confidence: 0.87 },
      { crop: 'zanahoria', yield: 35000, confidence: 0.92 },
      { crop: 'papaya', yield: 45000, confidence: 0.78 },
      { crop: 'mango', yield: 20000, confidence: 0.83 },
    ];
  }
};

export const getCropNameInSpanish = (crop: CropType): string => {
  const names: Record<CropType, string> = {
    papa: 'Papa',
    zanahoria: 'Zanahoria',
    papaya: 'Papaya',
    mango: 'Mango'
  };
  return names[crop];
};