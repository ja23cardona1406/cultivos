import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Card from '../common/Card';
import FormField from '../common/FormField';
import { Leaf } from 'lucide-react';

const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { signIn, signUp, user, session, loading: authLoading } = useAuth();
  
  // Si el usuario ya está autenticado, no mostrar el formulario
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (user && session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <div className="flex flex-col items-center mb-6">
            <Leaf className="h-12 w-12 text-green-600 mb-2" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Bienvenido!
            </h2>
            <p className="text-gray-600">
              Ya has iniciado sesión correctamente
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {user.email}
            </p>
          </div>
          <Button 
            onClick={() => window.location.href = '/dashboard'} // O la ruta que uses
            fullWidth
          >
            Ir al Dashboard
          </Button>
        </Card>
      </div>
    );
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevenir múltiples submits
    if (loading) return;
    
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    console.log('Form submitted:', { isLogin, email, password: '***' }); // Debug log
    
    try {
      // Validación básica
      if (!email || !password) {
        throw new Error('Por favor complete todos los campos');
      }
      
      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      const { data, error: authError } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);
      
      console.log('Auth result:', { data, authError }); // Debug log
        
      if (authError) {
        console.error('Auth error details:', authError);
        
        // Manejo mejorado de errores específicos de Supabase
        let errorMessage = 'Ocurrió un error. Por favor intente de nuevo.';
        
        if (authError.message.includes('Invalid login credentials')) {
          errorMessage = 'Correo electrónico o contraseña incorrectos';
        } else if (authError.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor confirma tu correo electrónico antes de iniciar sesión';
        } else if (authError.message.includes('User already registered')) {
          errorMessage = 'Este correo ya está registrado. Intenta iniciar sesión.';
        } else if (authError.message.includes('Password should be at least 6 characters')) {
          errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        } else if (authError.message.includes('Unable to validate email address')) {
          errorMessage = 'Formato de correo electrónico inválido';
        } else {
          errorMessage = authError.message;
        }
        
        throw new Error(errorMessage);
      }
      
      // Manejo exitoso
      if (isLogin && data) {
        setSuccess('¡Inicio de sesión exitoso!');
        // El AuthContext ya manejará la redirección automáticamente
        // No hacer nada más aquí, el componente se renderizará de nuevo
      } else if (!isLogin) {
        // Para registro exitoso
        setSuccess('Cuenta creada exitosamente. Verifica tu correo electrónico para confirmar tu cuenta.');
        setIsLogin(true); // Cambiar a modo login después del registro
        setEmail('');
        setPassword('');
      }
      
    } catch (err) {
      console.error('Handle submit error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Ocurrió un error. Por favor intente de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccess(null);
    setEmail('');
    setPassword('');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <Leaf className="h-12 w-12 text-green-600 mb-2" />
          <h2 className="text-center text-2xl font-bold text-gray-900">
            AgroDiversificación
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Plataforma para agricultores del Valle del Cauca
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField label="Correo electrónico" name="email" required>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="tu@email.com"
            />
          </FormField>
          
          <FormField 
            label="Contraseña" 
            name="password" 
            required
            helpText={!isLogin ? "La contraseña debe tener al menos 6 caracteres" : undefined}
          >
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Mínimo 6 caracteres"
            />
          </FormField>
          
          <div>
            <Button 
              type="submit" 
              fullWidth 
              disabled={loading}
              className="flex justify-center"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : (
                isLogin ? 'Iniciar sesión' : 'Crear cuenta'
              )}
            </Button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleToggleMode}
            disabled={loading}
            className="text-sm font-medium text-green-600 hover:text-green-500 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AuthForm;