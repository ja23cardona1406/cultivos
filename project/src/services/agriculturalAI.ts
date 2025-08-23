export interface SoilData {
  ph: number;
  temperature: number;
  precipitation: number;
  humidity: number;
  soilType: string;
  elevation?: number;
}

export interface AIResponse {
  response: string;
  confidence: number;
  category: string;
  suggestions?: string[];
}

class AgriculturalAI {
  private cropDatabase = {
    'café': {
      optimalConditions: {
        phRange: [6.0, 6.8] as [number, number],
        tempRange: [18, 24] as [number, number],
        precipitationRange: [1200, 1800] as [number, number],
        humidityRange: [70, 85] as [number, number],
        elevation: [800, 2000] as [number, number]
      },
      characteristics: {
        yield: '1.2-2.5 ton/ha',
        harvestTime: '6-8 meses',
        investment: 'Alta',
        marketDemand: 'Estable'
      },
      tips: [
        'Requiere sombra parcial en climas cálidos',
        'Sensible a heladas',
        'Necesita suelos bien drenados'
      ]
    },
    'cacao': {
      optimalConditions: {
        phRange: [6.0, 7.0] as [number, number],
        tempRange: [21, 30] as [number, number],
        precipitationRange: [1400, 2000] as [number, number],
        humidityRange: [75, 85] as [number, number],
        elevation: [0, 1000] as [number, number]
      },
      characteristics: {
        yield: '0.5-1.2 ton/ha',
        harvestTime: '4-6 años primera cosecha',
        investment: 'Alta',
        marketDemand: 'Creciente'
      },
      tips: [
        'Requiere sombra especialmente al inicio',
        'Sensible a vientos fuertes',
        'Necesita polinización manual o insectos'
      ]
    },
    'aguacate': {
      optimalConditions: {
        phRange: [6.0, 7.0] as [number, number],
        tempRange: [20, 28] as [number, number],
        precipitationRange: [1000, 1600] as [number, number],
        humidityRange: [60, 80] as [number, number],
        elevation: [0, 2300] as [number, number]
      },
      characteristics: {
        yield: '10-20 ton/ha',
        harvestTime: '3-4 años primera cosecha',
        investment: 'Alta',
        marketDemand: 'Muy alta'
      },
      tips: [
        'Requiere excelente drenaje',
        'Sensible al encharcamiento',
        'Necesita riego complementario'
      ]
    },
    'plátano': {
      optimalConditions: {
        phRange: [6.0, 7.5] as [number, number],
        tempRange: [26, 30] as [number, number],
        precipitationRange: [1800, 2500] as [number, number],
        humidityRange: [80, 90] as [number, number],
        elevation: [0, 1500] as [number, number]
      },
      characteristics: {
        yield: '20-40 ton/ha',
        harvestTime: '9-12 meses',
        investment: 'Media',
        marketDemand: 'Estable'
      },
      tips: [
        'Susceptible a vientos fuertes',
        'Requiere materia orgánica abundante',
        'Necesita drenaje pero humedad constante'
      ]
    }
  };

  analyzeConditions(soilData: SoilData): AIResponse {
    const { ph, temperature, precipitation, humidity } = soilData;
    
    // Analizar compatibilidad con cultivos
    const compatibility = this.calculateCropCompatibility(soilData);
    const bestCrop = compatibility[0];
    
    let response = `🌱 **Análisis de Condiciones de tu Finca**\n\n`;
    response += `📊 **Condiciones Actuales:**\n`;
    response += `• pH: ${ph} ${this.interpretPH(ph)}\n`;
    response += `• Temperatura: ${temperature}°C ${this.interpretTemperature(temperature)}\n`;
    response += `• Precipitación: ${precipitation}mm/año ${this.interpretPrecipitation(precipitation)}\n`;
    response += `• Humedad: ${humidity}% ${this.interpretHumidity(humidity)}\n\n`;
    
    response += `🏆 **Cultivo más recomendado:** ${bestCrop.crop}\n`;
    response += `📈 **Compatibilidad:** ${(bestCrop.score * 100).toFixed(0)}%\n\n`;
    
    response += `📋 **Top 3 opciones:**\n`;
    compatibility.slice(0, 3).forEach((item, index) => {
      response += `${index + 1}. ${item.crop}: ${(item.score * 100).toFixed(0)}%\n`;
    });
    
    return {
      response,
      confidence: bestCrop.score,
      category: 'análisis',
      suggestions: this.generateSuggestions(soilData, compatibility)
    };
  }

