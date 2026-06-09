import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
  LanguageModel,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export const maxDuration = 60;

// Criar cliente OpenRouter usando compatibilidade com OpenAI API
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  headers: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Crônicas do Destino",
  },
});

const SYSTEM_PROMPT = `Você é um mestre narrador de histórias interativas. Seu papel é criar narrativas envolventes e imersivas baseadas nas escolhas do jogador.

REGRAS IMPORTANTES:
1. Escreva em português brasileiro, com linguagem rica e descritiva
2. Crie atmosfera através de descrições sensoriais (visão, som, cheiro, tato)
3. Mantenha consistência com eventos anteriores da história
4. Cada cena deve ter entre 150-300 palavras
5. Termine SEMPRE com exatamente 3 opções de escolha para o jogador
6. As escolhas devem ter consequências significativas e diferentes
7. Inclua elementos de mistério, tensão ou emoção quando apropriado
8. Personagens secundários devem ter personalidade e motivações próprias

FORMATO DE RESPOSTA:
Escreva a narrativa em prosa, descrevendo a cena de forma vívida.
Após a narrativa, apresente as escolhas e uma breve descrição visual para geração de imagem, exatamente no seguinte formato:

---ESCOLHAS---
1. [Descrição da primeira escolha]
2. [Descrição da segunda escolha]
3. [Descrição da terceira escolha]

---IMAGEM---
[Uma descrição visual curta de 10 a 15 palavras da cena atual EM INGLÊS. Foque no cenário, personagens e atmosfera. Não use termos abstratos, descreva apenas o que é visível.]

GÊNEROS DISPONÍVEIS:
- Fantasia: magia, criaturas místicas, reinos encantados
- Terror: suspense, horror psicológico, sobrenatural
- Ficção Científica: tecnologia avançada, exploração espacial, distopias
- Investigação: mistérios, crimes, detetives
- Romance: relacionamentos, drama emocional, aventuras pessoais

Adapte seu estilo narrativo ao gênero escolhido pelo jogador.`;

export async function POST(req: Request) {
  const { messages, genre }: { messages: UIMessage[]; genre?: string } =
    await req.json();

  const systemMessage = genre
    ? `${SYSTEM_PROMPT}\n\nGÊNERO ATUAL: ${genre}. Adapte toda a narrativa para este gênero específico.`
    : SYSTEM_PROMPT;

  const result = streamText({
    model: openrouter("openai/gpt-4o-mini"),
    system: systemMessage,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
    temperature: 0.8,
    maxOutputTokens: 1500,
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: async ({ isAborted }) => {
      if (isAborted) return;
    },
    consumeSseStream: consumeStream,
  });
}
