import { NextResponse } from 'next/server'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { text } = await req.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Texto inválido' }, { status: 400 })
    }

    const apiKey = process.env.ELEVENLABS_API_KEY
    // Voz do "Adam" (deep narrator) por padrão se não for especificada
    const voiceId = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'

    if (!apiKey) {
      return NextResponse.json({ error: 'ElevenLabs API Key não configurada' }, { status: 401 })
    }

    // Limpar o texto de tags residuais para que o narrador não as soletre
    const cleanText = text
      .replace(/---[A-Z]+---[\s\S]*/g, '') // Remove tudo a partir das tags de ESCOLHAS, IMAGEM, etc
      .trim()

    if (!cleanText) {
      return NextResponse.json({ error: 'Nenhum texto para narrar' }, { status: 400 })
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'accept': 'audio/mpeg',
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('ElevenLabs API error:', errText)
      return NextResponse.json(
        { error: 'Erro ao se comunicar com ElevenLabs' },
        { status: response.status }
      )
    }

    const audioBuffer = await response.arrayBuffer()

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    })
  } catch (error: any) {
    console.error('Narrate API route handler error:', error)
    return NextResponse.json(
      { error: 'Erro interno ao processar áudio' },
      { status: 500 }
    )
  }
}