  private calculateCropCompatibility(soilData: SoilData) {
    const results: Array<{crop: string, score: number}> = [];
    
    Object.entries(this.cropDatabase).forEach(([cropName, cropData]) => {
      let score = 0;
      let factors = 0;
      
      // Evaluar pH
      if (this.isInRange(soilData.ph, cropData.optimalConditions.phRange)) {
        score += 1;
      } else {
        score += this.calculateProximityScore(soilData.ph, cropData.optimalConditions.phRange);
      }
      factors++;
      
      // Evaluar temperatura
      if (this.isInRange(soilData.temperature, cropData.optimalConditions.tempRange)) {
        score += 1;
      } else {
        score += this.calculateProximityScore(soilData.temperature, cropData.optimalConditions.tempRange);
      }
      factors++;
      
      // Evaluar precipitación
      if (this.isInRange(soilData.precipitation, cropData.optimalConditions.precipitationRange)) {
        score += 1;
      } else {
        score += this.calculateProximityScore(soilData.precipitation, cropData.optimalConditions.precipitationRange);
      }
      factors++;
      
      // Evaluar humedad
      if (this.isInRange(soilData.humidity, cropData.optimalConditions.humidityRange)) {
        score += 1;
      } else {
        score += this.calculateProximityScore(soilData.humidity, cropData.optimalConditions.humidityRange);
      }
      factors++;
      
      results.push({
        crop: cropName,
        score: score / factors
      });
    });
    
    return results.sort((a, b) => b.score - a.score);
  }

  private isInRange(value: number, range: [number, number]): boolean {
    return value >= range[0] && value <= range[1];
  }
  
  private calculateProximityScore(value: number, range: [number, number]): number {
    if (value < range[0]) {
      return Math.max(0, 1 - (range[0] - value) / range[0]);
    } else if (value > range[1]) {
      return Math.max(0, 1 - (value - range[1]) / range[1]);
    }
    return 1;
  }

  private interpretPH(ph: number): string {
    if (ph < 5.5) return '(Muy ácido)';
    if (ph < 6.0) return '(Ácido)';
    if (ph < 7.0) return '(Ligeramente ácido)';
    if (ph < 7.5) return '(Neutro)';
    if (ph < 8.0) return '(Ligeramente alcalino)';
    return '(Alcalino)';
  }

  private interpretTemperature(temp: number): string {
    if (temp < 18) return '(Frío)';
    if (temp < 24) return '(Templado)';
    if (temp < 30) return '(Cálido)';
    return '(Muy caliente)';
  }

  private interpretPrecipitation(precip: number): string {
    if (precip < 800) return '(Seco)';
    if (precip < 1200) return '(Moderado)';
    if (precip < 2000) return '(Húmedo)';
    return '(Muy húmedo)';
  }

  private interpretHumidity(humidity: number): string {
    if (humidity < 60) return '(Baja)';
    if (humidity < 80) return '(Moderada)';
    return '(Alta)';
  }

  private generateSuggestions(soilData: SoilData, compatibility: Array<{crop: string, score: number}>): string[] {
    const suggestions: string[] = [];
    
    // Sugerencias basadas en pH
    if (soilData.ph < 6.0) {
      suggestions.push('Considera aplicar cal agrícola para aumentar el pH del suelo');
    } else if (soilData.ph > 7.5) {
      suggestions.push('Aplica materia orgánica para reducir la alcalinidad del suelo');
    }
    
    // Sugerencias basadas en precipitación
    if (soilData.precipitation < 1000) {
      suggestions.push('Planifica un sistema de riego para complementar la precipitación');
    } else if (soilData.precipitation > 2500) {
      suggestions.push('Implementa sistemas de drenaje para evitar encharcamientos');
    }
    
    // Sugerencia de diversificación
    if (compatibility[0].score > 0.8) {
      suggestions.push(`${compatibility[0].crop} es ideal para tus condiciones`);
    } else {
      suggestions.push('Considera una combinación de cultivos para diversificar riesgos');
    }
    
    return suggestions;
  }

