import { NextResponse } from 'next/server'

export const maxDuration = 30

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const text = searchParams.get('text')
    const voiceIdParam = searchParams.get('voiceId')

    if (!text) {
      return NextResponse.json({ error: 'Texto ausente' }, { status: 400 })
    }

    const apiKey = process.env.ELEVENLABS_API_KEY
    const voiceId = voiceIdParam || process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'

    if (!apiKey) {
      return NextResponse.json({ error: 'ElevenLabs API Key não configurada' }, { status: 401 })
    }

    // Limpar o texto de tags residuais
    const cleanText = text
      .replace(/---[A-Z]+---[\s\S]*/g, '')
      .trim()

    if (!cleanText) {
      return NextResponse.json({ error: 'Nenhum texto para narrar' }, { status: 400 })
    }

    // Fazer requisição de stream para ElevenLabs
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

    // Repassar o body stream do ElevenLabs diretamente para o cliente
    // Isso habilita a reprodução em tempo real enquanto o áudio é gerado!
    return new Response(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error: any) {
    console.error('Narrate API route GET handler error:', error)
    return NextResponse.json(
      { error: 'Erro interno ao processar áudio' },
      { status: 500 }
    )
  }
}

// Mantendo suporte a POST caso seja necessário no futuro
export async function POST(req: Request) {
  try {
    const { text, voiceId: voiceIdParam } = await req.json()

    if (!text) {
      return NextResponse.json({ error: 'Texto ausente' }, { status: 400 })
    }

    const apiKey = process.env.ELEVENLABS_API_KEY
    const voiceId = voiceIdParam || process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'

    if (!apiKey) {
      return NextResponse.json({ error: 'ElevenLabs API Key não configurada' }, { status: 401 })
    }

    const cleanText = text.replace(/---[A-Z]+---[\s\S]*/g, '').trim()
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
      return NextResponse.json({ error: 'Erro no ElevenLabs' }, { status: response.status })
    }

    const audioBuffer = await response.arrayBuffer()
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
