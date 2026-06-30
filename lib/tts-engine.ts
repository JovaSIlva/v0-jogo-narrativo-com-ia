'use client'

class TextToSpeechEngine {
  private currentAudio: HTMLAudioElement | null = null
  private enabled: boolean = false
  private browserVoice: SpeechSynthesisVoice | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('game_narration_enabled')
      this.enabled = saved === 'true'
      
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

  public async speak(text: string) {
    if (!this.enabled) return
    this.stop()

    const cleanText = this.cleanTextForSpeech(text)
    if (!cleanText) return

    try {
      // Tentar ElevenLabs via API Route local
      const res = await fetch('/api/narrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: cleanText })
      })

      if (res.ok) {
        const audioBlob = await res.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        this.currentAudio = new Audio(audioUrl)
        
        this.currentAudio.play().catch(err => {
          console.warn('Audio auto-play blocked by browser. Retrying on user interaction.', err)
        })
        return
      }
      
      // Se a API retornar erro de configuração (401) ou outro erro, ir para fallback
      console.warn('ElevenLabs API unavailable or failed. Using local browser speech fallback.')
      this.speakBrowserFallback(cleanText)
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
      
      // Velocidade levemente mais lenta para soar dramático / imersivo
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
