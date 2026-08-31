import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Logo } from '../shared/logo/logo';

@Component({
  selector: 'app-autocadastro',
  imports: [FormsModule, RouterLink, Logo],
  templateUrl: './autocadastro.html',
  styleUrl: './autocadastro.css',
})
export class Autocadastro {
  nome = '';
  cpf = '';
  email = '';
  telefone = '';
  cep = '';
  logradouro = '';
  numero = '';
  complemento = '';
  bairro = '';
  cidade = '';
  estado = '';

  estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO',
  ];

  erro = signal('');
  sucesso = signal('');
  carregando = signal(false);
  buscandoCep = signal(false);

  private soDigitos(valor: string): string {
    return valor.replace(/\D/g, '');
  }

  private formatarCpf(digitos: string): string {
    digitos = digitos.slice(0, 11);
    if (digitos.length <= 3) return digitos;
    if (digitos.length <= 6) return `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
    if (digitos.length <= 9) return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
    return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
  }

  private formatarTelefone(digitos: string): string {
    digitos = digitos.slice(0, 11);
    if (digitos.length <= 2) return digitos.length ? `(${digitos}` : '';
    if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
    if (digitos.length <= 10) {
      return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
    }
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  }

  private formatarCep(digitos: string): string {
    digitos = digitos.slice(0, 8);
    if (digitos.length <= 5) return digitos;
    return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
  }

  onCpfChange(valor: string) {
    this.cpf = this.formatarCpf(this.soDigitos(valor));
  }

  onTelefoneChange(valor: string) {
    this.telefone = this.formatarTelefone(this.soDigitos(valor));
  }

  onCepChange(valor: string) {
    this.cep = this.formatarCep(this.soDigitos(valor));
  }

  // Preenche o endereço automaticamente ao sair do campo CEP
  async buscarCep() {
    const digitos = this.soDigitos(this.cep);
    if (digitos.length !== 8) return;

    this.buscandoCep.set(true);
    this.erro.set('');

    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
      const dados = await resposta.json();

      if (dados.erro) {
        this.erro.set('CEP não encontrado.');
        return;
      }

      this.logradouro = dados.logradouro ?? this.logradouro;
      this.bairro = dados.bairro ?? this.bairro;
      this.cidade = dados.localidade ?? this.cidade;
      this.estado = dados.uf ?? this.estado;
    } catch {
      this.erro.set('Não foi possível buscar o CEP. Preencha o endereço manualmente.');
    } finally {
      this.buscandoCep.set(false);
    }
  }

  onSubmit() {
    const cpfValido = this.soDigitos(this.cpf).length === 11;
    const telefoneValido = this.soDigitos(this.telefone).length >= 10;
    const cepValido = this.soDigitos(this.cep).length === 8;

    if (
      !this.nome || !cpfValido || !this.email || !telefoneValido || !cepValido ||
      !this.logradouro || !this.numero || !this.bairro || !this.cidade || !this.estado
    ) {
      this.sucesso.set('');
      this.erro.set('Preencha todos os campos obrigatórios corretamente.');
      return;
    }

    this.erro.set('');
    this.sucesso.set('');
    this.carregando.set(true);

    const payload = {
      nome: this.nome,
      cpf: this.soDigitos(this.cpf),
      email: this.email,
      telefone: this.soDigitos(this.telefone),
      cep: this.soDigitos(this.cep),
      logradouro: this.logradouro,
      numero: this.numero,
      complemento: this.complemento,
      bairro: this.bairro,
      cidade: this.cidade,
      estado: this.estado,
    };

    // TODO: trocar pelo HttpClient chamando POST /clientes/cadastro
    console.log('Cadastro enviado:', payload);

    setTimeout(() => {
      this.carregando.set(false);
      this.sucesso.set('Cadastro enviado! Em breve você poderá fazer login.');
    }, 800);
  }
}