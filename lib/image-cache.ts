/**
 * Utilitários para cache de imagens geradas por IA no navegador do usuário.
 * Utiliza a API Cache Storage para suportar imagens pesadas sem esgotar o localStorage.
 */

const CACHE_NAME = 'cronicas-do-destino-images'

/**
 * Salva uma imagem externa no Cache Storage associada ao ID da mensagem.
 */
export async function cacheImage(messageId: string, url: string): Promise<void> {
  try {
    if (typeof window === 'undefined' || !('caches' in window)) return

    const cache = await caches.open(CACHE_NAME)
    const response = await fetch(url)
    
    if (response.ok) {
      // Clona a resposta para poder salvar no cache (uma resposta só pode ser lida uma vez)
      await cache.put(`/api/scene-image/${messageId}`, response.clone())
      console.log(`[image-cache] Imagem para mensagem ${messageId} salva no cache.`)
    }
  } catch (e) {
    console.error(`[image-cache] Erro ao salvar imagem no cache para ${messageId}:`, e)
  }
}

/**
 * Busca uma imagem do Cache Storage e retorna um Object URL local (blob:...)
 */
export async function getCachedImage(messageId: string): Promise<string | null> {
  try {
    if (typeof window === 'undefined' || !('caches' in window)) return null

    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match(`/api/scene-image/${messageId}`)
    
    if (cachedResponse) {
      const blob = await cachedResponse.blob()
      const objectUrl = URL.createObjectURL(blob)
      console.log(`[image-cache] Imagem para mensagem ${messageId} recuperada do cache.`)
      return objectUrl
    }
  } catch (e) {
    console.error(`[image-cache] Erro ao obter imagem do cache para ${messageId}:`, e)
  }
  return null
}
