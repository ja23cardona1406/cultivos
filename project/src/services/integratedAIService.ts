import { cnnLanguageModel, ModelPrediction } from '../models/CNNLanguageModel';
import { agriculturalAI, SoilData } from './agriculturalAI';

export interface CropRecommendation {
  cultivo: string;
  probabilidadExito: number;
  rendimientoEsperado: number;
  ventajas: string[];
  desventajas: string[];
  requerimientos: {
    ph: { min: number; max: number; };
    temperatura: { min: number; max: number; };
    precipitacion: { min: number; max: number; };
  };
  inversion: number;
  tiempoHarvest: number; // meses
}

export interface AIResponse {
  message: string;
  confidence: number;
  modelType: 'cnn' | 'expert' | 'hybrid' | 'ml_prediction';
  relatedTopics?: string[];
  recommendations?: CropRecommendation[];
}

class IntegratedAIService {
  private isInitialized = false;
  
  // Datos de cultivos del Valle del Cauca
  private cultivosValleDelCauca = {
    'Caña de azúcar': {
      rendimientoPromedio: 120,
      phOptimo: { min: 6.0, max: 8.0 },
      temperaturaOptima: { min: 22, max: 30 },
      precipitacionOptima: { min: 1200, max: 2000 }
    },
    'Café': {
      rendimientoPromedio: 1.8,
      phOptimo: { min: 6.0, max: 6.8 },
      temperaturaOptima: { min: 18, max: 24 },
      precipitacionOptima: { min: 1200, max: 1800 }
    },
    'Cacao': {
      rendimientoPromedio: 0.8,
      phOptimo: { min: 6.0, max: 7.0 },
      temperaturaOptima: { min: 21, max: 30 },
      precipitacionOptima: { min: 1400, max: 2000 }
    },
    'Aguacate': {
      rendimientoPromedio: 15,
      phOptimo: { min: 6.0, max: 7.0 },
      temperaturaOptima: { min: 20, max: 28 },
      precipitacionOptima: { min: 1000, max: 1600 }
    },
    'Plátano': {
      rendimientoPromedio: 25,
      phOptimo: { min: 6.0, max: 7.5 },
      temperaturaOptima: { min: 26, max: 30 },
      precipitacionOptima: { min: 1800, max: 2500 }
    },
    'Tomate': {
      rendimientoPromedio: 80,
      phOptimo: { min: 6.0, max: 6.8 },
      temperaturaOptima: { min: 20, max: 30 },
      precipitacionOptima: { min: 600, max: 1200 }
    },
    'Papaya': {
      rendimientoPromedio: 60,
      phOptimo: { min: 6.0, max: 7.0 },
      temperaturaOptima: { min: 25, max: 32 },
      precipitacionOptima: { min: 1200, max: 2000 }
    },
    'Yuca': {
      rendimientoPromedio: 20,
      phOptimo: { min: 5.5, max: 7.0 },
      temperaturaOptima: { min: 25, max: 35 },
      precipitacionOptima: { min: 800, max: 1500 }
    }
  };

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🚀 Inicializando sistema de IA integrado...');
      
      // Intentar cargar modelo entrenado
      const modelLoaded = await cnnLanguageModel.loadModel();
      
      if (!modelLoaded) {
        console.log('🔄 Entrenando nuevo modelo CNN...');
        await cnnLanguageModel.train();
      }
      
