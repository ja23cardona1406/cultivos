import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
  tooltip?: string;
  helpText?: string; // 👈 añadida
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  error,
  children,
  required = false,
  tooltip,
  helpText,
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-center">
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {tooltip && (
          <div className="relative ml-2 group">
            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs cursor-help">
              ?
            </div>
            <div className="absolute z-10 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 pointer-events-none">
              {tooltip}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 rotate-45 bg-gray-800"></div>
            </div>
          </div>
        )}
      </div>

      {children}

      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : helpText ? (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      ) : null}
    </div>
  );
};

export default FormField;
