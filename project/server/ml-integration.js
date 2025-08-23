// Integración con el modelo de Machine Learning local
import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configuración de rutas del modelo
const ML_MODEL_CONFIG = {
  MODEL_PATH: 'C:/Users/maura/OneDrive/Documents/GitHub/cultivos/project/cultivos_mejorado/',
  PYTHON_SCRIPT: path.join(process.cwd(), 'server', 'predict.py'),
  PYTHON_ENV: 'python' // o 'python3' según tu instalación
};

// Verificar que los archivos del modelo existan
const verifyModelFiles = () => {
  const requiredFiles = [
    'modelo_clasificacion_mejorado.h5',
    'scaler_robusto.pkl',
    'label_encoder.pkl',
    'kmeans_optimizado.pkl',
    'power_transformer.pkl',
    'feature_selector.pkl'
  ];

  const missingFiles = requiredFiles.filter(file => {
    const fullPath = path.join(ML_MODEL_CONFIG.MODEL_PATH, file);
    return !fs.existsSync(fullPath);
  });

  return {
    allFilesPresent: missingFiles.length === 0,
    missingFiles,
    modelPath: ML_MODEL_CONFIG.MODEL_PATH
  };
};

// Función para llamar al modelo de Python
const callPythonMLModel = (inputData) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn(ML_MODEL_CONFIG.PYTHON_ENV, [
      ML_MODEL_CONFIG.PYTHON_SCRIPT,
      JSON.stringify(inputData),
      ML_MODEL_CONFIG.MODEL_PATH
    ]);

    let outputData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(outputData);
          resolve(result);
        } catch (error) {
          reject(new Error(`Error parsing Python output: ${error.message}`));
        }
      } else {
        reject(new Error(`Python process failed with code ${code}: ${errorData}`));
      }
    });
  });
};

// Endpoint para predicciones usando el modelo real
router.post('/predict-ml', async (req, res) => {
  try {
    console.log('🤖 Iniciando predicción con modelo ML real...');
    
    // Verificar archivos del modelo
    const modelStatus = verifyModelFiles();
    if (!modelStatus.allFilesPresent) {
      console.warn('⚠️ Archivos del modelo faltantes:', modelStatus.missingFiles);
      return res.status(503).json({
        error: 'Modelo ML no disponible',
        details: 'Archivos del modelo no encontrados',
        missing_files: modelStatus.missingFiles,
        model_path: modelStatus.modelPath
      });
    }

    const inputData = req.body;
    console.log('📊 Datos de entrada para ML:', inputData);

    // Validar datos de entrada
    const requiredFields = ['ph_suelo', 'tipo_suelo', 'textura_suelo', 'temperatura', 'precipitacion', 'humedad'];
    const missingFields = requiredFields.filter(field => inputData[field] === undefined);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Campos requeridos faltantes',
        missing_fields: missingFields
      });
    }

    // Llamar al modelo de Python
    const predictions = await callPythonMLModel(inputData);
    console.log('✅ Predicciones del modelo ML:', predictions);

    res.json({
      success: true,
      predictions,
      model_info: {
        type: 'neural_network',
        version: '2.0.0',
        source: 'local_ml_model'
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
    console.error('❌ Error en predicción ML:', error);
    res.status(500).json({
      error: 'Error en el modelo de ML',
      message: error.message,
      fallback_available: true
    });
  }
});

// Endpoint para verificar estado del modelo ML
router.get('/ml-status', (req, res) => {
  const modelStatus = verifyModelFiles();
  
  res.json({
    model_available: modelStatus.allFilesPresent,
    model_path: modelStatus.modelPath,
    missing_files: modelStatus.missingFiles,
    python_config: {
      python_command: ML_MODEL_CONFIG.PYTHON_ENV,
      script_path: ML_MODEL_CONFIG.PYTHON_SCRIPT
    },
    timestamp: new Date().toISOString()
  });
});

export default router;