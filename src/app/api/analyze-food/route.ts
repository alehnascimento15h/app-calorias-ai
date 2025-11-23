import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { image, mealType } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Imagem não fornecida' },
        { status: 400 }
      );
    }

    // Extrair apenas a parte base64 da imagem
    const base64Data = image.split(',')[1] || image;

    // Chamar OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Você é um nutricionista especializado em análise de alimentos. Analise a imagem fornecida e retorne APENAS um JSON válido com a seguinte estrutura:
{
  "calories": número_inteiro,
  "description": "descrição_detalhada_dos_alimentos",
  "foods": ["alimento1", "alimento2"],
  "portions": "descrição_das_porções"
}

Seja preciso nas calorias estimadas. Se não conseguir identificar claramente, retorne uma estimativa conservadora.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analise esta imagem de ${mealType || 'refeição'} e identifique os alimentos, porções e calcule as calorias totais aproximadas. Retorne apenas o JSON solicitado.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Data}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro da OpenAI:', errorData);
      throw new Error('Erro ao analisar imagem com IA');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Resposta vazia da IA');
    }

    // Tentar extrair JSON da resposta
    let analysisResult;
    try {
      // Remover possíveis markdown code blocks
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', content);
      // Fallback: tentar extrair informações manualmente
      analysisResult = {
        calories: 400,
        description: content,
        foods: ['Alimentos identificados'],
        portions: 'Porção média'
      };
    }

    return NextResponse.json({
      calories: analysisResult.calories || 400,
      description: analysisResult.description || 'Refeição analisada',
      foods: analysisResult.foods || [],
      portions: analysisResult.portions || 'Porção média',
    });

  } catch (error) {
    console.error('Erro ao analisar alimento:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao analisar imagem',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
