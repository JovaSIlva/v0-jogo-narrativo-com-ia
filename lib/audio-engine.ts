'use client'

class AudioEngine {
  private ctx: AudioContext | null = null
  private ambientGain: GainNode | null = null
  private currentAmbience: string = ''
  private isMuted: boolean = true
  private masterGain: GainNode | null = null
  
  // Rastreamento de nós ativos e agendadores para limpeza total
  private activeNodes: (OscillatorNode | AudioBufferSourceNode | BiquadFilterNode | GainNode)[] = []
  private activeTimeouts: any[] = []
  private chordIndex = 0

  constructor() {
    // Inicialização tardia para interações do usuário
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

  // Limpa todos os agendamentos e nós ativos
  private clearActiveTracks() {
    this.activeTimeouts.forEach(t => clearTimeout(t))
    this.activeTimeouts = []

    const fadeOutTime = this.ctx ? this.ctx.currentTime + 0.8 : 0
    this.activeNodes.forEach(node => {
      try {
        if ('stop' in node) {
          (node as any).stop(fadeOutTime)
        }
      } catch {}
    })
    this.activeNodes = []
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
      gain.gain.setValueAtTime(0.12, now)
      gain.gain.linearRampToValueAtTime(0, now + 0.1)
      osc.start(now)
      osc.stop(now + 0.1)
    } else if (type === 'page') {
      // Efeito de passar página de livro (ruído suave de papel)
      const bufferSize = this.ctx.sampleRate * 0.35
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(900, now)
      filter.frequency.exponentialRampToValueAtTime(250, now + 0.35)
      filter.Q.setValueAtTime(1.5, now)

      const noiseGain = this.ctx.createGain()
      noiseGain.gain.setValueAtTime(0.06, now)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

      noise.connect(filter)
      filter.connect(noiseGain)
      noiseGain.connect(this.masterGain!)

      noise.start(now)
      noise.stop(now + 0.35)
    } else if (type === 'success') {
      // Acorde triunfante harmonioso de harpa de fantasia
      const freqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99] // C4, E4, G4, C5, E5, G5
      freqs.forEach((f, i) => {
        const o = this.ctx!.createOscillator()
        const g = this.ctx!.createGain()
        o.type = 'sine'
        o.frequency.setValueAtTime(f, now + i * 0.06)
        g.gain.setValueAtTime(0.05, now + i * 0.06)
        g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.8)
        o.connect(g)
        g.connect(this.masterGain!)
        o.start(now + i * 0.06)
        o.stop(now + i * 0.06 + 0.8)
      })
    } else if (type === 'danger') {
      // Impacto de suspense orquestral
      const root = 55 // A1 grave
      const o1 = this.ctx.createOscillator()
      const o2 = this.ctx.createOscillator()
      const o3 = this.ctx.createOscillator()
      const g = this.ctx.createGain()

      o1.type = 'sawtooth'
      o1.frequency.setValueAtTime(root, now)
      o1.frequency.linearRampToValueAtTime(root - 2, now + 0.6)

      o2.type = 'sawtooth'
      o2.frequency.setValueAtTime(root * 1.5, now) // Quinta justa

      o3.type = 'triangle'
      o3.frequency.setValueAtTime(root * 1.88, now) // Segunda menor tenso (Eb)

      g.gain.setValueAtTime(0.2, now)
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.6)

      const lowpass = this.ctx.createBiquadFilter()
      lowpass.type = 'lowpass'
      lowpass.frequency.setValueAtTime(250, now)
      lowpass.frequency.exponentialRampToValueAtTime(80, now + 0.6)

      o1.connect(lowpass)
      o2.connect(lowpass)
      o3.connect(lowpass)
      lowpass.connect(g)
      g.connect(this.masterGain!)

      o1.start(now)
      o2.start(now)
      o3.start(now)
      o1.stop(now + 0.6)
      o2.stop(now + 0.6)
      o3.stop(now + 0.6)
    }
  }

  // Configura a atmosfera musical do jogo (Sequenciadores Procedurais Dinâmicos)
  public setAmbience(type: 'fantasia' | 'terror' | 'ficcao-cientifica' | 'investigacao' | 'romance' | 'infantil' | '') {
    this.init()
    if (!this.ctx || this.currentAmbience === type) return
    this.currentAmbience = type
    
    // Suave transição e cancelamento anterior
    const now = this.ctx.currentTime
    const fadeOutTime = now + 1.0

    if (this.ambientGain) {
      this.ambientGain.gain.linearRampToValueAtTime(0, fadeOutTime)
    }

    this.clearActiveTracks()

    if (!type) return

    // Criar ganho mestre da atmosfera atual
    const newGain = this.ctx.createGain()
    newGain.gain.setValueAtTime(0, now)
    newGain.gain.linearRampToValueAtTime(0.25, now + 2.0) // Fade-in suave de 2s
    newGain.connect(this.masterGain!)
    this.ambientGain = newGain
    this.chordIndex = 0

    // ==============================================================
    // FANTASIA: Progressão de acordes + sinos mágicos esporádicos
    // ==============================================================
    if (type === 'fantasia') {
      const chords = [
        [146.83, 185.00, 220.00, 277.18], // Dmaj7 (D3, F#3, A3, C#4)
        [164.81, 196.00, 246.94, 293.66], // Em7 (E3, G3, B3, D4)
        [130.81, 164.81, 196.00, 246.94], // Cmaj7 (C3, E3, G3, B3)
        [110.00, 130.81, 164.81, 220.00], // Am7 (A2, C3, E3, A3)
      ]

      const playChord = () => {
        if (this.currentAmbience !== 'fantasia' || this.isMuted) return
        const time = this.ctx!.currentTime
        const chord = chords[this.chordIndex]
        
        // Ativar osciladores para o acorde atual
        const currentChordOscs: OscillatorNode[] = []
        const chordGain = this.ctx!.createGain()
        chordGain.gain.setValueAtTime(0, time)
        chordGain.gain.linearRampToValueAtTime(0.08, time + 2.0) // Soft attack
        chordGain.gain.setValueAtTime(0.08, time + 6.0)
        chordGain.gain.linearRampToValueAtTime(0, time + 8.0) // Soft decay
        chordGain.connect(newGain)

        chord.forEach((freq, i) => {
          const osc = this.ctx!.createOscillator()
          // Filtro passa-baixa para suavizar o timbre dos pads
          const filter = this.ctx!.createBiquadFilter()
          filter.type = 'lowpass'
          filter.frequency.setValueAtTime(500 + Math.sin(time) * 100, time)

          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq, time)
          
          // Efeito vibrato suave
          const lfo = this.ctx!.createOscillator()
          const lfoG = this.ctx!.createGain()
          lfo.frequency.setValueAtTime(0.25 + i * 0.05, time)
          lfoG.gain.setValueAtTime(1.0, time)
          lfo.connect(lfoG)
          lfoG.connect(osc.frequency)

          osc.connect(filter)
          filter.connect(chordGain)

          lfo.start(time)
          osc.start(time)
          lfo.stop(time + 8.0)
          osc.stop(time + 8.0)
          
          this.activeNodes.push(osc, lfo)
        })

        // Próximo acorde do loop
        this.chordIndex = (this.chordIndex + 1) % chords.length
        this.activeTimeouts.push(setTimeout(playChord, 7600))
      }
      playChord()

      // Arpejo de sinos mágicos brilhantes em background (brilho estelar)
      const playBells = () => {
        if (this.currentAmbience !== 'fantasia' || this.isMuted) return
        const time = this.ctx!.currentTime
        
        const bellNotes = [587.33, 659.25, 783.99, 880.00, 1046.50] // D5, E5, G5, A5, C6
        const note = bellNotes[Math.floor(Math.random() * bellNotes.length)]
        
        const osc = this.ctx!.createOscillator()
        const g = this.ctx!.createGain()
        const filter = this.ctx!.createBiquadFilter()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(note, time)

        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(note, time)
        filter.Q.setValueAtTime(1, time)

        g.gain.setValueAtTime(0.0001, time)
        g.gain.linearRampToValueAtTime(0.03, time + 0.1) // Quick sparkle attack
        g.gain.exponentialRampToValueAtTime(0.0001, time + 2.5) // Reverb-like tail

        osc.connect(filter)
        filter.connect(g)
        g.connect(newGain)

        osc.start(time)
        osc.stop(time + 2.5)
        this.activeNodes.push(osc)

        this.activeTimeouts.push(setTimeout(playBells, 2000 + Math.random() * 4000))
      }
      playBells()

    // ==============================================================
    // TERROR: Batimento cardíaco + drones uivantes e sustos dissonantes
    // ==============================================================
    } else if (type === 'terror') {
      // Drone contínuo e grave
      const playDrone = () => {
        if (this.currentAmbience !== 'terror') return
        const time = this.ctx!.currentTime
        const osc = this.ctx!.createOscillator()
        const filter = this.ctx!.createBiquadFilter()
        const g = this.ctx!.createGain()

        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(48.99, time) // G1 super grave

        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(90, time)
        
        // Filtro uivante
        const lfo = this.ctx!.createOscillator()
        const lfoG = this.ctx!.createGain()
        lfo.frequency.setValueAtTime(0.07, time)
        lfoG.gain.setValueAtTime(25, time)
        lfo.connect(lfoG)
        lfoG.connect(filter.frequency)

        g.gain.setValueAtTime(0.12, time)

        osc.connect(filter)
        filter.connect(g)
        g.connect(newGain)

        lfo.start(time)
        osc.start(time)
        this.activeNodes.push(osc, lfo)
      }
      playDrone()

      // Batida Cardíaca procedural (Tum-tum ... Tum-tum)
      const playHeartbeat = () => {
        if (this.currentAmbience !== 'terror' || this.isMuted) return
        const time = this.ctx!.currentTime

        const beat = (delay: number) => {
          const osc = this.ctx!.createOscillator()
          const g = this.ctx!.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(65, time + delay) // Frequência do peito
          osc.frequency.exponentialRampToValueAtTime(30, time + delay + 0.15)
          
          g.gain.setValueAtTime(0.25, time + delay)
          g.gain.linearRampToValueAtTime(0, time + delay + 0.18)

          osc.connect(g)
          g.connect(newGain)
          osc.start(time + delay)
          osc.stop(time + delay + 0.18)
          this.activeNodes.push(osc)
        }

        beat(0)      // Primeiro batimento
        beat(0.25)   // Segundo batimento do par

        this.activeTimeouts.push(setTimeout(playHeartbeat, 1400)) // Ritmo calmo, porém tenso
      }
      playHeartbeat()

      // Gritos agudos esporádicos em segundo plano (Susto)
      const playEerieScreeches = () => {
        if (this.currentAmbience !== 'terror' || this.isMuted) return
        const time = this.ctx!.currentTime

        const osc = this.ctx!.createOscillator()
        const g = this.ctx!.createGain()
        const filter = this.ctx!.createBiquadFilter()

        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(1200 + Math.random() * 500, time)
        osc.frequency.linearRampToValueAtTime(600, time + 1.5) // Pitch slip para baixo

        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(1000, time)
        filter.Q.setValueAtTime(3, time)

        g.gain.setValueAtTime(0, time)
        g.gain.linearRampToValueAtTime(0.015, time + 0.2) // Slow scare swell
        g.gain.exponentialRampToValueAtTime(0.0001, time + 1.8)

        osc.connect(filter)
        filter.connect(g)
        g.connect(newGain)

        osc.start(time)
        osc.stop(time + 1.8)
        this.activeNodes.push(osc)

        this.activeTimeouts.push(setTimeout(playEerieScreeches, 8000 + Math.random() * 12000))
      }
      playEerieScreeches()

    // ==============================================================
    // FICÇÃO CIENTÍFICA: Arpejos procedurais de sintetizador + LFO
    // ==============================================================
    } else if (type === 'ficcao-cientifica') {
      const sciFiScale = [130.81, 146.83, 155.56, 196.00, 220.00, 261.63, 293.66, 311.13, 392.00] // Escala menor (C3 a G4)
      let step = 0

      // Sequenciador rítmico de sintetizador analógico
      const playArpeggiator = () => {
        if (this.currentAmbience !== 'ficcao-cientifica' || this.isMuted) return
        const time = this.ctx!.currentTime

        // Escolha algorítmica de notas baseada em passos
        const noteIndex = (Math.floor(time * 4) % 3 === 0) 
          ? (step % sciFiScale.length) 
          : Math.floor(Math.random() * sciFiScale.length)
        
        const note = sciFiScale[noteIndex]
        
        const osc = this.ctx!.createOscillator()
        const g = this.ctx!.createGain()
        const filter = this.ctx!.createBiquadFilter()

        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(note, time)

        // Filtro que abre e fecha dinamicamente em ondas longas
        filter.type = 'lowpass'
        const filterLfo = Math.sin(time * 0.1) * 300 + 450 // Onda lenta de 0.1Hz
        filter.frequency.setValueAtTime(filterLfo, time)
        filter.Q.setValueAtTime(3, time)

        g.gain.setValueAtTime(0.025, time)
        g.gain.exponentialRampToValueAtTime(0.0001, time + 0.28) // Staccato rápido

        osc.connect(filter)
        filter.connect(g)
        g.connect(newGain)

        osc.start(time)
        osc.stop(time + 0.28)
        this.activeNodes.push(osc)

        step++
        this.activeTimeouts.push(setTimeout(playArpeggiator, 220)) // 220ms por nota
      }
      playArpeggiator()

    // ==============================================================
    // INVESTIGAÇÃO: Chuva constante + acordes melancólicos de piano
    // ==============================================================
    } else if (type === 'investigacao') {
      // Efeito sonoro procedural de chuva
      const playRain = () => {
        if (this.currentAmbience !== 'investigacao') return
        const time = this.ctx!.currentTime
        const bufferSize = this.ctx!.sampleRate * 4
        const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1
        }
        
        const rainSource = this.ctx!.createBufferSource()
        rainSource.buffer = buffer
        rainSource.loop = true
        
        const filter = this.ctx!.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(650, time)
        
        const rainGain = this.ctx!.createGain()
        rainGain.gain.setValueAtTime(0.12, time)

        rainSource.connect(filter)
        filter.connect(rainGain)
        rainGain.connect(newGain)

        rainSource.start(time)
        this.activeNodes.push(rainSource, rainGain as any)
      }
      playRain()

      // Trovões distantes esporádicos
      const playThunder = () => {
        if (this.currentAmbience !== 'investigacao' || this.isMuted) return
        const time = this.ctx!.currentTime

        const thunderBuffer = this.ctx!.createBuffer(1, this.ctx!.sampleRate * 5, this.ctx!.sampleRate)
        const d = thunderBuffer.getChannelData(0)
        for (let i = 0; i < d.length; i++) {
          d[i] = Math.random() * 2 - 1
        }

        const source = this.ctx!.createBufferSource()
        source.buffer = thunderBuffer

        const filter = this.ctx!.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(70, time)
        filter.frequency.linearRampToValueAtTime(30, time + 4.0)
        filter.Q.setValueAtTime(5, time)

        const g = this.ctx!.createGain()
        g.gain.setValueAtTime(0, time)
        g.gain.linearRampToValueAtTime(0.18, time + 0.8) // Impacto do trovão
        g.gain.linearRampToValueAtTime(0.08, time + 2.0)
        g.gain.exponentialRampToValueAtTime(0.0001, time + 5.0)

        source.connect(filter)
        filter.connect(g)
        g.connect(newGain)

        source.start(time)
        source.stop(time + 5.0)
        this.activeNodes.push(source)

        this.activeTimeouts.push(setTimeout(playThunder, 15000 + Math.random() * 25000))
      }
      playThunder()

      // Piano Rhodes de Jazz Noir melancólico
      const jazzChords = [
        [146.83, 174.61, 220.00, 261.63], // Dm7 (D3, F3, A3, C4)
        [196.00, 233.08, 293.66, 349.23], // Gm7 (G3, Bb3, D4, F4)
        [164.81, 196.00, 220.00, 277.18], // A7b9 (E3, G3, A3, C#4)
      ]

      const playPiano = () => {
        if (this.currentAmbience !== 'investigacao' || this.isMuted) return
        const time = this.ctx!.currentTime
        const chord = jazzChords[this.chordIndex]

        const chordGain = this.ctx!.createGain()
        chordGain.gain.setValueAtTime(0, time)
        chordGain.gain.linearRampToValueAtTime(0.05, time + 0.5) // Rhodes soft attack
        chordGain.gain.exponentialRampToValueAtTime(0.0001, time + 5.5)
        chordGain.connect(newGain)

        chord.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator()
          osc.type = 'triangle' // Rhodes emulation
          osc.frequency.setValueAtTime(freq, time)
          
          // Efeito tremolo (modulação suave de ganho)
          const tremolo = this.ctx!.createOscillator()
          const tremoloG = this.ctx!.createGain()
          tremolo.frequency.setValueAtTime(3.5, time) // 3.5Hz tremolo
          tremoloG.gain.setValueAtTime(0.3, time)
          
          tremolo.connect(tremoloG)
          tremoloG.connect(osc.frequency) // Modula frequência sutilmente

          osc.connect(chordGain)
          
          tremolo.start(time)
          osc.start(time)
          tremolo.stop(time + 5.5)
          osc.stop(time + 5.5)
          this.activeNodes.push(osc, tremolo)
        })

        this.chordIndex = (this.chordIndex + 1) % jazzChords.length
        this.activeTimeouts.push(setTimeout(playPiano, 5000))
      }
      playPiano()

    // ==============================================================
    // ROMANCE: Pad flutuante + solos suaves de flauta procedurais
    // ==============================================================
    } else if (type === 'romance') {
      const romanceChords = [
        [130.81, 164.81, 196.00, 246.94], // Cmaj7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [146.83, 174.61, 220.00, 293.66], // Dm7
        [196.00, 246.94, 293.66, 392.00], // G6
      ]

      const playRomancePad = () => {
        if (this.currentAmbience !== 'romance' || this.isMuted) return
        const time = this.ctx!.currentTime
        const chord = romanceChords[this.chordIndex]

        const chordGain = this.ctx!.createGain()
        chordGain.gain.setValueAtTime(0, time)
        chordGain.gain.linearRampToValueAtTime(0.08, time + 2.5) // Attack lento
        chordGain.gain.setValueAtTime(0.08, time + 6.0)
        chordGain.gain.linearRampToValueAtTime(0, time + 9.0) // Fade lento
        chordGain.connect(newGain)

        chord.forEach((freq) => {
          const osc = this.ctx!.createOscillator()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq, time)
          
          osc.connect(chordGain)
          osc.start(time)
          osc.stop(time + 9.0)
          this.activeNodes.push(osc)
        })

        this.chordIndex = (this.chordIndex + 1) % romanceChords.length
        this.activeTimeouts.push(setTimeout(playRomancePad, 8500))
      }
      playRomancePad()

      // Solo esporádico de Flauta Doce / Clarinete (romântico)
      const scale = [293.66, 329.63, 392.00, 440.00, 523.25, 587.33] // G4, A4, C5, D5 pentatonica
      const playFlute = () => {
        if (this.currentAmbience !== 'romance' || this.isMuted) return
        const time = this.ctx!.currentTime
        const note = scale[Math.floor(Math.random() * scale.length)]

        const osc = this.ctx!.createOscillator()
        const g = this.ctx!.createGain()

        osc.type = 'triangle' // Timbre flautado
        osc.frequency.setValueAtTime(note, time)
        
        // Efeito vibrato de flauta
        const vib = this.ctx!.createOscillator()
        const vibG = this.ctx!.createGain()
        vib.frequency.setValueAtTime(5, time) // 5Hz
        vibG.gain.setValueAtTime(3.0, time)
        vib.connect(vibG)
        vibG.connect(osc.frequency)

        g.gain.setValueAtTime(0, time)
        g.gain.linearRampToValueAtTime(0.04, time + 0.4) // Soft attack
        g.gain.linearRampToValueAtTime(0.03, time + 0.8)
        g.gain.exponentialRampToValueAtTime(0.0001, time + 1.8)

        osc.connect(g)
        g.connect(newGain)

        vib.start(time)
        osc.start(time)
        vib.stop(time + 1.8)
        osc.stop(time + 1.8)
        this.activeNodes.push(osc, vib)

        this.activeTimeouts.push(setTimeout(playFlute, 3000 + Math.random() * 6000))
      }
      playFlute()

    // ==============================================================
    // INFANTIL: Toy Piano completo / Caixinha de música clássica
    // ==============================================================
    } else if (type === 'infantil') {
      const melody = [
        523.25, 587.33, 659.25, 523.25, // C5, D5, E5, C5
        523.25, 587.33, 659.25, 523.25, // C5, D5, E5, C5
        659.25, 698.46, 783.99,          // E5, F5, G5
        659.25, 698.46, 783.99           // E5, F5, G5
      ]
      let index = 0

      const playMusicBox = () => {
        if (this.currentAmbience !== 'infantil' || this.isMuted) return
        const time = this.ctx!.currentTime
        const note = melody[index]

        const osc = this.ctx!.createOscillator()
        const g = this.ctx!.createGain()
        
        osc.type = 'sine'
        osc.frequency.setValueAtTime(note, time)

        // Envelope clássico de sininho (decay longo e imediato)
        g.gain.setValueAtTime(0.06, time)
        g.gain.exponentialRampToValueAtTime(0.0001, time + 0.8)

        osc.connect(g)
        g.connect(newGain)
        
        osc.start(time)
        osc.stop(time + 0.8)
        this.activeNodes.push(osc)

        index = (index + 1) % melody.length
        this.activeTimeouts.push(setTimeout(playMusicBox, 400)) // Ritmo regular de caixinha de música
      }
      playMusicBox()
    }
  }
}

export const gameAudio = new AudioEngine()
