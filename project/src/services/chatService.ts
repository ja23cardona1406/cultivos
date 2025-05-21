// This service will handle API calls to OpenAI or HuggingFace

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const sendChatMessage = async (messages: ChatMessage[]): Promise<string> => {
  try {
    // Replace with your actual LLM API endpoint (OpenAI or HuggingFace)
    const apiUrl = 'https://your-llm-api.com/chat';
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    
    if (!apiKey) {
      throw new Error('Missing OpenAI API key');
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages,
        // Add any additional parameters required by your LLM provider
      }),
    });

    if (!response.ok) {
      throw new Error('Chat API request failed');
    }

    const data = await response.json();
    return data.message || data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('Error sending chat message:', error);
    
    // For development purposes, return mock response
    // Remove this in production
    return "Soy el asistente de AgroDiversificación. En base a tus parámetros, la papaya podría cultivarse bien con un pH de 6.3 y una temperatura de 21°C. La papaya prefiere suelos ligeramente ácidos (pH 5.5-6.5) y temperaturas entre 20-30°C. Asegúrate de mantener una buena irrigación y considerar la protección contra heladas ocasionales.";
  }
};