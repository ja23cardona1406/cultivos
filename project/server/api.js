import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mlIntegration from './ml-integration.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Integración con ML
app.use('/api', mlIntegration);

// Simulación del modelo de ML mejorada (fallback)
class EnhancedCropPredictionModel {
  constructor() {
    this.cropWeights = {
      'papa': {
        ph_optimal: [6.0, 7.0],
        temp_optimal: [15, 25],
        humidity_optimal: [65, 80],
        precipitation_optimal: [500, 800],
        soil_types: ['Franco', 'Franco-arenoso'],
        base_yield: 25000,
        confidence_base: 0.87
      },
      'zanahoria': {
        ph_optimal: [6.0, 7.5],
        temp_optimal: [18, 28],
        humidity_optimal: [60, 75],
        precipitation_optimal: [400, 700],
        soil_types: ['Franco', 'Arenoso'],
        base_yield: 35000,
        confidence_base: 0.92
      },
      'papaya': {
        ph_optimal: [6.0, 7.0],
        temp_optimal: [24, 32],
        humidity_optimal: [70, 85],
        precipitation_optimal: [1200, 2000],
        soil_types: ['Franco', 'Franco-arcilloso'],
        base_yield: 45000,
        confidence_base: 0.78
      },
      'mango': {
        ph_optimal: [5.5, 7.5],
        temp_optimal: [26, 35],
        humidity_optimal: [65, 80],
        precipitation_optimal: [800, 1500],
        soil_types: ['Franco', 'Franco-arcilloso'],
        base_yield: 20000,
        confidence_base: 0.83
      }
    };
  }

  calculateAdvancedSuitability(cropParams, inputData) {
    const factors = {};
    
    // Factor pH (curva gaussiana)
    const phOptimal = (cropParams.ph_optimal[0] + cropParams.ph_optimal[1]) / 2;
    const phRange = cropParams.ph_optimal[1] - cropParams.ph_optimal[0];
    const phDistance = Math.abs(inputData.ph_suelo - phOptimal);
    factors.ph_suitability = Math.exp(-0.5 * Math.pow(phDistance / (phRange / 3), 2));
    
    // Factor temperatura
    const tempOptimal = (cropParams.temp_optimal[0] + cropParams.temp_optimal[1]) / 2;
    const tempRange = cropParams.temp_optimal[1] - cropParams.temp_optimal[0];
    const tempDistance = Math.abs(inputData.temperatura - tempOptimal);
    factors.temperature_suitability = Math.exp(-0.5 * Math.pow(tempDistance / (tempRange / 2), 2));
    
    // Factor humedad
    const humidityOptimal = (cropParams.humidity_optimal[0] + cropParams.humidity_optimal[1]) / 2;
    const humidityRange = cropParams.humidity_optimal[1] - cropParams.humidity_optimal[0];
    const humidityDistance = Math.abs(inputData.humedad - humidityOptimal);
    factors.humidity_suitability = Math.exp(-0.5 * Math.pow(humidityDistance / (humidityRange / 2), 2));
    
    // Factor precipitación
    const precipOptimal = (cropParams.precipitation_optimal[0] + cropParams.precipitation_optimal[1]) / 2;
    const precipRange = cropParams.precipitation_optimal[1] - cropParams.precipitation_optimal[0];
    const precipDistance = Math.abs(inputData.precipitacion - precipOptimal);
    factors.precipitation_suitability = Math.exp(-0.5 * Math.pow(precipDistance / (precipRange / 2), 2));
    
    // Factor tipo de suelo
    const soilFactor = cropParams.soil_types.includes(inputData.tipo_suelo) ? 1.0 : 0.75;
    
    // Factor prácticas agrícolas
    const practicesBonus = this.calculatePracticesBonus(inputData.practicas_agricolas);
    
    // Combinar factores con pesos
    const overallSuitability = (
      factors.ph_suitability * 0.25 +
      factors.temperature_suitability * 0.30 +
      factors.humidity_suitability * 0.25 +
      factors.precipitation_suitability * 0.20
    ) * soilFactor * practicesBonus;
    
    return {
      overall: Math.min(1.0, overallSuitability),
      factors: {
        ph_suitability: Math.round(factors.ph_suitability * 1000) / 1000,
        temperature_suitability: Math.round(factors.temperature_suitability * 1000) / 1000,
        humidity_suitability: Math.round(factors.humidity_suitability * 1000) / 1000,
        precipitation_suitability: Math.round(factors.precipitation_suitability * 1000) / 1000
      }
    };
  }

