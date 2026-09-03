export const API_URL = 'http://localhost:8080';

export function mensagemHttpErro(erro: unknown, fallback: string): string {
  if (erro && typeof erro === 'object' && 'error' in erro) {
    const corpo = (erro as { error: unknown }).error;
    if (typeof corpo === 'string' && corpo.trim()) {
      return corpo;
    }
  }
  return fallback;
}
