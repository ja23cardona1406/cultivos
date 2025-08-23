import { useState, useEffect, useCallback, useRef } from 'react';
import { initializeAISystem, getModelStatistics, getSystemMetrics } from '../services/chatService';

interface AIState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  modelStats: any;
  systemMetrics: any;
  initializationAttempts: number;
}

interface UseAIInitializationReturn extends AIState {
  retry: () => Promise<void>;
  forceReinitialization: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

export const useAIInitialization = (): UseAIInitializationReturn => {
  const [state, setState] = useState<AIState>({
    isInitialized: false,
    isLoading: true,
    error: null,
    modelStats: null,
    systemMetrics: null,
    initializationAttempts: 0
  });

  const isMountedRef = useRef(true);
  const initializationTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Marcar como montado
    isMountedRef.current = true;
    
    // Inicializar sistema automáticamente
    initializeSystem();

    // Cleanup al desmontar
    return () => {
      isMountedRef.current = false;
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
    };
  }, []);

  const updateState = useCallback((newState: Partial<AIState>) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, ...newState }));
    }
  }, []);

  const initializeSystem = useCallback(async () => {
    try {
      updateState({ 
        isLoading: true, 
        error: null,
        initializationAttempts: state.initializationAttempts + 1
      });

      console.log('🚀 Inicializando sistema de IA híbrido...');
      console.log('📊 Componentes: CNN + ML + Sistema Experto');

      // Timeout para evitar inicialización infinita
      const initPromise = initializeAISystem();
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        initializationTimeoutRef.current = setTimeout(() => {
          reject(new Error('Timeout de inicialización (30s)'));
        }, 30000);
      });

      const success = await Promise.race([initPromise, timeoutPromise]);

      if (!isMountedRef.current) return;

      if (success) {
        // Cargar estadísticas del modelo
        const [stats, metrics] = await Promise.allSettled([
          getModelStatistics(),
          getSystemMetrics()
        ]);

        const modelStats = stats.status === 'fulfilled' ? stats.value : null;
        const systemMetrics = metrics.status === 'fulfilled' ? metrics.value : null;

        updateState({
          isInitialized: true,
          isLoading: false,
          error: null,
          modelStats,
          systemMetrics
        });

        console.log('✅ Sistema de IA inicializado correctamente');
        console.log('🔧 Modelos disponibles:', modelStats?.systemType || 'Sistema híbrido');
        
        // Mostrar estadísticas de inicialización
        if (modelStats) {
          console.log('📈 Estadísticas del sistema:', {
            vocabSize: modelStats.vocabSize,
            categories: modelStats.categories?.length || 0,
            capabilities: modelStats.capabilities?.length || 0
          });
        }
      } else {
        throw new Error('Inicialización falló sin detalles específicos');
      }

    } catch (error) {
      console.error('❌ Error durante la inicialización:', error);
      
      if (!isMountedRef.current) return;

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido durante la inicialización';
      
      updateState({
        isInitialized: false,
        isLoading: false,
        error: errorMessage
      });

      // Auto-retry en caso de errores de red (max 3 intentos)
      if (state.initializationAttempts < 3 && errorMessage.includes('network')) {
        console.log(`🔄 Reintentando inicialización (intento ${state.initializationAttempts + 1}/3)...`);
        
        setTimeout(() => {
          if (isMountedRef.current) {
            initializeSystem();
          }
        }, 5000 * state.initializationAttempts); // Backoff exponencial
      }
    } finally {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
    }
  }, [state.initializationAttempts, updateState]);

  const retry = useCallback(async () => {
    console.log('🔄 Reintentando inicialización manual...');
    updateState({ 
      error: null, 
      isLoading: true,
      initializationAttempts: 0 // Reset contador para retry manual
    });
    
    try {
      await initializeSystem();
    } catch (error) {
      console.error('Error en retry:', error);
    }
  }, [initializeSystem, updateState]);

  const forceReinitialization = useCallback(async () => {
    console.log('🔧 Forzando reinicialización completa del sistema...');
    
    updateState({ 
      isInitialized: false,
      isLoading: true,
      error: null,
      modelStats: null,
      systemMetrics: null,
      initializationAttempts: 0
    });

    await initializeSystem();
  }, [initializeSystem, updateState]);

  const refreshStats = useCallback(async () => {
    try {
      console.log('📊 Actualizando estadísticas del sistema...');
      
      const [stats, metrics] = await Promise.allSettled([
        getModelStatistics(),
        getSystemMetrics()
      ]);

      const modelStats = stats.status === 'fulfilled' ? stats.value : null;
      const systemMetrics = metrics.status === 'fulfilled' ? metrics.value : null;

      updateState({ modelStats, systemMetrics });
      
      console.log('✅ Estadísticas actualizadas');
    } catch (error) {
      console.error('Error actualizando estadísticas:', error);
    }
  }, [updateState]);

  return {
    ...state,
    retry,
    forceReinitialization,
    refreshStats
  };
};