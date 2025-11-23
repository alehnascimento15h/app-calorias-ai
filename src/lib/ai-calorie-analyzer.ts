import OpenAI from 'openai';

// Tipos para análise de calorias
export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: string;
}

export interface CalorieAnalysisResult {
  totalCalories: number;
  foods: FoodItem[];
  suggestions: string[];
  healthScore: number;
}

// Função para analisar imagem de refeição usando OpenAI Vision
export async function analyzeCaloriesFromImage(
  imageBase64: string
): Promise<CalorieAnalysisResult> {
  try {
    // Verifica se a API key está configurada
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('API Key do OpenAI não configurada');
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Necessário para uso no cliente
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um nutricionista especializado em análise de calorias. 
          Analise a imagem da refeição e retorne um JSON com:
          - totalCalories: total de calorias estimadas
          - foods: array de objetos com {name, calories, protein, carbs, fat, portion}
          - suggestions: array de sugestões para tornar a refeição mais saudável
          - healthScore: pontuação de 0-100 sobre quão saudável é a refeição
          
          Seja preciso nas estimativas e considere porções visuais.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analise esta refeição e forneça informações nutricionais detalhadas em formato JSON.'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64
              }
            }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      totalCalories: result.totalCalories || 0,
      foods: result.foods || [],
      suggestions: result.suggestions || [],
      healthScore: result.healthScore || 50
    };
  } catch (error) {
    console.error('Erro ao analisar imagem:', error);
    throw error;
  }
}

// Função auxiliar para converter File para base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
