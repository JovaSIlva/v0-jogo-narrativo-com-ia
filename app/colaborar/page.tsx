import { getSession } from '@/lib/session'
import { Header } from '@/components/header'
import ColaborarClient from './colaborar-client'

export default async function ColaborarPage() {
  const user = await getSession()

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      {/* Background/Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-primary/5 filter blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[600px] h-[600px] rounded-full bg-accent/5 filter blur-[130px]" />
      </div>

      {/* Header */}
      <Header user={user} />

      {/* Main page content wrapper */}
      <main className="flex-1 flex flex-col items-center py-12 px-4 md:px-8 relative z-10 w-full max-w-4xl mx-auto">
        <ColaborarClient />
      </main>
    </div>
  )
}
