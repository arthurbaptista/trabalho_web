// import { HttpClient } from '@angular/common/http';
// import { inject, Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
//
// // Ajuste a URL base conforme a rota da sua API no Spring Boot
// const API_URL = 'http://localhost:8080/api';
//
// @Injectable({
//   providedIn: 'root',
// })
// export class ClienteService {
//   private readonly http = inject(HttpClient);
//
//   // RF003 - Listar solicitações do cliente
//   obterSolicitacoesCliente(): Observable<any[]> {
//     return this.http.get<any[]>(`${API_URL}/solicitacoes/cliente`);
//   }
//
//   // RF004 - Buscar categorias para o cadastro da solicitação
//   obterCategorias(): Observable<any[]> {
//     return this.http.get<any[]>(`${API_URL}/categorias`);
//   }
//
//   // RF004 - Criar nova solicitação
//   criarSolicitacao(dados: {
//     descricaoEquipamento: string;
//     categoriaId: string;
//     descricaoDefeito: string;
//   }): Observable<any> {
//     return this.http.post<any>(`${API_URL}/solicitacoes`, dados);
//   }
//
//   // RF006 - Aprovar Serviço
//   aprovarServico(idSolicitacao: number): Observable<any> {
//     return this.http.put<any>(`${API_URL}/solicitacoes/${idSolicitacao}/aprovar`, {});
//   }
//
//   // RF007 - Rejeitar Serviço
//   rejeitarServico(idSolicitacao: number, motivo: string): Observable<any> {
//     return this.http.put<any>(`${API_URL}/solicitacoes/${idSolicitacao}/rejeitar`, { motivo });
//   }
//
//   // RF008 - Obter histórico de atualizações da solicitação
//   obterHistorico(idSolicitacao: number): Observable<any[]> {
//     return this.http.get<any[]>(`${API_URL}/solicitacoes/${idSolicitacao}/historico`);
//   }
//
//   // RF009 - Resgatar Serviço
//   resgatarServico(idSolicitacao: number): Observable<any> {
//     return this.http.put<any>(`${API_URL}/solicitacoes/${idSolicitacao}/resgatar`, {});
//   }
//
//   // RF010 - Pagar Serviço
//   pagarServico(idSolicitacao: number): Observable<any> {
//     return this.http.put<any>(`${API_URL}/solicitacoes/${idSolicitacao}/pagar`, {});
//   }
// }
