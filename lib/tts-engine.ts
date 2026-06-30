'use client'

class TextToSpeechEngine {
  private currentAudio: HTMLAudioElement | null = null
  private enabled: boolean = false
  private selectedVoice: string = 'pNInz6obpgDQGcFmaJgB' // Adam (Padrão)
  private browserVoice: SpeechSynthesisVoice | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      const savedEnabled = localStorage.getItem('game_narration_enabled')
      this.enabled = savedEnabled === 'true'

      const savedVoice = localStorage.getItem('game_narration_voice')
      if (savedVoice) {
        this.selectedVoice = savedVoice
      }
      
      // Carregar vozes do navegador tardiamente para fallback
      if ('speechSynthesis' in window) {
        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices()
          // Preferir português do Brasil (pt-BR)
          const ptBRVoice = voices.find(v => v.lang.toLowerCase().includes('pt-br'))
          const ptVoice = voices.find(v => v.lang.toLowerCase().includes('pt'))
          this.browserVoice = ptBRVoice || ptVoice || null
        }
        loadVoices()
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = loadVoices
        }
      }
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled
    if (typeof window !== 'undefined') {
      localStorage.setItem('game_narration_enabled', String(enabled))
      if (!enabled) {
        this.stop()
      }
    }
  }

  public getIsEnabled(): boolean {
    return this.enabled
  }

  public setSelectedVoice(voiceId: string) {
    this.selectedVoice = voiceId
    if (typeof window !== 'undefined') {
      localStorage.setItem('game_narration_voice', voiceId)
      // Se mudar de voz enquanto estiver falando, para a atual
      this.stop()
    }
  }

  public getSelectedVoice(): string {
    return this.selectedVoice
  }

  // Limpa o texto de marcações de blocos do jogo para uma leitura natural
  private cleanTextForSpeech(text: string): string {
    return text
      .replace(/---ESCOLHAS---[\s\S]*/g, '')
      .replace(/---IMAGEM---[\s\S]*/g, '')
      .replace(/---PERSONAGEM---[\s\S]*/g, '')
      .replace(/---SOM---[\s\S]*/g, '')
      .replace(/[*#_`~]/g, '') // Remove caracteres de markdown
      .trim()
  }

  public speak(text: string) {
    if (!this.enabled) return
    this.stop()

    const cleanText = this.cleanTextForSpeech(text)
    if (!cleanText) return

    // Se selecionado fallback nativo do navegador, pula ElevenLabs
    if (this.selectedVoice === 'browser-fallback') {
      this.speakBrowserFallback(cleanText)
      return
    }

    try {
      // Cria a URL de streaming direto usando GET na API local
      const audioUrl = `/api/narrate?text=${encodeURIComponent(cleanText)}&voiceId=${encodeURIComponent(this.selectedVoice)}`
      this.currentAudio = new Audio(audioUrl)
      
      // Fallback automático para o navegador se a rota de API do ElevenLabs falhar (401, 404, etc)
      this.currentAudio.addEventListener('error', () => {
        console.warn('ElevenLabs API stream failed. Switching to local browser speech fallback.')
        this.speakBrowserFallback(cleanText)
      })

      this.currentAudio.play().catch(err => {
        console.warn('Audio auto-play blocked by browser. Retrying with fallback speech.', err)
        this.speakBrowserFallback(cleanText)
      })
    } catch (error) {
      console.error('Error during TTS generation:', error)
      this.speakBrowserFallback(cleanText)
    }
  }

  private speakBrowserFallback(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    try {
      window.speechSynthesis.cancel() // Limpar fila anterior

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'pt-BR'
      
      if (this.browserVoice) {
        utterance.voice = this.browserVoice
      }
      
      utterance.rate = 0.95
      utterance.pitch = 1.0

      window.speechSynthesis.speak(utterance)
    } catch (e) {
      console.error('Browser Speech Synthesis failed:', e)
    }
  }

  public stop() {
    // Parar áudio ElevenLabs
    if (this.currentAudio) {
      try {
        this.currentAudio.pause()
        this.currentAudio.currentTime = 0
        this.currentAudio = null
      } catch {}
    }

    // Parar fala do navegador
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel()
      } catch {}
    }
  }
}

export const ttsEngine = new TextToSpeechEngine()
