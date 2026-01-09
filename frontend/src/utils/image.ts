/**
 * Função para obter o caminho correto das imagens públicas
 * Compatível com desenvolvimento e produção
 */
export function getImagePath(imageName: string): string {
  // Em desenvolvimento, BASE_URL é "/", em produção pode ser diferente
  const baseUrl = import.meta.env.BASE_URL || '/';
  return `${baseUrl}${imageName}`;
}