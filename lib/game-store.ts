import { UIMessage } from "ai";

export type Genre = "fantasia" | "terror" | "ficcao-cientifica" | "investigacao" | "romance";

export interface GameState {
  genre: Genre | null;
  playerName: string;
  messages: UIMessage[];
  currentScene: number;
  isStarted: boolean;
}

export interface SavedGameData {
  id: string;
  genre: Genre;
  playerName: string;
  messages: UIMessage[];
  updatedAt: number;
}

export const GENRE_INFO: Record<Genre, { name: string; description: string; icon: string; color: string }> = {
  fantasia: {
    name: "Fantasia",
    description: "Reinos encantados, magia ancestral e criaturas míticas aguardam por você",
    icon: "⚔️",
    color: "from-amber-500/20 to-amber-900/20",
  },
  terror: {
    name: "Terror",
    description: "Enfrente seus medos mais profundos em narrativas de suspense e horror",
    icon: "👻",
    color: "from-red-500/20 to-red-900/20",
  },
  "ficcao-cientifica": {
    name: "Ficção Científica",
    description: "Explore galáxias distantes e tecnologias que desafiam a imaginação",
    icon: "🚀",
    color: "from-cyan-500/20 to-cyan-900/20",
  },
  investigacao: {
    name: "Investigação",
    description: "Desvende mistérios complexos e descubra a verdade oculta",
    icon: "🔍",
    color: "from-emerald-500/20 to-emerald-900/20",
  },
  romance: {
    name: "Romance",
    description: "Viva histórias de amor, paixão e conexões profundas",
    icon: "💝",
    color: "from-pink-500/20 to-pink-900/20",
  },
};

export interface ParsedStory {
  narrative: string;
  choices: string[];
  imagePrompt?: string;
}

export function parseChoices(text: string): ParsedStory {
  const choicesSeparator = "---ESCOLHAS---";
  const imageSeparator = "---IMAGEM---";

  let narrative = text;
  let choices: string[] = [];
  let imagePrompt: string | undefined = undefined;

  const choicesIndex = text.indexOf(choicesSeparator);
  const imageIndex = text.indexOf(imageSeparator);

  if (choicesIndex !== -1) {
    narrative = text.substring(0, choicesIndex).trim();

    if (imageIndex > choicesIndex) {
      const choicesPart = text.substring(choicesIndex + choicesSeparator.length, imageIndex).trim();
      const imagePart = text.substring(imageIndex + imageSeparator.length).trim();

      choices = parseChoicesList(choicesPart);
      imagePrompt = imagePart || undefined;
    } else {
      const choicesPart = text.substring(choicesIndex + choicesSeparator.length).trim();
      choices = parseChoicesList(choicesPart);
    }
  } else if (imageIndex !== -1) {
    narrative = text.substring(0, imageIndex).trim();
    imagePrompt = text.substring(imageIndex + imageSeparator.length).trim() || undefined;
  }

  // Se o prompt de imagem contiver instruções residuais de placeholders do modelo, remova-as
  if (imagePrompt) {
    imagePrompt = imagePrompt.replace(/[\[\]]/g, "").trim();
  }

  return { narrative, choices, imagePrompt };
}

function parseChoicesList(choicesText: string): string[] {
  return choicesText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\d+\./.test(line))
    .map((line) => line.replace(/^\d+\.\s*/, ""));
}

