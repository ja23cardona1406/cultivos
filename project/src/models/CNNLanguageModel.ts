import * as tf from '@tensorflow/tfjs';

export interface TrainingExample {
  input: string;
  output: string;
  category: string; // 'cultivos', 'suelo', 'clima', 'plagas', etc.
}

export interface ModelPrediction {
  response: string;
  confidence: number;
  category: string;
  tokens: string[];
}

export class CNNLanguageModel {
  private model: tf.LayersModel | null = null;
  private tokenizer: Map<string, number> = new Map();
  private reverseTokenizer: Map<number, string> = new Map();
  private categoryEncoder: Map<string, number> = new Map();
  private categoryDecoder: Map<number, string> = new Map();
  private maxSequenceLength = 50;
  private vocabSize = 0;
  private isInitialized = false;

  // Datos de entrenamiento específicos para agricultura
  private trainingData: TrainingExample[] = [
    {
      input: "que cultivo es mejor para ph 6.2 temperatura 24 grados",
      output: "Para un pH de 6.2 y temperatura de 24°C, te recomiendo cacao, café o aguacate. Estos cultivos prosperan en condiciones ligeramente ácidas y temperaturas moderadas.",
      category: "cultivos"
    },
    {
      input: "como mejorar ph del suelo acido",
      output: "Para mejorar el pH de suelo ácido, aplica cal agrícola (carbonato de calcio) a razón de 1-2 toneladas por hectárea. También puedes usar ceniza de madera o compost bien descompuesto.",
      category: "suelo"
    },
    {
      input: "cuanta agua necesita el cafe",
      output: "El café necesita entre 1200-1800mm de precipitación anual. Durante la época seca, requiere riego complementario de 20-30mm semanales, especialmente durante la floración.",
      category: "riego"
    },
    {
      input: "temperatura optima para cacao",
      output: "El cacao requiere temperaturas entre 21-30°C, con óptimo en 25°C. Temperaturas menores a 16°C o mayores a 38°C afectan negativamente su desarrollo y producción.",
      category: "clima"
    },
    {
      input: "como sembrar platano",
      output: "Para sembrar plátano: 1) Prepara hoyos de 40x40x40cm, 2) Distancia de 3x3 metros, 3) Usa colinos sanos, 4) Aplica materia orgánica en el hoyo, 5) Riega abundantemente después de plantar.",
      category: "siembra"
    },
    {
      input: "fertilizante para aguacate",
      output: "El aguacate requiere fertilización balanceada NPK 10-10-10. Aplica 200g por árbol joven mensualmente. En árboles adultos, usa 1-2kg cada 3 meses. Complementa con magnesio y boro.",
      category: "fertilizacion"
    },
    {
      input: "plagas del tomate",
      output: "Las principales plagas del tomate son: mosca blanca, trips, pulgones, gusano cogollero y minador de hojas. Usa control biológico con bacillus thuringiensis y trampas cromáticas.",
      category: "plagas"
    },
    {
      input: "cuando cosechar papaya",
      output: "La papaya se cosecha cuando presenta rayas amarillas en la base y cede ligeramente a la presión. Generalmente ocurre 4-6 meses después de la floración, dependiendo de la variedad.",
      category: "cosecha"
    },
    {
      input: "rotacion de cultivos beneficios",
      output: "La rotación de cultivos mejora la fertilidad del suelo, reduce plagas y enfermedades, optimiza nutrientes y aumenta la biodiversidad. Alterna leguminosas con gramíneas para fijar nitrógeno.",
      category: "manejo"
    },
    {
      input: "humedad ideal para cultivos tropicales",
      output: "Los cultivos tropicales requieren humedad relativa entre 70-85%. Niveles menores al 60% causan estrés hídrico, mientras que superiores al 90% favorecen enfermedades fungosas.",
      category: "clima"
    }
  ];

  constructor() {
    this.initializeCategories();
  }

  private initializeCategories() {
    const categories = ['cultivos', 'suelo', 'riego', 'clima', 'siembra', 'fertilizacion', 'plagas', 'cosecha', 'manejo'];
    categories.forEach((cat, index) => {
      this.categoryEncoder.set(cat, index);
      this.categoryDecoder.set(index, cat);
    });
  }

  // Tokenización específica para texto agrícola en español
  private tokenizeText(text: string): number[] {
    // Preprocesamiento específico para agricultura
    const cleanText = text.toLowerCase()
      .replace(/[^\w\sáéíóúüñ]/g, ' ') // Mantener caracteres especiales del español
      .replace(/\s+/g, ' ')
      .trim();

    const words = cleanText.split(' ');
    const tokens: number[] = [];

    words.forEach(word => {
      if (!this.tokenizer.has(word)) {
        const tokenId = this.tokenizer.size + 1; // +1 para reservar 0 como padding
        this.tokenizer.set(word, tokenId);
        this.reverseTokenizer.set(tokenId, word);
      }
      tokens.push(this.tokenizer.get(word)!);
    });

    return tokens;
  }

