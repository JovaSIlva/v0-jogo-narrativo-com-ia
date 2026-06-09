import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
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
3. Mantenha consistência absoluta com eventos anteriores da história. Leia atentamente todo o histórico de mensagens para continuar a narrativa de forma fluida a partir da escolha do jogador, sem repetir fatos e progredindo na trama de forma lógica.
4. Cada cena deve ser curta, contendo obrigatoriamente entre 60 e 100 palavras. Seja conciso, dinâmico e direto.
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
- Aventura Infantil: aventuras divertidas e lúdicas sobre amizade, exploração e descobertas fantásticas
- Contos de Fadas: reinos mágicos, criaturas gentis, castelos coloridos e lições valiosas
- Animais Falantes: histórias mágicas em florestas onde os animais conversam e se ajudam

Adapte seu estilo narrativo ao gênero escolhido pelo jogador.`;

function cleanAssistantMessage(content: string): string {
  const choicesSeparator = "---ESCOLHAS---";
  const imageSeparator = "---IMAGEM---";
  let narrative = content;

  const choicesIndex = content.indexOf(choicesSeparator);
  const imageIndex = content.indexOf(imageSeparator);

  if (choicesIndex !== -1) {
    narrative = content.substring(0, choicesIndex).trim();
  } else if (imageIndex !== -1) {
    narrative = content.substring(0, imageIndex).trim();
  }
  return narrative;
}

export async function POST(req: Request) {
  const { messages, genre }: { messages: UIMessage[]; genre?: string } =
    await req.json();

  // Limpar as mensagens antigas do assistente para manter apenas a narrativa no histórico
  const cleanedMessages = messages.map((msg) => {
    if (msg.role === "assistant") {
      // Limpar parts se existirem
      const cleanParts = msg.parts?.map((part) => {
        if (part.type === "text") {
          return { ...part, text: cleanAssistantMessage(part.text) };
        }
        return part;
      });

      return {
        ...msg,
        parts: cleanParts || [],
      };
    }
    return msg;
  });

  const isChildGenre =
    genre === "infantil-aventura" ||
    genre === "contos-fadas" ||
    genre === "animais-falantes";

  const systemMessage = genre
    ? `${SYSTEM_PROMPT}\n\nGÊNERO ATUAL: ${genre}. Adapte toda a narrativa para este gênero específico.${
        isChildGenre
          ? "\nATENÇÃO: Como este é um gênero infantil, use obrigatoriamente um tom alegre, leve, lúdico e seguro, com vocabulário simples e adequado para crianças de 6 a 10 anos. Evite qualquer tipo de violência, horror, desfechos tristes, situações perigosas extremas ou sustos."
          : ""
      }`
    : SYSTEM_PROMPT;

  const result = streamText({
    model: openrouter("openai/gpt-4o-mini"),
    system: systemMessage,
    messages: await convertToModelMessages(cleanedMessages),
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
