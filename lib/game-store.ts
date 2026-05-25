import { UIMessage } from 'ai'

export type Genre = 'fantasia' | 'terror' | 'ficcao-cientifica' | 'investigacao' | 'romance'

export interface GameState {
  genre: Genre | null
  playerName: string
  messages: UIMessage[]
  currentScene: number
  isStarted: boolean
}

export const GENRE_INFO: Record<Genre, { name: string; description: string; icon: string; color: string }> = {
  fantasia: {
    name: 'Fantasia',
    description: 'Reinos encantados, magia ancestral e criaturas míticas aguardam por você',
    icon: '⚔️',
    color: 'from-amber-500/20 to-amber-900/20',
  },
  terror: {
    name: 'Terror',
    description: 'Enfrente seus medos mais profundos em narrativas de suspense e horror',
    icon: '👻',
    color: 'from-red-500/20 to-red-900/20',
  },
  'ficcao-cientifica': {
    name: 'Ficção Científica',
    description: 'Explore galáxias distantes e tecnologias que desafiam a imaginação',
    icon: '🚀',
    color: 'from-cyan-500/20 to-cyan-900/20',
  },
  investigacao: {
    name: 'Investigação',
    description: 'Desvende mistérios complexos e descubra a verdade oculta',
    icon: '🔍',
    color: 'from-emerald-500/20 to-emerald-900/20',
  },
  romance: {
    name: 'Romance',
    description: 'Viva histórias de amor, paixão e conexões profundas',
    icon: '💝',
    color: 'from-pink-500/20 to-pink-900/20',
  },
}

export function parseChoices(text: string): { narrative: string; choices: string[] } {
  const separator = '---ESCOLHAS---'
  const parts = text.split(separator)
  
  if (parts.length < 2) {
    return { narrative: text, choices: [] }
  }
  
  const narrative = parts[0].trim()
  const choicesText = parts[1].trim()
  
  const choices = choicesText
    .split('\n')
    .map(line => line.trim())
    .filter(line => /^\d+\./.test(line))
    .map(line => line.replace(/^\d+\.\s*/, ''))
  
  return { narrative, choices }
}

export function getInitialPrompt(genre: Genre, playerName: string): string {
  const prompts: Record<Genre, string> = {
    fantasia: `Inicie uma história de fantasia épica. O protagonista se chama ${playerName}. Comece a narrativa em um momento crucial: talvez ${playerName} acabe de descobrir um poder oculto, ou encontre um artefato misterioso, ou receba uma missão de um ser mágico. Crie uma cena envolvente que estabeleça o tom da aventura.`,
    
    terror: `Inicie uma história de terror psicológico. O protagonista se chama ${playerName}. Comece em um cenário aparentemente comum que rapidamente revela algo perturbador: uma casa antiga com segredos, uma cidade onde as pessoas agem de forma estranha, ou um despertar em um lugar desconhecido. Crie tensão desde o primeiro momento.`,
    
    'ficcao-cientifica': `Inicie uma história de ficção científica. O protagonista se chama ${playerName}. Comece em um futuro distante ou em uma situação extraordinária: uma nave espacial à deriva, uma colônia em crise, ou a descoberta de uma tecnologia que muda tudo. Estabeleça o cenário futurista com detalhes imersivos.`,
    
    investigacao: `Inicie uma história de investigação e mistério. O protagonista se chama ${playerName}, que pode ser um detetive, jornalista ou cidadão comum envolvido em algo maior. Comece com a descoberta de um crime intrigante, um desaparecimento misterioso, ou uma conspiração que começa a se revelar.`,
    
    romance: `Inicie uma história de romance e drama pessoal. O protagonista se chama ${playerName}. Comece em um momento de mudança: um novo começo em uma cidade diferente, um reencontro inesperado, ou um evento que coloca ${playerName} no caminho de alguém especial. Crie personagens cativantes e emoções autênticas.`,
  }
  
  return prompts[genre]
}