  calculatePracticesBonus(practices) {
    if (!practices || practices.length === 0) return 1.0;
    
    const beneficialPractices = [
      'Riego por goteo',
      'Cultivo orgánico', 
      'Rotación de cultivos',
      'Compostaje',
      'Arado mínimo'
    ];
    
    const matchingPractices = practices.filter(p => beneficialPractices.includes(p));
    return 1.0 + (matchingPractices.length * 0.05);
  }

  predict(inputData) {
    const predictions = [];
    
    Object.keys(this.cropWeights).forEach(crop => {
      const cropParams = this.cropWeights[crop];
      const suitabilityResult = this.calculateAdvancedSuitability(cropParams, inputData);
      
      // Calcular rendimiento con más precisión
      const baseYield = cropParams.base_yield;
      const suitabilityMultiplier = 0.6 + (suitabilityResult.overall * 0.7);
      const randomVariation = 0.85 + (Math.random() * 0.3); // ±15% variación
      const predictedYield = Math.round(baseYield * suitabilityMultiplier * randomVariation);
      
      // Calcular confianza más realista
      const baseConfidence = cropParams.confidence_base;
      const consistencyFactor = 1 - Math.abs(suitabilityResult.overall - 
        (Object.values(suitabilityResult.factors).reduce((a, b) => a + b, 0) / 4));
      const confidence = Math.min(0.98, Math.max(0.65, 
        baseConfidence * consistencyFactor * (0.9 + Math.random() * 0.2)
      ));

      predictions.push({
        crop,
        yield: Math.max(8000, predictedYield),
        confidence: parseFloat(confidence.toFixed(3)),
        suitability_factors: suitabilityResult.factors
      });
    });

    return predictions.sort((a, b) => b.yield - a.yield);
  }
}

// Instancia del modelo simulado mejorado
const enhancedModel = new EnhancedCropPredictionModel();

// Endpoint principal de predicción (fallback mejorado)
app.post('/api/predict', async (req, res) => {
  try {
    console.log('📊 Solicitud de predicción recibida:', req.body);
    
    // Primero intentar usar el modelo ML real
    try {
      const mlResponse = await fetch('http://localhost:3001/api/predict-ml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      
      if (mlResponse.ok) {
        const mlResult = await mlResponse.json();
        console.log('✅ Usando predicciones del modelo ML real');
        return res.json(mlResult);
      }
    } catch (mlError) {
      console.log('⚠️ Modelo ML no disponible, usando simulación avanzada');
    }
    
    const inputData = req.body;
    
    // Validar datos de entrada
    const requiredFields = ['ph_suelo', 'tipo_suelo', 'textura_suelo', 'temperatura', 'precipitacion', 'humedad'];
    const missingFields = requiredFields.filter(field => inputData[field] === undefined || inputData[field] === null);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        missing_fields: missingFields
      });
    }

    // Realizar predicción con modelo mejorado
    const predictions = enhancedModel.predict(inputData);
    
    console.log('✅ Predicciones generadas (simulación avanzada):', predictions.length);
    
    res.json({
      success: true,
      predictions,
      model_info: {
        type: 'enhanced_simulation',
        version: '2.0.0',
        note: 'Usando simulación avanzada como fallback'
      },
      metadata: {
        timestamp: new Date().toISOString(),
        input_summary: {
          ph: inputData.ph_suelo,
          temperatura: inputData.temperatura,
          humedad: inputData.humedad,
          precipitacion: inputData.precipitacion,
          tipo_suelo: inputData.tipo_suelo
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error en predicción:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// Endpoint para obtener información del modelo
app.get('/api/model-info', (req, res) => {
  res.json({
    model_name: 'Crop Yield Prediction Neural Network',
    version: '2.0.0',
    supported_crops: ['papa', 'zanahoria', 'papaya', 'mango'],
    input_features: [
      'ph_suelo',
      'tipo_suelo', 
      'textura_suelo',
      'temperatura',
      'precipitacion',
      'humedad',
      'practicas_agricolas'
    ],
    status: 'active',
    ml_integration: true,
    local_model_path: 'C:/Users/maura/OneDrive/Documents/GitHub/cultivos/project/cultivos_mejorado/'
  });
});

// Endpoint de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    ml_model_available: false // Se actualizará cuando el modelo esté disponible
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor API iniciado en puerto ${PORT}`);
  console.log(`📡 Endpoints disponibles:`);
  console.log(`   POST http://localhost:${PORT}/api/predict`);
  console.log(`   POST http://localhost:${PORT}/api/predict-ml (modelo real)`);
  console.log(`   GET  http://localhost:${PORT}/api/model-info`);
  console.log(`   GET  http://localhost:${PORT}/api/ml-status`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`🤖 Integración con modelo ML: ACTIVADA`);
  console.log(`📂 Ruta del modelo: C:/Users/maura/OneDrive/Documents/GitHub/cultivos/project/cultivos_mejorado/`);
});