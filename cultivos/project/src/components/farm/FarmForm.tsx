import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import Card from '../common/Card';
import Button from '../common/Button';
import FormField from '../common/FormField';
import { FarmInsert } from '../../services/farmService';

interface FarmFormProps {
  onSubmit: (data: FarmInsert) => void;
  isLoading?: boolean;
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

const FarmForm: React.FC<FarmFormProps> = ({ onSubmit, isLoading = false }) => {
  const { 
    register, 
    handleSubmit, 
    control, 
    formState: { errors } 
  } = useForm<FarmInsert>();

  return (
    <Card title="Registrar Nueva Finca">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField 
          label="Nombre de la Finca" 
          name="nombre" 
          required
          error={errors.nombre?.message}
        >
          <input
            id="nombre"
            type="text"
            placeholder="Ej: Finca El Paraíso"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            {...register('nombre', { 
              required: 'El nombre de la finca es obligatorio' 
            })}
          />
        </FormField>

        <FormField 
          label="Ubicación" 
          name="ubicacion" 
          required
          error={errors.ubicacion?.message}
          tooltip="Ingrese el municipio, corregimiento o vereda donde se encuentra la finca"
        >
          <input
            id="ubicacion"
            type="text"
            placeholder="Ej: Palmira, Valle del Cauca"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            {...register('ubicacion', { 
              required: 'La ubicación es obligatoria' 
            })}
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField 
            label="pH del Suelo" 
            name="ph_suelo" 
            required
            error={errors.ph_suelo?.message}
            tooltip="El pH determina la acidez o alcalinidad del suelo. La escala va de 0 a 14, donde 7 es neutro, menos de 7 es ácido y más de 7 es alcalino."
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
          tooltip="Seleccione las prácticas agrícolas que utiliza en su finca"
        >
          <Controller
            control={control}
            name="practicas_agricolas"
            defaultValue={[]}
            render={({ field }) => (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {agriculturalPractices.map(practice => (
                  <div key={practice} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`practice-${practice}`}
                      value={practice}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(
                          e.target.checked
                            ? [...field.value, value]
                            : field.value.filter((p: string) => p !== value)
                        );
                      }}
                      checked={field.value.includes(practice)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`practice-${practice}`} className="ml-2 block text-sm text-gray-700">
                      {practice}
                    </label>
                  </div>
                ))}
              </div>
            )}
          />
        </FormField>

        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Registrar Finca'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default FarmForm;