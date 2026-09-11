// import { Component, inject, OnInit, signal } from '@angular/core';
// import { CommonModule, CurrencyPipe, DatePipe, SlicePipe } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
//
// import { Logo } from '../shared/logo/logo';
// import { ClienteService } from './cliente.service';
//
// @Component({
//   selector: 'app-cliente',
//   standalone: true,
//   imports: [CommonModule, FormsModule, Logo, DatePipe, CurrencyPipe, SlicePipe],
//   templateUrl: './cliente.html',
//   styleUrl: './cliente.css',
// })
// export class Cliente implements OnInit {
//   private readonly clienteService = inject(ClienteService);
//   private readonly router = inject(Router);
//
//   // Signals para estados da tela
//   solicitacoes = signal<any[]>([]);
//   categorias = signal<any[]>([]);
//   solicitacaoSelecionada = signal<any | null>(null);
//
//   // Modais
//   modalNovaSolicitacao = signal(false);
//   modalOrcamento = signal(false);
//   modalVisualizar = signal(false);
//   modalPagamento = signal(false);
//
//   // Formulários
//   novaSolicitacao = { descricaoEquipamento: '', categoriaId: '', descricaoDefeito: '' };
//   motivoRejeicao = '';
//   modoRejeicao = signal(false);
//
//   ngOnInit() {
//     this.carregarSolicitacoes();
//     this.carregarCategorias();
//   }
//
//   carregarSolicitacoes() {
//     this.clienteService.obterSolicitacoesCliente().subscribe((dados) => {
//       // RF003: Ordenadas de forma crescente por data/hora
//       const ordenadas = dados.sort(
//         (a: any, b: any) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime(),
//       );
//       this.solicitacoes.set(ordenadas);
//     });
//   }
//
//   carregarCategorias() {
//     this.clienteService.obterCategorias().subscribe((dados) => this.categorias.set(dados));
//   }
//
//   // RF004 - Solicitação de Manutenção
//   abrirModalNovaSolicitacao() {
//     this.novaSolicitacao = { descricaoEquipamento: '', categoriaId: '', descricaoDefeito: '' };
//     this.modalNovaSolicitacao.set(true);
//   }
//
//   salvarSolicitacao() {
//     this.clienteService.criarSolicitacao(this.novaSolicitacao).subscribe(() => {
//       this.modalNovaSolicitacao.set(false);
//       this.carregarSolicitacoes();
//     });
//   }
//
//   // RF005 - Mostrar orçamento
//   abrirOrcamento(solicitacao: any) {
//     this.solicitacaoSelecionada.set(solicitacao);
//     this.modoRejeicao.set(false);
//     this.modalOrcamento.set(true);
//   }
//
//   // RF006 - Aprovar Serviço
//   aprovarServico() {
//     const s = this.solicitacaoSelecionada();
//     this.clienteService.aprovarServico(s.id).subscribe(() => {
//       alert(`Serviço Aprovado no Valor R$ ${s.valor}`);
//       this.modalOrcamento.set(false);
//       this.carregarSolicitacoes();
//     });
//   }
//
//   // RF007 - Rejeitar Serviço
//   rejeitarServico() {
//     if (!this.motivoRejeicao.trim()) return;
//     this.clienteService
//       .rejeitarServico(this.solicitacaoSelecionada().id, this.motivoRejeicao)
//       .subscribe(() => {
//         alert('Serviço Rejeitado');
//         this.modalOrcamento.set(false);
//         this.carregarSolicitacoes();
//       });
//   }
//
//   // RF008 - Visualizar Serviço
//   visualizarServico(solicitacao: any) {
//     this.clienteService.obterHistorico(solicitacao.id).subscribe((historico) => {
//       this.solicitacaoSelecionada.set({ ...solicitacao, historico });
//       this.modalVisualizar.set(true);
//     });
//   }
//
//   // RF009 - Resgatar Serviço
//   resgatarServico(id: number) {
//     this.clienteService.resgatarServico(id).subscribe(() => {
//       this.carregarSolicitacoes();
//     });
//   }
//
//   // RF010 - Pagar Serviço
//   abrirModalPagamento(solicitacao: any) {
//     this.solicitacaoSelecionada.set(solicitacao);
//     this.modalPagamento.set(true);
//   }
//
//   confirmarPagamento() {
//     this.clienteService.pagarServico(this.solicitacaoSelecionada().id).subscribe(() => {
//       this.modalPagamento.set(false);
//       this.carregarSolicitacoes();
//     });
//   }
//
//   logout() {
//     this.router.navigate(['/login']);
//   }
// }
