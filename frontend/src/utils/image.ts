/**
 * Função para obter o caminho correto das imagens públicas
 * Compatível com desenvolvimento e produção
 */
export function getImagePath(imageName: string): string {
  // Para imagens locais do frontend, sempre usar caminho direto
  // O Vite serve arquivos da pasta public diretamente na raiz
  return `/${imageName}`;
}