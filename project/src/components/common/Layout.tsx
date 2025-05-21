import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, BarChart3, MessageSquare, PlusCircle, Home, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-green-700 text-white' : 'text-green-800 hover:bg-green-100';
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Leaf className="h-8 w-8 text-green-600" />
            <h1 className="ml-2 text-xl font-bold text-green-800">AgroDiversificación</h1>
          </div>
          <button 
            onClick={() => signOut()}
            className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-1" />
            <span>Salir</span>
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-grow flex">
        {/* Sidebar Navigation */}
        <nav className="hidden md:block bg-white w-64 shadow-md pt-8">
          <div className="space-y-2 px-2">
            <Link to="/" className={`flex items-center px-4 py-3 rounded-lg ${isActive('/')}`}>
              <Home className="h-5 w-5 mr-3" />
              <span>Inicio</span>
            </Link>
            <Link to="/registrar-finca" className={`flex items-center px-4 py-3 rounded-lg ${isActive('/registrar-finca')}`}>
              <PlusCircle className="h-5 w-5 mr-3" />
              <span>Registrar Finca</span>
            </Link>
            <Link to="/prediccion" className={`flex items-center px-4 py-3 rounded-lg ${isActive('/prediccion')}`}>
              <BarChart3 className="h-5 w-5 mr-3" />
              <span>Predicción</span>
            </Link>
            <Link to="/asistente" className={`flex items-center px-4 py-3 rounded-lg ${isActive('/asistente')}`}>
              <MessageSquare className="h-5 w-5 mr-3" />
              <span>Asistente</span>
            </Link>
          </div>
        </nav>
        
        {/* Main Content Area */}
        <main className="flex-grow p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Navigation Bar */}
      <nav className="md:hidden bg-white border-t shadow-md">
        <div className="grid grid-cols-4 h-16">
          <Link to="/" className={`flex flex-col items-center justify-center ${location.pathname === '/' ? 'text-green-600' : 'text-gray-600'}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Inicio</span>
          </Link>
          <Link to="/registrar-finca" className={`flex flex-col items-center justify-center ${location.pathname === '/registrar-finca' ? 'text-green-600' : 'text-gray-600'}`}>
            <PlusCircle className="h-6 w-6" />
            <span className="text-xs mt-1">Registrar</span>
          </Link>
          <Link to="/prediccion" className={`flex flex-col items-center justify-center ${location.pathname === '/prediccion' ? 'text-green-600' : 'text-gray-600'}`}>
            <BarChart3 className="h-6 w-6" />
            <span className="text-xs mt-1">Predicción</span>
          </Link>
          <Link to="/asistente" className={`flex flex-col items-center justify-center ${location.pathname === '/asistente' ? 'text-green-600' : 'text-gray-600'}`}>
            <MessageSquare className="h-6 w-6" />
            <span className="text-xs mt-1">Asistente</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Layout;