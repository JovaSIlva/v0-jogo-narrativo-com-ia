'use client'

class AudioEngine {
  private ctx: AudioContext | null = null
  private ambientNode: BiquadFilterNode | null = null
  private ambientOscillators: OscillatorNode[] = []
  private ambientGain: GainNode | null = null
  private noiseNode: AudioWorkletNode | ScriptProcessorNode | null = null
  private currentAmbience: string = ''
  private isMuted: boolean = true
  private masterGain: GainNode | null = null

  constructor() {
    // Inicialização tardia para respeitar a interação do usuário
  }

  private init() {
    if (this.ctx) return
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return

    this.ctx = new AudioContextClass()
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime)
    this.masterGain.connect(this.ctx.destination)
  }

  public setMute(muted: boolean) {
    this.isMuted = muted
    this.init()

    if (this.ctx && this.masterGain) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume()
      }
      this.masterGain.gain.linearRampToValueAtTime(
        muted ? 0 : 0.4,
        this.ctx.currentTime + 0.3
      )
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted
  }

  // Toca um efeito sonoro rápido sintetizado
  public playSFX(type: 'click' | 'page' | 'success' | 'danger') {
    this.init()
    if (!this.ctx || this.isMuted || this.ctx.state === 'suspended') return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.connect(gain)
    gain.connect(this.masterGain!)

    if (type === 'click') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(600, now)
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.1)
      gain.gain.setValueAtTime(0.15, now)
      gain.gain.linearRampToValueAtTime(0, now + 0.1)
      osc.start(now)
      osc.stop(now + 0.1)
    } else if (type === 'page') {
      // Efeito de passar página de livro (ruído suave de papel)
      const bufferSize = this.ctx.sampleRate * 0.3
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(800, now)
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.3)
      filter.Q.setValueAtTime(2, now)

      const noiseGain = this.ctx.createGain()
      noiseGain.gain.setValueAtTime(0.08, now)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

      noise.connect(filter)
      filter.connect(noiseGain)
      noiseGain.connect(this.masterGain!)

      noise.start(now)
      noise.stop(now + 0.3)
    } else if (type === 'success') {
      // Acorde triunfante leve
      const freqs = [329.63, 392.00, 523.25, 659.25] // E4, G4, C5, E5
      freqs.forEach((f, i) => {
        const o = this.ctx!.createOscillator()
        const g = this.ctx!.createGain()
        o.type = 'sine'
        o.frequency.setValueAtTime(f, now + i * 0.05)
        g.gain.setValueAtTime(0.06, now + i * 0.05)
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.5)
        o.connect(g)
        g.connect(this.masterGain!)
        o.start(now + i * 0.05)
        o.stop(now + i * 0.05 + 0.5)
      })
    } else if (type === 'danger') {
      // Impacto de suspense tenso
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(90, now)
      osc.frequency.linearRampToValueAtTime(45, now + 0.4)
      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
      
      const subOsc = this.ctx.createOscillator()
      const subGain = this.ctx.createGain()
      subOsc.type = 'sine'
      subOsc.frequency.setValueAtTime(55, now) // A1
      subGain.gain.setValueAtTime(0.3, now)
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
      
      subOsc.connect(subGain)
      subGain.connect(this.masterGain!)
      
      subOsc.start(now)
      subOsc.stop(now + 0.4)
      osc.start(now)
      osc.stop(now + 0.4)
    }
  }

  // Define e sintetiza loops de áudio ambiente baseados no gênero / clima
  public setAmbience(type: 'fantasia' | 'terror' | 'ficcao-cientifica' | 'investigacao' | 'romance' | 'infantil' | '') {
    this.init()
    if (!this.ctx || this.currentAmbience === type) return
    this.currentAmbience = type
    
    // Parar osciladores anteriores suavemente
    const fadeOutTime = this.ctx.currentTime + 0.8
    this.ambientOscillators.forEach(osc => {
      try {
        osc.stop(fadeOutTime)
      } catch {}
    })
    this.ambientOscillators = []

    if (this.ambientGain) {
      this.ambientGain.gain.linearRampToValueAtTime(0, fadeOutTime)
    }

    if (this.noiseNode) {
      try {
        this.noiseNode.disconnect()
      } catch {}
      this.noiseNode = null
    }

    if (!type) return

    // Criar novo ganho para este ambiente
    const now = this.ctx.currentTime
    const newGain = this.ctx.createGain()
    newGain.gain.setValueAtTime(0, now)
    newGain.gain.linearRampToValueAtTime(0.2, now + 1.5) // Fade-in suave de 1.5s
    newGain.connect(this.masterGain!)
    this.ambientGain = newGain

    if (type === 'fantasia') {
      // Sintetiza acordes de Pad Mágico suaves (Sinos / Fundo Etéreo)
      const notes = [146.83, 220.00, 293.66, 440.00] // D3, A3, D4, A4
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator()
        const lfo = this.ctx!.createOscillator()
        const lfoGain = this.ctx!.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now)

        // LFO para dar flutuação de pitch (efeito vibrato mágico)
        lfo.frequency.setValueAtTime(0.2 + idx * 0.05, now)
        lfoGain.gain.setValueAtTime(1.5, now)
        
        lfo.connect(lfoGain)
        lfoGain.connect(osc.frequency)
        
        osc.connect(newGain)
        lfo.start(now)
        osc.start(now)

        this.ambientOscillators.push(osc, lfo)
      })
    } else if (type === 'terror') {
      // Vento sombrio e acordes dissonantes de tensão
      const notes = [55.00, 77.78, 110.00, 155.56] // A1, Eb2 (Trítono tenso), A2, Eb3
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator()
        const filter = this.ctx!.createBiquadFilter()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(freq, now)

        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(120, now)
        filter.Q.setValueAtTime(1, now)

        // Filtro modulador para simular zumbido tenso
        const lfo = this.ctx!.createOscillator()
        const lfoGain = this.ctx!.createGain()
        lfo.frequency.setValueAtTime(0.1 + idx * 0.02, now)
        lfoGain.gain.setValueAtTime(20, now)
        lfo.connect(lfoGain)
        lfoGain.connect(filter.frequency)

        osc.connect(filter)
        filter.connect(newGain)
        
        lfo.start(now)
        osc.start(now)
        this.ambientOscillators.push(osc, lfo)
      })

      // Gerador de ruído branco para simular o vento uivando
      const bufferSize = this.ctx.sampleRate * 2
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
      
      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer
      noise.loop = true
      
      const windFilter = this.ctx.createBiquadFilter()
      windFilter.type = 'bandpass'
      windFilter.frequency.setValueAtTime(300, now)
      windFilter.Q.setValueAtTime(4, now)
      
      // Modula a frequência do vento para uivar
      const windLfo = this.ctx.createOscillator()
      const windLfoGain = this.ctx.createGain()
      windLfo.frequency.setValueAtTime(0.08, now)
      windLfoGain.gain.setValueAtTime(150, now)
      
      windLfo.connect(windLfoGain)
      windLfoGain.connect(windFilter.frequency)
      
      noise.connect(windFilter)
      windFilter.connect(newGain)
      
      windLfo.start(now)
      noise.start(now)
      this.ambientOscillators.push(windLfo, noise as any)
    } else if (type === 'ficcao-cientifica') {
      // Zumbido profundo de gerador de nave com pulsos futuristas
      const baseFreq = 60 // 60Hz zumbido de eletricidade / nave
      const osc = this.ctx.createOscillator()
      const filter = this.ctx.createBiquadFilter()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(baseFreq, now)
      
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(110, now)
      
      // LFO modula o filtro para criar pulso ritmado
      const pulseLfo = this.ctx.createOscillator()
      const pulseGain = this.ctx.createGain()
      pulseLfo.frequency.setValueAtTime(0.3, now)
      pulseGain.gain.setValueAtTime(15, now)
      
      pulseLfo.connect(pulseGain)
      pulseGain.connect(filter.frequency)
      
      osc.connect(filter)
      filter.connect(newGain)
      
      pulseLfo.start(now)
      osc.start(now)
      this.ambientOscillators.push(osc, pulseLfo)

      // Computador de fundo: pequenos bips esporádicos
      const playBeep = () => {
        if (this.currentAmbience !== 'ficcao-cientifica' || this.isMuted) return
        const time = this.ctx!.currentTime
        const beepOsc = this.ctx!.createOscillator()
        const beepGain = this.ctx!.createGain()
        
        beepOsc.type = 'sine'
        beepOsc.frequency.setValueAtTime(2000 + Math.random() * 1500, time)
        beepGain.gain.setValueAtTime(0.008, time)
        beepGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08)
        
        beepOsc.connect(beepGain)
        beepGain.connect(this.masterGain!)
        
        beepOsc.start(time)
        beepOsc.stop(time + 0.08)
        
        setTimeout(playBeep, 2000 + Math.random() * 4000)
      }
      playBeep()
    } else if (type === 'investigacao') {
      // Efeito de chuva de fundo + tom solitário de piano lento (Jazz Noir)
      // Ruído de chuva
      const bufferSize = this.ctx.sampleRate * 2
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
      
      const rain = this.ctx.createBufferSource()
      rain.buffer = buffer
      rain.loop = true
      
      const rainFilter = this.ctx.createBiquadFilter()
      rainFilter.type = 'lowpass'
      rainFilter.frequency.setValueAtTime(800, now)
      
      rain.connect(rainFilter)
      rainFilter.connect(newGain)
      rain.start(now)
      this.ambientOscillators.push(rain as any)

      // Piano de mistério esporádico lento
      const noirMelody = [196.00, 220.00, 233.08, 261.63, 293.66] // G3, A3, Bb3, C4, D4
      const playNoirNode = () => {
        if (this.currentAmbience !== 'investigacao' || this.isMuted) return
        const time = this.ctx!.currentTime
        const note = noirMelody[Math.floor(Math.random() * noirMelody.length)]
        const pOsc = this.ctx!.createOscillator()
        const pGain = this.ctx!.createGain()
        
        pOsc.type = 'triangle'
        pOsc.frequency.setValueAtTime(note, time)
        pGain.gain.setValueAtTime(0.05, time)
        pGain.gain.exponentialRampToValueAtTime(0.0001, time + 1.2)
        
        pOsc.connect(pGain)
        pGain.connect(this.masterGain!)
        
        pOsc.start(time)
        pOsc.stop(time + 1.2)
        
        setTimeout(playNoirNode, 3000 + Math.random() * 5000)
      }
      playNoirNode()
    } else if (type === 'romance') {
      // Pad maior suave, quente e acolhedor (Sonho)
      const notes = [130.81, 164.81, 196.00, 261.63] // C3, E3, G3, C4 (Acorde Maior de C)
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator()
        const lfo = this.ctx!.createOscillator()
        const lfoGain = this.ctx!.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now)

        lfo.frequency.setValueAtTime(0.1 + idx * 0.03, now)
        lfoGain.gain.setValueAtTime(1.0, now)
        
        lfo.connect(lfoGain)
        lfoGain.connect(osc.frequency)
        
        osc.connect(newGain)
        lfo.start(now)
        osc.start(now)

        this.ambientOscillators.push(osc, lfo)
      })
    } else if (type === 'infantil') {
      // Sintetizador de melodia inocente, suave e flutuante
      const happyNotes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00] // C4 - A4
      const playToyMelody = () => {
        if (this.currentAmbience !== 'infantil' || this.isMuted) return
        const time = this.ctx!.currentTime
        const note = happyNotes[Math.floor(Math.random() * happyNotes.length)]
        const oscNode = this.ctx!.createOscillator()
        const gainNode = this.ctx!.createGain()

        oscNode.type = 'sine'
        oscNode.frequency.setValueAtTime(note, time)
        
        // Efeito vibrato infantil tipo caixinha de música
        const vib = this.ctx!.createOscillator()
        const vibG = this.ctx!.createGain()
        vib.frequency.setValueAtTime(6, time) // 6Hz
        vibG.gain.setValueAtTime(4, time)
        vib.connect(vibG)
        vibG.connect(oscNode.frequency)

        gainNode.gain.setValueAtTime(0.04, time)
        gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.8)

        oscNode.connect(gainNode)
        gainNode.connect(this.masterGain!)

        vib.start(time)
        oscNode.start(time)
        vib.stop(time + 0.8)
        oscNode.stop(time + 0.8)

        setTimeout(playToyMelody, 1500 + Math.random() * 3000)
      }
      playToyMelody()
    }
  }
}

export const gameAudio = new AudioEngine()