      this.isInitialized = true;
      console.log('✅ Sistema de IA integrado inicializado');
      
    } catch (error) {
      console.error('❌ Error inicializando IA integrada:', error);
      this.isInitialized = true; // Permitir funcionar con solo sistema experto
    }
  }

  async processMessage(message: string, farmData?: SoilData): Promise<string> {
    await this.initialize();

    try {
      // Detectar el tipo de consulta
      const queryType = this.detectQueryType(message);
      
      switch (queryType) {
        case 'prediction':
          return await this.handlePredictionQuery(message, farmData);
          
        case 'recommendation':
          return await this.handleRecommendationQuery(farmData);
          
        case 'technical':
          return await this.handleTechnicalQuery(message, farmData);
          
        default:
          // Usar el sistema CNN para consultas generales
          return await this.handleGeneralQuery(message, farmData);
      }
    } catch (error) {
      console.error('Error procesando mensaje:', error);
      return this.getFallbackResponse(message, farmData);
    }
  }

  private detectQueryType(message: string): 'prediction' | 'recommendation' | 'technical' | 'general' {
    const lowerMessage = message.toLowerCase();
    
    const predictionKeywords = ['predicción', 'rendimiento', 'producción', 'cuanto', 'esperar'];
    const recommendationKeywords = ['recomienda', 'cultivo', 'sembrar', 'mejor', 'alternativa'];
    const technicalKeywords = ['como', 'cuando', 'fertilizar', 'regar', 'plaga', 'enfermedad'];
    
    if (predictionKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'prediction';
    }
    
    if (recommendationKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'recommendation';
    }
    
    if (technicalKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'technical';
    }
    
    return 'general';
  }

  private async handleGeneralQuery(message: string, farmData?: SoilData): Promise<string> {
    try {
      // Intentar usar modelo CNN primero
      const cnnPrediction = await cnnLanguageModel.predict(message);
      
      // Si la confianza es alta, usar CNN
      if (cnnPrediction.confidence > 0.6) {
        let response = `🤖 **${cnnPrediction.category.toUpperCase()}** (Confianza: ${(cnnPrediction.confidence * 100).toFixed(0)}%)\n\n`;
        response += cnnPrediction.response;
        
        // Agregar contexto específico de la finca si está disponible
        if (farmData && this.shouldAddFarmContext(cnnPrediction.category)) {
          response += this.addFarmSpecificContext(cnnPrediction.category, farmData);
        }
        
        return response;
      }
      
      // Si la confianza es media, usar enfoque híbrido
      if (cnnPrediction.confidence > 0.4) {
        return await this.generateHybridResponse(message, cnnPrediction, farmData);
      }
      
      // Confianza baja, usar sistema experto
      return this.getFallbackResponse(message, farmData);
      
    } catch (error) {
      console.error('Error en consulta general:', error);
      return this.getFallbackResponse(message, farmData);
    }
  }

  private async generateHybridResponse(message: string, cnnPrediction: ModelPrediction, farmData?: SoilData): Promise<string> {
    // Combinar CNN con sistema experto
    const expertResponse = agriculturalAI.processChat(message, farmData);
    
    let hybridResponse = `🔬 **Análisis Híbrido CNN + Experto**\n\n`;
    
    hybridResponse += `**🤖 Modelo CNN (${cnnPrediction.category}):**\n`;
    hybridResponse += `${cnnPrediction.response}\n\n`;
    
    hybridResponse += `**🧠 Sistema Experto:**\n`;
    hybridResponse += `${expertResponse.response}\n\n`;
    
    hybridResponse += `💡 *Recomendación final:* Ambos sistemas sugieren enfoques complementarios para tu consulta.`;
    
    return hybridResponse;
  }

  private async handlePredictionQuery(message: string, farmData?: SoilData): Promise<string> {
    if (!farmData) {
      return "📊 Para hacer predicciones precisas, necesito los datos de tu finca. Por favor, registra tu finca primero en la sección 'Mi Finca'.";
    }

    try {
      // Usar predicción local basada en compatibilidad
      return await this.getLocalPrediction(farmData);
      
    } catch (error) {
      console.error('Error en predicción:', error);
      return await this.getLocalPrediction(farmData);
    }
  }

  private async getLocalPrediction(farmData: SoilData): Promise<string> {
    // Predicción local basada en reglas
    const recommendations = [];
    
    for (const [cultivo, datos] of Object.entries(this.cultivosValleDelCauca)) {
      const score = this.calculateCompatibilityScore(farmData, datos);
      if (score > 0.6) {
        recommendations.push({ cultivo, score, rendimiento: datos.rendimientoPromedio * score });
      }
    }
    
    recommendations.sort((a, b) => b.score - a.score);
    
    let response = "🔮 **PREDICCIONES BASADAS EN IA PARA TU FINCA**\n\n";
    response += `📍 **Condiciones actuales:**\n`;
    response += `• pH: ${farmData.ph}\n`;
    response += `• Temperatura: ${farmData.temperature}°C\n`;
    response += `• Precipitación: ${farmData.precipitation}mm/año\n`;
    response += `• Tipo de suelo: ${farmData.soilType}\n\n`;
    
    response += "🌾 **TOP CULTIVOS RECOMENDADOS:**\n\n";
    
    recommendations.slice(0, 5).forEach((rec, index) => {
      const emoji = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][index];
      response += `${emoji} **${rec.cultivo}**\n`;
      response += `   • Compatibilidad: ${(rec.score * 100).toFixed(0)}%\n`;
      response += `   • Rendimiento estimado: ${rec.rendimiento.toFixed(1)} ton/ha\n\n`;
    });
    
    response += "💡 *Estas predicciones están basadas en condiciones óptimas para cada cultivo*";
    
    return response;
  }

  private calculateCompatibilityScore(farmData: SoilData, cropData: any): number {
    let score = 0;
    let factors = 0;
    
    // Factor pH
    if (farmData.ph >= cropData.phOptimo.min && farmData.ph <= cropData.phOptimo.max) {
      score += 1;
    } else {
      const phDistance = Math.min(
        Math.abs(farmData.ph - cropData.phOptimo.min),
        Math.abs(farmData.ph - cropData.phOptimo.max)
      );
      score += Math.max(0, 1 - (phDistance / 2));
    }
    factors++;
    
    // Factor temperatura
    if (farmData.temperature >= cropData.temperaturaOptima.min && 
        farmData.temperature <= cropData.temperaturaOptima.max) {
      score += 1;
    } else {
      const tempDistance = Math.min(
        Math.abs(farmData.temperature - cropData.temperaturaOptima.min),
        Math.abs(farmData.temperature - cropData.temperaturaOptima.max)
      );
      score += Math.max(0, 1 - (tempDistance / 10));
    }
    factors++;
    
    // Factor precipitación
    if (farmData.precipitation >= cropData.precipitacionOptima.min && 
        farmData.precipitation <= cropData.precipitacionOptima.max) {
      score += 1;
    } else {
      const precipDistance = Math.min(
        Math.abs(farmData.precipitation - cropData.precipitacionOptima.min),
        Math.abs(farmData.precipitation - cropData.precipitacionOptima.max)
      );
      score += Math.max(0, 1 - (precipDistance / 500));
    }
    factors++;
    
    return score / factors;
  }

  private async handleRecommendationQuery(farmData?: SoilData): Promise<string> {
    if (!farmData) {
      return "🌱 Para darte recomendaciones específicas, necesito conocer las condiciones de tu finca. Por favor, registra tu finca primero.";
    }
    
    const recommendations = await this.getCombinedRecommendations(farmData);
    return this.formatRecommendationsResponse(recommendations);
  }

  async getCombinedRecommendations(farmData: SoilData): Promise<CropRecommendation[]> {
    const recommendations: CropRecommendation[] = [];
    
    for (const [cultivo, datos] of Object.entries(this.cultivosValleDelCauca)) {
      const compatibilidad = this.calculateCompatibilityScore(farmData, datos);
      
      if (compatibilidad > 0.5) {
        recommendations.push({
          cultivo,
          probabilidadExito: compatibilidad,
          rendimientoEsperado: datos.rendimientoPromedio * compatibilidad,
          ventajas: this.getCropAdvantages(cultivo),
          desventajas: this.getCropDisadvantages(cultivo),
          requerimientos: {
            ph: datos.phOptimo,
            temperatura: datos.temperaturaOptima,
            precipitacion: datos.precipitacionOptima
          },
          inversion: this.estimateInvestment(cultivo),
          tiempoHarvest: this.getHarvestTime(cultivo)
        });
      }
    }
    
    return recommendations.sort((a, b) => b.probabilidadExito - a.probabilidadExito);
  }

  private getCropAdvantages(cultivo: string): string[] {
    const advantages: Record<string, string[]> = {
      'Café': ['Alta demanda internacional', 'Precio estable', 'Cultivo sostenible'],
      'Cacao': ['Mercado premium', 'Agroforestería', 'Valor agregado'],
      'Aguacate': ['Creciente demanda', 'Precio alto', 'Mercado exportación'],
      'Plátano': ['Mercado local fuerte', 'Múltiples usos', 'Resistente'],
      'Tomate': ['Rotación rápida', 'Alto rendimiento', 'Demanda constante'],
      'Papaya': ['Crecimiento rápido', 'Mercado en expansión', 'Nutritivo'],
      'Yuca': ['Resistente a sequía', 'Bajo mantenimiento', 'Mercado estable']
    };
    
    return advantages[cultivo] || ['Cultivo promisorio', 'Adaptado a la región'];
  }

  private getCropDisadvantages(cultivo: string): string[] {
    const disadvantages: Record<string, string[]> = {
      'Café': ['Sensible al clima', 'Plagas específicas', 'Inversión inicial alta'],
      'Cacao': ['Tiempo de establecimiento', 'Manejo técnico', 'Mercado especializado'],
      'Aguacate': ['Requiere riego', 'Sensible a enfermedades', 'Inversión alta'],
      'Plátano': ['Susceptible a vientos', 'Plagas comunes', 'Manejo postcosecha'],
      'Tomate': ['Muchas plagas', 'Requiere invernadero', 'Mercado volátil'],
      'Papaya': ['Susceptible a virus', 'Vida útil corta', 'Requiere cuidados'],
      'Yuca': ['Procesamiento necesario', 'Precio bajo', 'Almacenamiento difícil']
    };
    
    return disadvantages[cultivo] || ['Requiere aprendizaje', 'Mercado por desarrollar'];
  }

  private estimateInvestment(cultivo: string): number {
    // Inversión en millones de pesos colombianos por hectárea
    const investments: Record<string, number> = {
      'Café': 8,
      'Cacao': 12,
      'Aguacate': 15,
      'Plátano': 6,
      'Tomate': 20,
      'Papaya': 10,
      'Yuca': 3
    };
    
    return investments[cultivo] || 5;
  }

  private getHarvestTime(cultivo: string): number {
    const harvestTimes: Record<string, number> = {
      'Café': 36,
      'Cacao': 48,
      'Aguacate': 36,
      'Plátano': 12,
      'Tomate': 4,
      'Papaya': 10,
      'Yuca': 12
    };
    
    return harvestTimes[cultivo] || 12;
  }

  private formatRecommendationsResponse(recommendations: CropRecommendation[]): string {
    let response = "🌾 **RECOMENDACIONES PERSONALIZADAS PARA TU FINCA**\n\n";
    
    recommendations.slice(0, 3).forEach((rec, index) => {
      const medal = ['🥇', '🥈', '🥉'][index];
      response += `${medal} **${rec.cultivo}** (${(rec.probabilidadExito * 100).toFixed(0)}% compatibilidad)\n\n`;
      
      response += `📈 **Rendimiento esperado:** ${rec.rendimientoEsperado.toFixed(1)} ton/ha\n`;
      response += `💰 **Inversión estimada:** $${rec.inversion} millones/ha\n`;
      response += `⏰ **Tiempo a primera cosecha:** ${rec.tiempoHarvest} meses\n\n`;
      
      response += `✅ **Ventajas:**\n`;
      rec.ventajas.forEach(ventaja => response += `   • ${ventaja}\n`);
      
      response += `\n⚠️ **Consideraciones:**\n`;
      rec.desventajas.forEach(desventaja => response += `   • ${desventaja}\n`);
      
      response += `\n📊 **Requerimientos óptimos:**\n`;
      response += `   • pH: ${rec.requerimientos.ph.min} - ${rec.requerimientos.ph.max}\n`;
      response += `   • Temperatura: ${rec.requerimientos.temperatura.min}°C - ${rec.requerimientos.temperatura.max}°C\n`;
      response += `   • Precipitación: ${rec.requerimientos.precipitacion.min} - ${rec.requerimientos.precipitacion.max}mm\n\n`;
      
      response += "---\n\n";
    });
    
    return response;
  }

  private async handleTechnicalQuery(message: string, farmData?: SoilData): Promise<string> {
    // Usar el sistema experto para consultas técnicas
    const expertResponse = agriculturalAI.processChat(message, farmData);
    return `🧠 **Consulta Técnica**\n\n${expertResponse.response}`;
  }

  private shouldAddFarmContext(category: string): boolean {
    const contextCategories = ['cultivos', 'suelo', 'clima', 'riego', 'fertilizacion'];
    return contextCategories.includes(category);
  }

  private addFarmSpecificContext(category: string, farmData: SoilData): string {
    let context = '\n\n📊 **Contexto de tu finca:**\n';
    
    switch (category) {
      case 'cultivos':
        context += `Con pH ${farmData.ph} y temperatura ${farmData.temperature}°C, considera estas recomendaciones adicionales.`;
        break;
      case 'suelo':
        context += `Tu suelo actual: pH ${farmData.ph}, tipo ${farmData.soilType}. `;
        break;
      case 'clima':
        context += `Condiciones actuales: ${farmData.temperature}°C, ${farmData.precipitation}mm/año, ${farmData.humidity}% humedad.`;
        break;
      case 'riego':
        context += `Con ${farmData.precipitation}mm anuales de precipitación, evalúa si necesitas riego complementario.`;
        break;
      default:
        context += `Considera las condiciones específicas de tu finca para mejores resultados.`;
    }
    
    return context;
  }

  private getFallbackResponse(message: string, farmData?: SoilData): string {
    // Respuesta de sistema experto como último recurso
    const expertResponse = agriculturalAI.processChat(message, farmData);
    return `🧠 **Sistema Experto**\n\n${expertResponse.response}`;
  }

  getSystemInfo(): any {
    return {
      isInitialized: this.isInitialized,
      models: {
        cnn: cnnLanguageModel.getModelInfo(),
        expertSystem: 'Activo',
        mlModel: 'Integrado (local)'
      },
      capabilities: [
        'Procesamiento de lenguaje natural en español',
        'Predicciones de rendimiento de cultivos',
        'Recomendaciones personalizadas',
        'Sistema experto agrícola',
        'Análisis de compatibilidad de suelos'
      ],
      trainingData: {
        cnn: 'Corpus agrícola en español (9 categorías)',
        ml: 'Dataset de cultivos Valle del Cauca (8 cultivos)',
        expert: 'Reglas de producción agrícola (100+ reglas)'
      }
    };
  }
}

export const integratedAI = new IntegratedAIService();