  private padSequence(sequence: number[], maxLength: number): number[] {
    if (sequence.length >= maxLength) {
      return sequence.slice(0, maxLength);
    }
    return [...sequence, ...new Array(maxLength - sequence.length).fill(0)];
  }

  private buildVocabulary() {
    // Construir vocabulario desde los datos de entrenamiento
    this.tokenizer.clear();
    this.reverseTokenizer.clear();
    
    // Reservar token especiales
    this.tokenizer.set('<PAD>', 0);
    this.tokenizer.set('<UNK>', 1);
    this.tokenizer.set('<START>', 2);
    this.tokenizer.set('<END>', 3);
    
    this.reverseTokenizer.set(0, '<PAD>');
    this.reverseTokenizer.set(1, '<UNK>');
    this.reverseTokenizer.set(2, '<START>');
    this.reverseTokenizer.set(3, '<END>');

    // Tokenizar todos los textos para construir vocabulario
    this.trainingData.forEach(example => {
      this.tokenizeText(example.input);
      this.tokenizeText(example.output);
    });

    this.vocabSize = this.tokenizer.size;
    console.log(`Vocabulario construido: ${this.vocabSize} tokens`);
  }

  // Crear modelo CNN para procesamiento de lenguaje
  private createModel() {
    const model = tf.sequential();

    // Capa de embedding
    model.add(tf.layers.embedding({
      inputDim: this.vocabSize,
      outputDim: 128,
      inputLength: this.maxSequenceLength,
      name: 'embedding'
    }));

    // Primera capa convolucional - filtros de tamaño 3 (trigramas)
    model.add(tf.layers.conv1d({
      filters: 128,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same',
      name: 'conv1d_1'
    }));
    
    model.add(tf.layers.maxPooling1d({ poolSize: 2 }));
    model.add(tf.layers.dropout({ rate: 0.3 }));

    // Segunda capa convolucional - filtros de tamaño 4 (tetragramas)
    model.add(tf.layers.conv1d({
      filters: 64,
      kernelSize: 4,
      activation: 'relu',
      padding: 'same',
      name: 'conv1d_2'
    }));
    
    model.add(tf.layers.maxPooling1d({ poolSize: 2 }));
    model.add(tf.layers.dropout({ rate: 0.3 }));

    // Tercera capa convolucional - filtros de tamaño 5 (pentagramas)
    model.add(tf.layers.conv1d({
      filters: 32,
      kernelSize: 5,
      activation: 'relu',
      padding: 'same',
      name: 'conv1d_3'
    }));

    // Global Max Pooling para capturar las características más importantes
    model.add(tf.layers.globalMaxPooling1d());
    
    // Capas densas para clasificación/regresión
    model.add(tf.layers.dense({
      units: 256,
      activation: 'relu',
      name: 'dense_1'
    }));
    
    model.add(tf.layers.dropout({ rate: 0.5 }));
    
    model.add(tf.layers.dense({
      units: 128,
      activation: 'relu',
      name: 'dense_2'
    }));

    // Capa de salida para clasificación de categorías
    model.add(tf.layers.dense({
      units: this.categoryEncoder.size,
      activation: 'softmax',
      name: 'category_output'
    }));

    // Compilar modelo
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'sparseCategoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async train(): Promise<void> {
    try {
      console.log('Iniciando entrenamiento del modelo CNN...');
      
      // Construir vocabulario
      this.buildVocabulary();
      
      // Crear modelo
      this.model = this.createModel();
      
      // Preparar datos de entrenamiento
      const { inputs, categories } = this.prepareTrainingData();
      
      console.log(`Entrenando con ${inputs.shape[0]} ejemplos...`);
      
      // Entrenar el modelo
      await this.model.fit(inputs, categories, {
        epochs: 50,
        batchSize: 4,
        validationSplit: 0.2,
        shuffle: true,
        verbose: 1,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 10 === 0) {
              console.log(`Época ${epoch}: loss=${logs?.loss?.toFixed(4)}, accuracy=${logs?.acc?.toFixed(4)}`);
            }
          }
        }
      });

      inputs.dispose();
      categories.dispose();
      
      this.isInitialized = true;
      console.log('Modelo CNN entrenado exitosamente!');
      
      // Guardar modelo
      await this.saveModel();
      
    } catch (error) {
      console.error('Error durante el entrenamiento:', error);
      throw error;
    }
  }

  private prepareTrainingData() {
    const inputSequences: number[][] = [];
    const categoryLabels: number[] = [];

    this.trainingData.forEach(example => {
      const tokens = this.tokenizeText(example.input);
      const paddedTokens = this.padSequence(tokens, this.maxSequenceLength);
      inputSequences.push(paddedTokens);
      
      const categoryId = this.categoryEncoder.get(example.category) || 0;
      categoryLabels.push(categoryId);
    });

    const inputs = tf.tensor2d(inputSequences);
    const categories = tf.tensor1d(categoryLabels, 'int32');

    return { inputs, categories };
  }

  async predict(inputText: string): Promise<ModelPrediction> {
    if (!this.model || !this.isInitialized) {
      throw new Error('Modelo no entrenado. Ejecuta train() primero.');
    }

    try {
      // Tokenizar entrada
      const tokens = this.tokenizeText(inputText);
      const paddedTokens = this.padSequence(tokens, this.maxSequenceLength);
      const inputTensor = tf.tensor2d([paddedTokens]);

      // Realizar predicción
      const prediction = this.model.predict(inputTensor) as tf.Tensor;
      const probabilities = await prediction.data();

      // Encontrar categoría con mayor probabilidad
      const maxIndex = probabilities.indexOf(Math.max(...Array.from(probabilities)));
      const predictedCategory = this.categoryDecoder.get(maxIndex) || 'general';
      const confidence = probabilities[maxIndex];

      // Limpiar tensores
      inputTensor.dispose();
      prediction.dispose();

      // Generar respuesta basada en la categoría predicha
      const response = this.generateResponse(inputText, predictedCategory, confidence);

      return {
        response,
        confidence,
        category: predictedCategory,
        tokens: tokens.map(t => this.reverseTokenizer.get(t) || '<UNK>')
      };

    } catch (error) {
      console.error('Error en predicción:', error);
      throw error;
    }
  }

  private generateResponse(inputText: string, category: string, confidence: number): string {
    // Buscar ejemplo más similar en la categoría predicha
    const categoryExamples = this.trainingData.filter(ex => ex.category === category);
    
    if (categoryExamples.length === 0) {
      return "Lo siento, no pude procesar tu consulta sobre agricultura. ¿Podrías ser más específico?";
    }

    // Calcular similitud simple basada en palabras clave
    let bestMatch = categoryExamples[0];
    let bestSimilarity = 0;

    const inputWords = inputText.toLowerCase().split(/\s+/);

    categoryExamples.forEach(example => {
      const exampleWords = example.input.toLowerCase().split(/\s+/);
      const commonWords = inputWords.filter(word => exampleWords.includes(word));
      const similarity = commonWords.length / Math.max(inputWords.length, exampleWords.length);
      
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = example;
      }
    });

    // Personalizar respuesta basada en la confianza
    let response = bestMatch.output;
    
    if (confidence < 0.7) {
      response = `${response}\n\n💡 Esta respuesta tiene una confianza del ${(confidence * 100).toFixed(0)}%. Si necesitas información más específica, proporciona más detalles.`;
    }

    return response;
  }

  async saveModel(): Promise<void> {
    if (!this.model) return;
    
    try {
      await this.model.save('localstorage://agricultural-cnn-model');
      
      // Guardar tokenizer y otros metadatos
      const metadata = {
        tokenizer: Array.from(this.tokenizer.entries()),
        reverseTokenizer: Array.from(this.reverseTokenizer.entries()),
        categoryEncoder: Array.from(this.categoryEncoder.entries()),
        categoryDecoder: Array.from(this.categoryDecoder.entries()),
        maxSequenceLength: this.maxSequenceLength,
        vocabSize: this.vocabSize
      };
      
      localStorage.setItem('agricultural-cnn-metadata', JSON.stringify(metadata));
      console.log('Modelo y metadatos guardados exitosamente');
    } catch (error) {
      console.error('Error guardando modelo:', error);
    }
  }

  async loadModel(): Promise<boolean> {
    try {
      // Cargar modelo
      this.model = await tf.loadLayersModel('localstorage://agricultural-cnn-model');
      
      // Cargar metadatos
      const metadataStr = localStorage.getItem('agricultural-cnn-metadata');
      if (!metadataStr) {
        throw new Error('Metadatos no encontrados');
      }
      
      const metadata = JSON.parse(metadataStr);
      
      this.tokenizer = new Map(metadata.tokenizer);
      this.reverseTokenizer = new Map(metadata.reverseTokenizer);
      this.categoryEncoder = new Map(metadata.categoryEncoder);
      this.categoryDecoder = new Map(metadata.categoryDecoder);
      this.maxSequenceLength = metadata.maxSequenceLength;
      this.vocabSize = metadata.vocabSize;
      
      this.isInitialized = true;
      console.log('Modelo CNN cargado exitosamente');
      return true;
    } catch (error) {
      console.log('No se pudo cargar modelo guardado:', error);
      return false;
    }
  }

  // Agregar nuevos datos de entrenamiento
  addTrainingExample(input: string, output: string, category: string): void {
    this.trainingData.push({ input, output, category });
  }

  // Reentrenar con nuevos datos
  async retrain(): Promise<void> {
    this.isInitialized = false;
    await this.train();
  }

  // Obtener información del modelo
  getModelInfo() {
    return {
      isInitialized: this.isInitialized,
      vocabSize: this.vocabSize,
      maxSequenceLength: this.maxSequenceLength,
      trainingExamples: this.trainingData.length,
      categories: Array.from(this.categoryEncoder.keys()),
      modelSummary: this.model ? 'CNN con embedding + 3 capas conv1d + clasificador denso' : 'No entrenado'
    };
  }

  // Limpiar memoria
  dispose(): void {
    if (this.model) {
      this.model.dispose();
    }
  }
}

// Instancia global del modelo CNN
export const cnnLanguageModel = new CNNLanguageModel();