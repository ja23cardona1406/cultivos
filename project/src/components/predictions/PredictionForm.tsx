import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Card from '../common/Card';
import Button from '../common/Button';
import FormField from '../common/FormField';
import { Farm } from '../../services/farmService';
import { PredictionInput } from '../../services/predictionsService';

interface PredictionFormProps {
  farms: Farm[];
  onSubmit: (data: PredictionInput) => void;
  isLoading: boolean;
}

const soilTypes = [
  'Arcilloso',
  'Arenoso',
  'Franco',
  'Franco-arcilloso',
  'Franco-arenoso',
  'Limoso'
];

const soilTextures = [
  'Gruesa',
  'Media',
  'Fina',
  'Muy fina'
];

const agriculturalPractices = [
  'Riego por goteo',
  'Riego por aspersión',
  'Cultivo orgánico',
  'Uso de fertilizantes químicos',
  'Uso de pesticidas',
  'Rotación de cultivos',
  'Arado mínimo',
  'Compostaje'
];

const PredictionForm: React.FC<PredictionFormProps> = ({ farms, onSubmit, isLoading }) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<PredictionInput>();
  const [useExistingFarm, setUseExistingFarm] = useState(farms.length > 0);
  const selectedFarmId = watch('farm_id');
  
  const handleFarmSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const farmId = e.target.value;
    if (!farmId) return;
    
    const farm = farms.find(f => f.id === farmId);
    if (farm) {
      setValue('ph_suelo', farm.ph_suelo);
      setValue('tipo_suelo', farm.tipo_suelo);
      setValue('textura_suelo', farm.textura_suelo);
      setValue('temperatura', farm.temperatura);
      setValue('precipitacion', farm.precipitacion);
      setValue('humedad', farm.humedad);
      setValue('practicas_agricolas', farm.practicas_agricolas);
    }
  };

  const handleFormSubmit = (data: any) => {
    // Remove farm_id field before submitting
    const { farm_id, ...predictionData } = data;
    onSubmit(predictionData as PredictionInput);
  };
  
  return (
    <Card title="Predicción de Cultivos">
      {farms.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              type="button"
              onClick={() => {
                setUseExistingFarm(true);
                reset();
              }}
              className={`px-4 py-2 rounded-lg ${useExistingFarm ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
            >
              Usar datos de una finca existente
            </button>
            <button
              type="button"
              onClick={() => {
                setUseExistingFarm(false);
                reset();
              }}
              className={`px-4 py-2 rounded-lg ${!useExistingFarm ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
            >
              Ingresar datos personalizados
            </button>
          </div>
          
          {useExistingFarm && (
            <FormField 
              label="Seleccionar Finca" 
              name="farm_id" 
              required
              error={errors.farm_id?.message}
            >
              <select
                id="farm_id"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                {...register('farm_id', { 
                  required: 'Debe seleccionar una finca' 
                })}
                onChange={handleFarmSelect}
              >
                <option value="">Seleccione una finca</option>
                {farms.map(farm => (
                  <option key={farm.id} value={farm.id}>{farm.nombre}</option>
                ))}
              </select>
            </FormField>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* If using existing farm data and a farm is selected, show readonly fields */}
        {(!useExistingFarm || !selectedFarmId) && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                label="pH del Suelo" 
                name="ph_suelo" 
                required
                error={errors.ph_suelo?.message}
                tooltip="El pH determina la acidez o alcalinidad del suelo. La escala va de 0 a 14, donde 7 es neutro."
              >
                <input
                  id="ph_suelo"
                  type="number"
                  step="0.1"
                  placeholder="Ej: 6.5"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  {...register('ph_suelo', { 
                    required: 'El pH del suelo es obligatorio',
                    min: { value: 0, message: 'El pH mínimo es 0' },
                    max: { value: 14, message: 'El pH máximo es 14' },
                    valueAsNumber: true
                  })}
                />
              </FormField>

              <FormField 
                label="Tipo de Suelo" 
                name="tipo_suelo" 
                required
                error={errors.tipo_suelo?.message}
              >
                <select
                  id="tipo_suelo"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  {...register('tipo_suelo', { 
                    required: 'El tipo de suelo es obligatorio' 
                  })}
                >
                  <option value="">Seleccione un tipo</option>
                  {soilTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                label="Textura del Suelo" 
                name="textura_suelo" 
                required
                error={errors.textura_suelo?.message}
              >
                <select
                  id="textura_suelo"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  {...register('textura_suelo', { 
                    required: 'La textura del suelo es obligatoria' 
                  })}
                >
                  <option value="">Seleccione una textura</option>
                  {soilTextures.map(texture => (
                    <option key={texture} value={texture}>{texture}</option>
                  ))}
                </select>
              </FormField>

              <FormField 
                label="Temperatura Promedio (°C)" 
                name="temperatura" 
                required
                error={errors.temperatura?.message}
                tooltip="Temperatura promedio anual en grados Celsius"
              >
                <input
                  id="temperatura"
                  type="number"
                  step="0.1"
                  placeholder="Ej: 23.5"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  {...register('temperatura', { 
                    required: 'La temperatura es obligatoria',
                    valueAsNumber: true
                  })}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                label="Precipitación Anual (mm)" 
                name="precipitacion" 
                required
                error={errors.precipitacion?.message}
                tooltip="Cantidad promedio de lluvia al año en milímetros"
              >
                <input
                  id="precipitacion"
                  type="number"
                  placeholder="Ej: 1200"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  {...register('precipitacion', { 
                    required: 'La precipitación es obligatoria',
                    valueAsNumber: true
                  })}
                />
              </FormField>

              <FormField 
                label="Humedad Promedio (%)" 
                name="humedad" 
                required
                error={errors.humedad?.message}
                tooltip="Porcentaje de humedad relativa promedio"
              >
                <input
                  id="humedad"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Ej: 75"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  {...register('humedad', { 
                    required: 'La humedad es obligatoria',
                    min: { value: 0, message: 'La humedad mínima es 0%' },
                    max: { value: 100, message: 'La humedad máxima es 100%' },
                    valueAsNumber: true
                  })}
                />
              </FormField>
            </div>

            <FormField 
              label="Prácticas Agrícolas" 
              name="practicas_agricolas" 
              error={errors.practicas_agricolas?.message}
              tooltip="Seleccione las prácticas agrícolas que utiliza o planea utilizar"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {agriculturalPractices.map(practice => (
                  <div key={practice} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`practice-${practice}`}
                      value={practice}
                      {...register('practicas_agricolas')}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`practice-${practice}`} className="ml-2 block text-sm text-gray-700">
                      {practice}
                    </label>
                  </div>
                ))}
              </div>
            </FormField>
          </>
        )}
        
        {useExistingFarm && selectedFarmId && (
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <p className="text-green-800">
              Utilizando los datos de la finca seleccionada para la predicción.
            </p>
          </div>
        )}
        
        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Calculando...' : 'Predecir Rendimiento'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PredictionForm;