  processChat(message: string, farmData?: SoilData): AIResponse {
    const lowerMessage = message.toLowerCase();
    
    // Detectar tipo de consulta
    if (lowerMessage.includes('ph') || lowerMessage.includes('suelo')) {
      return this.handleSoilQuestions(farmData);
    } else if (lowerMessage.includes('temperatura') || lowerMessage.includes('clima')) {
      return this.handleClimateQuestions(farmData);
    } else if (lowerMessage.includes('riego') || lowerMessage.includes('agua')) {
      return this.handleIrrigationQuestions(farmData);
    } else if (farmData) {
      return this.analyzeConditions(farmData);
    }
    
    return {
      response: 'Hola, soy tu asistente agrícola. Puedo ayudarte con recomendaciones de cultivos, análisis de suelo, y consejos sobre agricultura. ¿En qué puedo asistirte?',
      confidence: 1.0,
      category: 'general'
    };
  }

  private handleSoilQuestions(farmData?: SoilData): AIResponse {
    let response = "🌱 **Información sobre Suelo**\n\n";
    
    if (farmData) {
      response += `Tu suelo tiene un pH de ${farmData.ph} ${this.interpretPH(farmData.ph)}.\n\n`;
      
      if (farmData.ph < 6.0) {
        response += "Para mejorar suelos ácidos:\n";
        response += "• Aplica cal agrícola (1-2 ton/ha)\n";
        response += "• Usa ceniza de madera\n";
        response += "• Incorpora compost bien descompuesto\n";
      } else if (farmData.ph > 7.5) {
        response += "Para suelos alcalinos:\n";
        response += "• Incorpora materia orgánica\n";
        response += "• Usa azufre elemental\n";
        response += "• Aplica abonos verdes\n";
      } else {
        response += "¡Tu pH está en un rango óptimo para la mayoría de cultivos!\n";
      }
    } else {
      response += "Para análisis específico de tu suelo, necesito conocer tus datos. En general:\n\n";
      response += "• pH óptimo para la mayoría de cultivos: 6.0-7.0\n";
      response += "• Suelos ácidos (pH < 6): Aplicar cal\n";
      response += "• Suelos alcalinos (pH > 7.5): Aplicar materia orgánica\n";
    }
    
    return {
      response,
      confidence: 0.9,
      category: 'suelo'
    };
  }

  private handleClimateQuestions(farmData?: SoilData): AIResponse {
    let response = "🌤️ **Información Climática**\n\n";
    
    if (farmData) {
      response += `Condiciones actuales: ${farmData.temperature}°C, ${farmData.precipitation}mm/año\n\n`;
      
      const suitableCrops = this.calculateCropCompatibility(farmData).slice(0, 3);
      response += "Cultivos recomendados para tu clima:\n";
      suitableCrops.forEach((crop, index) => {
        response += `${index + 1}. ${crop.crop} (${(crop.score * 100).toFixed(0)}% compatibilidad)\n`;
      });
    } else {
      response += "Factores climáticos importantes:\n";
      response += "• Temperatura: Afecta el crecimiento y desarrollo\n";
      response += "• Precipitación: Determinante para el riego\n";
      response += "• Humedad: Influye en enfermedades\n";
      response += "\nPara recomendaciones específicas, comparte los datos de tu finca.";
    }
    
    return {
      response,
      confidence: 0.85,
      category: 'clima'
    };
  }

  private handleIrrigationQuestions(farmData?: SoilData): AIResponse {
    let response = "💧 **Manejo del Agua**\n\n";
    
    if (farmData) {
      response += `Con ${farmData.precipitation}mm de precipitación anual:\n\n`;
      
      if (farmData.precipitation < 800) {
        response += "⚠️ Precipitación baja - Riego esencial\n";
        response += "• Sistema de riego por goteo recomendado\n";
        response += "• Mulching para conservar humedad\n";
        response += "• Cultivos resistentes a sequía\n";
      } else if (farmData.precipitation > 2000) {
        response += "💧 Precipitación alta - Cuidado con drenaje\n";
        response += "• Implementar sistemas de drenaje\n";
        response += "• Evitar encharcamientos\n";
        response += "• Cultivos que toleren humedad\n";
      } else {
        response += "✅ Precipitación moderada - Riego complementario\n";
        response += "• Riego durante época seca\n";
        response += "• Monitoreo de humedad del suelo\n";
        response += "• Riego eficiente (goteo o aspersión)\n";
      }
    } else {
      response += "Principios básicos del riego:\n";
      response += "• Riego por goteo: Más eficiente\n";
      response += "• Riego matutino: Reduce enfermedades\n";
      response += "• Monitoreo: Evita exceso o déficit\n";
    }
    
    return {
      response,
      confidence: 0.88,
      category: 'riego'
    };
  }
}

export const agriculturalAI = new AgriculturalAI();