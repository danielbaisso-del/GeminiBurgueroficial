/**
 * Função para obter o caminho correto das imagens públicas
 * Compatível com desenvolvimento e produção
 */
export function getImagePath(imageName: string): string {
  // Para imagens locais do frontend, sempre usar caminho direto
  // Adiciona cache-bust para forçar reload quando necessário
  const ts = Date.now();
  return `/${imageName}?v=${ts}`;
}