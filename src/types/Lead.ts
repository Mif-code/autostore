export interface Lead {
  readonly id: string;
  readonly nome: string;
  readonly email: string;
  readonly telefone: string;
  readonly veiculoId: number;
  readonly veiculoNome: string;
  readonly mensagem: string;
  readonly criadoEm: string;
}

export interface CriarLeadInput {
  readonly nome: string;
  readonly email: string;
  readonly telefone: string;
  readonly veiculoId: number;
  readonly veiculoNome: string;
  readonly mensagem?: string;
}