export function getInitialPrompt(genre: Genre, playerName: string): string {
  // Array de prompts para cada gênero para variedade
  const promptsByGenre: Record<Genre, string[]> = {
    fantasia: [
      `Inicie uma história de fantasia épica. O protagonista se chama ${playerName}. Comece a narrativa em um momento crucial: talvez ${playerName} acabe de descobrir um poder oculto, ou encontre um artefato misterioso, ou receba uma missão de um ser mágico. Crie uma cena envolvente que estabeleça o tom da aventura.`,

      `Crie uma aventura de fantasia onde ${playerName} desperta em um lugar mágico sem lembrar como chegou lá. Pode ser uma floresta encantada, um castelo antigo, ou um portal aberto. Que mistério cerca este lugar? O que ${playerName} deve fazer primeiro?`,

      `${playerName} é um aprendiz de mago ou guerreiro em um mundo repleto de magia. Comece a história com um evento inesperado: um ataque, uma visão, ou uma chamada para uma grande jornada. Estabeleça o mundo e o perigo iminente.`,

      `Comece uma jornada épica onde ${playerName} descobre ser herdeiro de um trono perdido ou de um antigo poder. A história começa quando alguém ou algo revela essa verdade chocante. Como ${playerName} reage?`,
    ],

    terror: [
      `Inicie uma história de terror psicológico. O protagonista se chama ${playerName}. Comece em um cenário aparentemente comum que rapidamente revela algo perturbador: uma casa antiga com segredos, uma cidade onde as pessoas agem de forma estranha, ou um despertar em um lugar desconhecido. Crie tensão desde o primeiro momento.`,

      `${playerName} chega a um lugar isolado (hotel, cidade fantasma, casa alugada) e começa a notar coisas estranhas. Pessoas desaparecem, sons inexplicáveis, sensação de ser observado. O que está realmente acontecendo aqui?`,

      `Crie um cenário onde ${playerName} descobre estar preso em um ciclo repetido, ou que alguém/algo está observando seus movimentos. A realidade começa a se desintegrar. Intensifique o pânico e a incerteza.`,

      `${playerName} acorda sem lembranças claras em um lugar sinistro. Pessoas próximas agem de forma estranha, como se não fossem completamente humanas. Há algo muito errado. Como escapar?`,
    ],

    "ficcao-cientifica": [
      `Inicie uma história de ficção científica. O protagonista se chama ${playerName}. Comece em um futuro distante ou em uma situação extraordinária: uma nave espacial à deriva, uma colônia em crise, ou a descoberta de uma tecnologia que muda tudo. Estabeleça o cenário futurista com detalhes imersivos.`,

      `${playerName} é um explorador ou soldado no espaço que descobre algo impossível: uma estrutura alienígena, uma anomalia temporal, ou uma civilização perdida. Como isso muda tudo?`,

      `Comece em um futuro onde ${playerName} vive em uma mega-cidade ou colônia espacial. Um evento catastrófico ocorre (falha de sistema, invasão, descoberta) que coloca tudo em risco. Descreva o caos e a oportunidade.`,

      `${playerName} acorda em um corpo clonado ou em uma simulação digital. A memória está fragmentada. Como descobrir a verdade sobre sua existência? Quem está por trás disso?`,
    ],

    investigacao: [
      `Inicie uma história de investigação e mistério. O protagonista se chama ${playerName}, que pode ser um detetive, jornalista ou cidadão comum envolvido em algo maior. Comece com a descoberta de um crime intrigante, um desaparecimento misterioso, ou uma conspiração que começa a se revelar.`,

      `${playerName} recebe um telefonema ou mensagem anônima relatando um crime grave. Escolhe investigar por conta própria ou denunciar. Que evidências perturbadores ${playerName} descobre no início?`,

      `Um amigo próximo de ${playerName} desaparece sob circunstâncias estranhas. A polícia não está investigando adequadamente. ${playerName} decide procurar pistas por conta própria. O que é encontrado primeiro?`,

      `${playerName} encontra acidentalmente um segredo perigoso - um documento, uma conversa ouvida, uma descoberta casual. Agora, pessoas perigosas sabem que ${playerName} sabe. Como proceder?`,
    ],

    romance: [
      `Inicie uma história de romance e drama pessoal. O protagonista se chama ${playerName}. Comece em um momento de mudança: um novo começo em uma cidade diferente, um reencontro inesperado, ou um evento que coloca ${playerName} no caminho de alguém especial. Crie personagens cativantes e emoções autênticas.`,

      `${playerName} chega a uma cidade nova para um novo emprego ou oportunidade. No primeiro dia, conhece alguém que captura sua atenção de forma inesperada. Descreva esse encontro mágico e a química entre eles.`,

      `${playerName} reencontra alguém do passado sob circunstâncias inesperadas. Sentimentos antigos ressurgem. É um reencontro feliz ou complicado? O que acontece quando seus olhos se encontram?`,

      `Comece em uma situação onde ${playerName} está em um conflito emocional: um coração partido, uma decisão difícil de fazer, ou se sentindo perdido. Então, alguém entra em suas vidas. Como isso muda tudo?`,
    ],
  };

  // Seleciona aleatoriamente um prompt do array do gênero
  const genrePrompts = promptsByGenre[genre];
  const randomIndex = Math.floor(Math.random() * genrePrompts.length);
  return genrePrompts[randomIndex];
}
