'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ColaborarClient() {
  const [copied, setCopied] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const pixKey = '9837c7d8-0282-42be-821f-2a87487e160d'

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const tiers = [
    {
      icon: '💛',
      title: 'Apoiador',
      price: '10',
      description: 'Selo 💛 Apoiador ao lado do seu nome no ranking',
      highlighted: false,
    },
    {
      icon: '🛟',
      title: 'Mantenedor',
      price: '25',
      description: 'Selo 🛟 Mantenedor (cor de destaque, +chamativa)',
      highlighted: true,
    },
    {
      icon: '👑',
      title: 'Padrinho',
      price: '50',
      description: 'Selo 👑 Padrinho (dourado), o nível de honra do projeto',
      highlighted: false,
    },
  ]

  return (
    <div className="w-full space-y-12">
      {/* Introduction */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Apoie o projeto
        </h1>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Mantém as Crônicas do Destino no ar. <br />
          Sem ads, sem casa de aposta. Qualquer colaboração libera novas crônicas e cobre as APIs das IAs. 
          Os níveis abaixo mudam só o selo de reconhecimento, nunca o acesso.
        </p>
      </div>

      {/* Tier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className={`relative flex flex-col justify-between p-6 rounded-2xl border transition-all duration-300 ${
              tier.highlighted
                ? 'bg-primary/5 border-primary shadow-[0_0_24px_rgba(var(--primary),0.1)]'
                : 'bg-card/40 border-border/60 hover:border-border'
            }`}
          >
            {tier.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full uppercase tracking-wider">
                ★ mais escolhido
              </span>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{tier.icon}</span>
                <span className="text-2xl font-bold font-serif text-foreground">R$ {tier.price}</span>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-foreground">{tier.title}</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{tier.description}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/30">
              <button
                onClick={handleCopy}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
                  tier.highlighted
                    ? 'bg-primary text-primary-foreground hover:bg-primary/95'
                    : 'bg-muted/80 text-foreground hover:bg-muted border border-border/40'
                }`}
              >
                💸 Colaborar R$ {tier.price} via PIX →
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Access Disclaimer */}
      <div className="p-4 bg-muted/30 border border-border/40 rounded-xl text-center max-w-2xl mx-auto">
        <p className="text-xs text-muted-foreground">
          🎯 Todos os níveis liberam o mesmo acesso (crônicas extras + sugestões) — a diferença é só o selo. Quer colaborar outro valor? Escolhe livremente no formulário abaixo.
        </p>
      </div>

      {/* PIX Donation Details */}
      <div className="border border-border/60 bg-card/25 rounded-2xl p-6 md:p-8 max-w-xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h2 className="font-serif text-2xl font-bold text-foreground">💸 Colaborar via PIX</h2>
          <p className="text-xs text-muted-foreground">Sem taxa, instantâneo, brasileiro. Escolhe o valor no app do banco.</p>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-3 py-4 border-y border-border/30">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">QR Code PIX</div>
          <div className="p-3 bg-white rounded-xl shadow-md">
            {/* Custom SVG QR Code Placeholder */}
            <svg viewBox="0 0 100 100" className="w-36 h-36 text-black">
              <rect x="0" y="0" width="25" height="25" fill="black" />
              <rect x="5" y="5" width="15" height="15" fill="white" />
              <rect x="8" y="8" width="9" height="9" fill="black" />

              <rect x="75" y="0" width="25" height="25" fill="black" />
              <rect x="80" y="5" width="15" height="15" fill="white" />
              <rect x="83" y="8" width="9" height="9" fill="black" />

              <rect x="0" y="75" width="25" height="25" fill="black" />
              <rect x="5" y="80" width="15" height="15" fill="white" />
              <rect x="8" y="83" width="9" height="9" fill="black" />

              <rect x="35" y="10" width="10" height="15" fill="black" />
              <rect x="55" y="5" width="15" height="10" fill="black" />
              <rect x="40" y="30" width="20" height="5" fill="black" />
              <rect x="10" y="35" width="15" height="15" fill="black" />
              <rect x="15" y="40" width="5" height="5" fill="white" />
              <rect x="30" y="50" width="10" height="10" fill="black" />
              <rect x="50" y="45" width="15" height="15" fill="black" />
              <rect x="75" y="35" width="15" height="20" fill="black" />
              <rect x="80" y="40" width="5" height="10" fill="white" />
              <rect x="35" y="70" width="20" height="10" fill="black" />
              <rect x="65" y="75" width="10" height="15" fill="black" />
              <rect x="85" y="65" width="10" height="10" fill="black" />
              <rect x="80" y="80" width="15" height="15" fill="black" />
              <rect x="85" y="85" width="5" height="5" fill="white" />
            </svg>
          </div>
          <span className="text-[10px] text-muted-foreground text-center max-w-xs">
            📱 Abra o app do seu banco, escolha PIX → Pagar com QR Code e aponte a câmera. Você escolhe o valor.
          </span>
        </div>

        {/* Copy Paste Code */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              📋 Copiar código PIX (copia e cola) OU Chave PIX (email)
            </span>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                readOnly
                value={pixKey}
                className="w-full px-3 py-2 bg-muted/60 border border-border/80 rounded-xl text-xs font-mono text-foreground focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                title={showKey ? 'Ocultar chave' : 'Mostrar chave'}
              >
                {showKey ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            <button
              onClick={handleCopy}
              className={`px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-primary text-primary-foreground hover:bg-primary/95'
              }`}
            >
              {copied ? 'Copiado!' : '📋 Copiar'}
            </button>
          </div>
        </div>

        {/* Confirmation Info */}
        <div className="pt-4 border-t border-border/30 text-center">
          <p className="text-xs text-muted-foreground">
            Depois, manda o comprovante no Instagram <a href="https://instagram.com/arena.das.ias" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">@arena.das.ias</a> para liberar suas recompensas 💛
          </p>
        </div>
      </div>
    </div>
  )
}
