"use client";

import { memo, useMemo } from "react";

interface Pagamento {
  ID_MOVIMENTACAO: number;
  PARLAMENTAR: string;
  PARTIDO: string;
  NUMERO_EMENDA: number;
  NUMERO_CONVENIO: number;
  ENTIDADE: string;
  ENTIDADE_CNPJ: number;
  ENTIDADE_MUNICIPIO: string;
  ENTIDADE_UF: string;
  DATA_PAGAMENTO: string;
  VALOR_PAGAMENTO: number;
  FORNECEDOR: string;
  FORNECEDOR_CPF_CNPJ: string;
  FORNECEDOR_ABERTURA: string;
}

interface Metada {
  total_registros: number;
  total_paginas: number;
  pagina_atual: number;
  itens_por_pagina: number;
  ordenacao: string;
}

interface TabelaPagamentosProps {
  dados: Pagamento[];
  loading: boolean;
  pagina: number;
  setPagina: (value: number) => void;
  metadata: Metada | null;
}

const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
};

const PaginaRow = memo(function PaginaRow({ pag }: { pag: Pagamento }) {
  return (
    <tr>
      <td className="small text-muted">{pag.ID_MOVIMENTACAO}</td>
      <td>
        {pag.PARLAMENTAR}{" "}
        <span className="badge bg-secondary">
          {pag.PARTIDO == "N/D" ? "" : pag.PARTIDO}
        </span>
      </td>
      <td className="small">
        <div className="flex flex-col">
          <span>{pag.NUMERO_EMENDA}</span>
          <span>{pag.NUMERO_CONVENIO}</span>
        </div>
      </td>
      <td className="small">{pag.ENTIDADE}</td>
      <td className="small">
        <div className="flex flex-col">
          <span>{pag.FORNECEDOR}</span>
          <div className="flex gap-2 items-center">
            <span className="text-xs opacity-80">CNPJ: {pag.FORNECEDOR_CPF_CNPJ}</span>
            <span className="text-xs opacity-80">-</span>
            <small className="text-xs opacity-80">Abertura: {pag.FORNECEDOR_ABERTURA}</small>
          </div>
        </div>
      </td>
      <td className="fw-bold">{pag.DATA_PAGAMENTO}</td>
      <td className="text-end fw-bold">{formatarMoeda(pag.VALOR_PAGAMENTO)}</td>
    </tr>
  );
});

export function TabelaPagamentos({ dados, loading, pagina, setPagina, metadata }: TabelaPagamentosProps) {
  const paginas = useMemo(() => dados, [dados]);

  return (
    <div className="flex-1 overflow-auto bg-white rounded shadow border border-slate-200">
      {loading ? (
        <div className="flex justify-center items-center h-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      ) : (
        <table className="table table-hover table-sm mb-0">
          <thead className="table-dark sticky-top">
            <tr>
              <th>ID</th>
              <th>Parlamentar/Bancada</th>
              <th>Emenda/Convênio</th>
              <th>Entidade</th>
              <th>Recebedor</th>
              <th>Data Pgto</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {paginas.length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center py-4 text-muted">
                  Nenhum registro encontrado
                </td>
              </tr>
            ) : (
              paginas.map((pag) => (
                <PaginaRow key={`${pag.ID_MOVIMENTACAO}-${pag.NUMERO_EMENDA}-${pag.VALOR_PAGAMENTO}`} pag={pag} />
              ))
            )}
          </tbody>
        </table>
      )}

      {metadata && metadata.total_paginas > 1 && (
        <div className="flex justify-center items-center gap-2 p-2 border-t">
          <div className="btn-group">
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={pagina === 1}
              onClick={() => setPagina(1)}
            >
              «
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={pagina === 1}
              onClick={() => setPagina(pagina - 1)}
            >
              ‹
            </button>
            <button className="btn btn-outline-secondary btn-sm disabled">
              {pagina} / {metadata.total_paginas}
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={pagina === metadata.total_paginas}
              onClick={() => setPagina(pagina + 1)}
            >
              ›
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={pagina === metadata.total_paginas}
              onClick={() => setPagina(metadata.total_paginas)}
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
