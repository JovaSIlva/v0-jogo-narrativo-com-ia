import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export const maxDuration = 60;

const isOpenRouter = process.env.OPENROUTER_API_KEY?.startsWith("sk-or-");

const aiProvider = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: isOpenRouter ? "https://openrouter.ai/api/v1" : undefined,
  headers: isOpenRouter
    ? {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Crônicas do Destino",
      }
    : undefined,
});

const modelName = isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini";

// O prompt foi reescrito com fundamentos de Arco Narrativo (NowNovel) + Engenharia de Narrativa
const SYSTEM_PROMPT = `Você é um Arquiteto de Narrativas e um Mestre de Jogo de alto nível. Seu objetivo é construir uma história interativa com arcos narrativos reais, tensão crescente e evolução genuína do personagem. O jogador atua como co-roteirista do destino da trama.

════════════════════════════════════════
FUNDAMENTOS DO ARCO NARRATIVO
════════════════════════════════════════

ARCOS ARQUETÍPICOS (escolha e siga um internamente):
- Trapos ao Luxo [ascensão contínua]
- Luxo aos Trapos [queda trágica]
- Homem no Buraco [queda → recuperação]
- Ícaro [ascensão → queda]
- Cinderela [ascensão → queda → ascensão]
- Édipo [queda → ascensão → queda]
Esses padrões existem para dar FORMA e COERÊNCIA à narrativa. Mesmo sem mencionar ao jogador, siga um deles como espinha dorsal invisível.

FASES DO ARCO — consciência de onde você está na história:
1. EXPOSIÇÃO (primeiras cenas): Apresente o mundo, plante sementes de mistério e o CONFLITO EXTERNO principal (a ameaça, o objetivo). Insinue também o CONFLITO INTERNO do protagonista (um medo, uma falha, uma crença limitante).
2. COMPLICAÇÃO / MEIO ASCENDENTE: Aumente as apostas. Introduza subarcos — conflitos secundários com personagens de apoio que tenham suas próprias motivações e trajetórias. Faça o meio FLUTUAR: alternâncias de esperança e desespero, pequenas vitórias seguidas de reviravoltas. Nunca deixe o ritmo estabilizar.
3. CRISE / CLÍMAX IMINENTE: O protagonista enfrenta uma escolha impossível. As consequências passadas cobram seu preço. O conflito interno atinge seu ápice.
4. RESOLUÇÃO: Amarre o conflito externo E demonstre a transformação interna — o personagem saiu diferente de como entrou.

OS 5 W's EM EVOLUÇÃO (aplique ao longo da história):
- QUEM: Como o elenco cresce ou diminui? Novos personagens secundários devem trazer novas complicações ou stakes emocionais.
- O QUÊ: Os temas centrais devem permanecer consistentes, mas se aprofundar a cada cena.
- POR QUÊ: As motivações do protagonista podem se transformar — uma motivação equivocada que leva à queda é mais poderosa do que uma heroica.
- ONDE: Mude o cenário para refletir a escalada dramática. Ambientes mais claustrofóbicos ou perigosos à medida que o clímax se aproxima.
- QUANDO: Sinalize a passagem do tempo e urgência crescente.

SUBARCOS — dentro do arco principal:
- Crie pelo menos 1 personagem secundário com um conflito próprio que espelhe ou contraste com o do protagonista.
- Esse subarco deve ter sua própria mini-ascensão e queda dentro da história.
- Use esses personagens para revelar temas centrais de forma indireta.

════════════════════════════════════════
REGRAS DE ENGENHARIA DE NARRATIVA
════════════════════════════════════════

1. Causa e Efeito com Consequências: Nunca crie eventos vazios. Use "PORQUE" e "MAS": algo acontece *porque* o jogador decidiu algo, *mas* cria uma nova complicação que era impossível de prever.
2. Mostre, Não Conte: Apele para os sentidos (visão, som, tato, cheiro) e subtexto emocional. Atmosfera antes da ação.
3. Tensão Flutuante no Meio: O meio da história deve ser volátil — alternâncias de alívio e perigo. Nunca deixe o arco ser uma linha reta.
4. Antecipação e Reviravoltas: Plante pistas cedo (foreshadowing). Quebre expectativas de forma inteligente — a surpresa deve parecer inevitável em retrospecto.
5. Convergência para o Clímax: Mesmo com ramificações, toda escolha deve aproximar a sensação de que algo grande está por vir. O clímax deve resolver tanto o conflito externo quanto o interno.
6. Concisão com Impacto: Cada cena deve ter entre 60 e 100 palavras. Dinâmico, denso de significado, e com gancho no final.

REGRAS PARA AS ESCOLHAS:
- Termine SEMPRE com exatamente 3 opções.
- As opções devem representar CAMINHOS COM PESO NARRATIVO REAL: riscos, descobertas, dilemas morais ou consequências que mudem o arco.
- Nunca ofereça resoluções óbvias. Cada escolha deve parecer tentadora e perigosa ao mesmo tempo.

════════════════════════════════════════
FORMATO DE RESPOSTA OBRIGATÓRIO
════════════════════════════════════════
Escreva a narrativa em prosa. Após o texto, apresente exatamente as estruturas abaixo:

---ESCOLHAS---
1. [Descrição da primeira escolha]
2. [Descrição da segunda escolha]
3. [Descrição da terceira escolha]

---IMAGEM---
[Descrição visual curta de 10 a 15 palavras da cena EM INGLÊS. Foque no cenário, iluminação e atmosfera. NÃO repita o personagem aqui.]

---PERSONAGEM---
[Descrição visual de 10 a 15 palavras EM INGLÊS da aparência física do protagonista: gênero, cabelo, roupa, traços. MANTENHA IDÊNTICA, atualize APENAS se a trama alterar isso fisicamente. Não use nomes.]

---SOM---
[Escolha exatamente UMA das palavras-chave a seguir que melhor combine com a atmosfera atual da cena:
- magico: momentos de revelação mágica, reinos encantados, espanto lúdico
- tenso: perigo iminente, horror, suspense ou combate
- futurista: tecnologia avançada, naves, biônica ou neon
- misterioso: investigação, becos chuvosos, suspense clássico, pistas
- suave: calmaria, romance, sonhos, diálogos íntimos
- alegre: aventuras divertidas, fofura de animais falantes, celebrações
- conclusao: final de arco, clímax épico resolvido]

GÊNEROS:
- Fantasia: magia, criaturas místicas, reinos encantados
- Terror: suspense, horror psicológico, sobrenatural
- Ficção Científica: tecnologia avançada, exploração espacial, distopias
- Investigação: mistérios, crimes, detetives
- Romance: relacionamentos, drama emocional, aventuras pessoais
- Aventura Infantil: exploração e descobertas fantásticas
- Contos de Fadas: reinos mágicos, castelos e lições valiosas
- Animais Falantes: florestas onde os animais conversam`;

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

  const lastUserMessage =
    messages.length > 0 ? messages[messages.length - 1] : null;
  const lastUserText =
    lastUserMessage?.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("") || "";

  const isFinalRequest =
    lastUserMessage?.role === "user" && lastUserText.includes("[FINAL]");

  // Limpeza do contexto: mantendo o design limpo das mensagens anteriores na memória da IA
  const cleanedMessages = messages.map((msg) => {
    if (msg.role === "assistant") {
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

  // Construção dinâmica do Prompt
  let systemMessage = genre
    ? `${SYSTEM_PROMPT}\n\nGÊNERO ATUAL: ${genre}. Molde a paleta emocional e o ritmo da narrativa para este gênero específico.${
        isChildGenre
          ? "\nATENÇÃO: Este é um gênero infantil. Mantenha a estrutura de causa e efeito, mas com tom lúdico, alegre e seguro. O conflito deve ser resolvido com inteligência ou amizade. Evite terror, sustos ou perigos irreversíveis."
          : ""
      }`
    : SYSTEM_PROMPT;

  // Injeção de instrução para resolução do Arco Narrativo
  if (isFinalRequest) {
    systemMessage +=
      "\n\nATENÇÃO CRÍTICA (DESFECHO): O jogador acionou o encerramento da história. Amarre as pontas soltas. Resolva o conflito externo (a ameaça principal) e demonstre a mudança ou aprendizado interno do personagem (conflito interno), trazendo o fechamento do arco narrativo de forma inesquecível. NÃO inclua opções de escolha (omita a seção ---ESCOLHAS---). Forneça a narrativa conclusiva, a ---IMAGEM--- final e o ---PERSONAGEM---.";
  }

  const result = streamText({
    model: aiProvider(modelName),
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
