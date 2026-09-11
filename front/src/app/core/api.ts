export const API_URL = 'http://localhost:8080';

export function backendForaDoAr(erro: unknown): boolean {
  if (!erro || typeof erro !== 'object') {
    return false;
  }
  const status = 'status' in erro ? (erro as { status: unknown }).status : null;
  return status === 0 || status === 504;
}

export function mensagemHttpErro(erro: unknown, fallback: string): string {
  if (erro && typeof erro === 'object' && 'error' in erro) {
    const corpo = (erro as { error: unknown }).error;
    if (typeof corpo === 'string' && corpo.trim()) {
      return corpo;
    }
  }
  return fallback;
}
