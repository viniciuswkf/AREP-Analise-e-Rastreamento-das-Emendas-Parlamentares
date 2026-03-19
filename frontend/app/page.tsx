"use client";

import { useState, useEffect, useCallback } from "react";

interface Metada {
  total_registros: number;
  total_paginas: number;
  pagina_atual: number;
  itens_por_pagina: number;
  ordenacao: string;
}

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

interface Filtros {
  parlamentar: string;
  partido: string;
  entidade: string;
  fornecedor: string;
  cnpj_fornecedor: string;
  uf: string;
  valor_min: string;
  valor_max: string;
  dias_abertura_pagamento: string;
}

export default function Home() {
  const [dados, setDados] = useState<Pagamento[]>([]);
  const [metadata, setMetadata] = useState<Metada | null>(null);
  const [loading, setLoading] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(true);

  const [filtros, setFiltros] = useState<Filtros>({
    parlamentar: "",
    partido: "",
    entidade: "",
    fornecedor: "",
    cnpj_fornecedor: "",
    uf: "",
    valor_min: "",
    valor_max: "",
    dias_abertura_pagamento: "",
  });

  const [pagina, setPagina] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(50);

  const buscarDados = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros.parlamentar)
        params.append("parlamentar", filtros.parlamentar);
      if (filtros.partido) params.append("partido", filtros.partido);
      if (filtros.entidade) params.append("entidade", filtros.entidade);
      if (filtros.fornecedor) params.append("fornecedor", filtros.fornecedor);
      if (filtros.cnpj_fornecedor)
        params.append("cnpj_fornecedor", filtros.cnpj_fornecedor);
      if (filtros.uf) params.append("uf", filtros.uf);
      if (filtros.valor_min) params.append("valor_min", filtros.valor_min);
      if (filtros.valor_max) params.append("valor_max", filtros.valor_max);
      if (filtros.dias_abertura_pagamento)
        params.append(
          "dias_abertura_pagamento",
          filtros.dias_abertura_pagamento,
        );
      params.append("pagina", pagina.toString());
      params.append("itens_por_pagina", itensPorPagina.toString());

      const response = await fetch(
        `http://localhost:8000/pagamentos/?${params}`,
      );
      if (!response.ok) throw new Error("Erro ao buscar dados");
      const result = await response.json();
      setDados(result.data);
      setMetadata(result.metadata);
    } catch (error) {
      console.error("Erro:", error);
      setDados([]);
    } finally {
      setLoading(false);
    }
  }, [filtros, pagina, itensPorPagina]);

  useEffect(() => {
    buscarDados();
  }, [buscarDados]);

  const limparFiltros = () => {
    setFiltros({
      parlamentar: "",
      partido: "",
      entidade: "",
      fornecedor: "",
      cnpj_fornecedor: "",
      uf: "",
      valor_min: "",
      valor_max: "",
      dias_abertura_pagamento: "",
    });
    setPagina(1);
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const totalValor = dados.reduce((acc, item) => acc + item.VALOR_PAGAMENTO, 0);

  const estados = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];
  const partidos = [
    "MDB",
    "PT",
    "PSD",
    "PL",
    "UNIÃO",
    "REPUBLICANOS",
    "PP",
    "PSB",
    "PV",
    "PCdoB",
    "REDE",
    "CIDADANIA",
    "SOLIDARIEDADE",
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      <div className="bg-gradient-to-t from-gray-300 to-gray-100 text-gray-600 px-4 py-1 flex items-center gap-3">
        <h1 className="text-xs! font-semibold tracking-tight">
          AREP - Análise e Rastreamento de Emendas Parlamentares
        </h1>
      </div>

      <main className="flex-1 overflow-hidden flex flex-col p-4 gap-3">
        <style jsx global>{`
          .form-control,
          .form-select {
            padding: 0.375rem 0.75rem;
            font-size: 0.875rem;
            line-height: 1.25rem;
            height: calc(1.25rem + 0.75rem);
          }
        `}</style>
        <div className="flex items-center justify-between">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <i
              className={`bi ${mostrarFiltros ? "bi-chevron-up" : "bi-chevron-down"} me-1`}
            ></i>
            Filtros
          </button>
          <span className="text-sm text-slate-600">
            {metadata
              ? `${metadata.total_registros.toLocaleString("pt-BR")} registros`
              : "Carregando..."}
          </span>
        </div>

        {mostrarFiltros && (
          <div className="bg-white rounded shadow border border-slate-200 p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-4 gap-y-3">
              <div>
                <label className="form-label text-xs mb-1 fw-bold text-secondary">
                  Parlamentar
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{
                    padding: "0.375rem 0.75rem",
                    fontSize: "0.875rem",
                    height: "32px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  onChange={(e) =>
                    setFiltros({ ...filtros, parlamentar: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="form-label text-xs mb-1 fw-bold text-secondary">
                  Partido
                </label>
                <select
                  className="form-select"
                  style={{
                    fontSize: "0.875rem",
                    height: "32px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  value={filtros.partido}
                  onChange={(e) =>
                    setFiltros({ ...filtros, partido: e.target.value })
                  }
                >
                  <option value="">Selecione</option>
                  {partidos.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label text-xs mb-1 fw-bold text-secondary">
                  Entidade
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{
                    padding: "0.375rem 0.75rem",
                    fontSize: "0.875rem",
                    height: "32px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  placeholder="Nome..."
                  value={filtros.entidade}
                  onChange={(e) =>
                    setFiltros({ ...filtros, entidade: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="form-label text-xs mb-1 fw-bold text-secondary">
                  Fornecedor
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{
                    padding: "0.375rem 0.75rem",
                    fontSize: "0.875rem",
                    height: "32px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  placeholder="Nome..."
                  value={filtros.fornecedor}
                  onChange={(e) =>
                    setFiltros({ ...filtros, fornecedor: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="form-label text-xs mb-1 fw-bold text-secondary">
                  CNPJ Fornecedor
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{
                    padding: "0.375rem 0.75rem",
                    fontSize: "0.875rem",
                    height: "32px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  placeholder="00.000.000/0000-00"
                  value={filtros.cnpj_fornecedor}
                  onChange={(e) =>
                    setFiltros({ ...filtros, cnpj_fornecedor: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="form-label text-xs mb-1 fw-bold text-secondary">
                  UF
                </label>
                <select
                  className="form-select"
                  style={{
                    fontSize: "0.875rem",
                    height: "32px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  value={filtros.uf}
                  onChange={(e) =>
                    setFiltros({ ...filtros, uf: e.target.value })
                  }
                >
                  <option value="">Selecione</option>
                  {estados.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label text-xs mb-1 fw-bold text-secondary">
                  Dias Abertura (max)
                </label>
                <input
                  type="number"
                  className="form-control"
                  style={{
                    padding: "0.375rem 0.75rem",
                    fontSize: "0.875rem",
                    height: "32px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  placeholder="0"
                  value={filtros.dias_abertura_pagamento}
                  onChange={(e) =>
                    setFiltros({
                      ...filtros,
                      dias_abertura_pagamento: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="form-label text-xs mb-1 fw-bold text-secondary">
                  Valor Mín. (R$)
                </label>
                <input
                  type="number"
                  className="form-control"
                  style={{
                    padding: "0.375rem 0.75rem",
                    fontSize: "0.875rem",
                    height: "32px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  placeholder="0,00"
                  value={filtros.valor_min}
                  onChange={(e) =>
                    setFiltros({ ...filtros, valor_min: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="form-label text-xs mb-1 fw-bold text-secondary">
                  Valor Máx. (R$)
                </label>
                <input
                  type="number"
                  className="form-control"
                  style={{
                    padding: "0.375rem 0.75rem",
                    fontSize: "0.875rem",
                    height: "32px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  placeholder="999999999"
                  value={filtros.valor_max}
                  onChange={(e) =>
                    setFiltros({ ...filtros, valor_max: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="form-label text-xs mb-1 fw-bold text-secondary">
                  Itens por Página
                </label>
                <select
                  className="form-select"
                  style={{
                    fontSize: "0.875rem",
                    height: "32px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  value={itensPorPagina}
                  onChange={(e) => {
                    setItensPorPagina(Number(e.target.value));
                    setPagina(1);
                  }}
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="btn btn-outline-secondary"
                onClick={limparFiltros}
              >
                <i className="bi bi-x-circle me-1"></i>Limpar
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setPagina(1)}
              >
                <i className="bi bi-search me-1"></i>Buscar
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto bg-white rounded shadow border border-slate-200">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
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
                  <th>Entidade (executor)</th>
                  <th>Recebedor</th>
                  <th>Data Pgto</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {dados.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="text-center py-4 text-muted">
                      Nenhum registro encontrado
                    </td>
                  </tr>
                ) : (
                  dados.map((pag) => (
                    <tr
                      key={`${pag.ID_MOVIMENTACAO}-${pag.NUMERO_EMENDA}-${pag.VALOR_PAGAMENTO}-${pag.DATA_PAGAMENTO}-${pag.FORNECEDOR_CPF_CNPJ}`}
                    >
                      <td className="small text-muted">
                        {pag.ID_MOVIMENTACAO}
                      </td>
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
                          <span className="text-xs mt-1 opacity-80">
                            CNPJ: {pag.FORNECEDOR_CPF_CNPJ}
                          </span>
                          <small className="text-xs  opacity-80">
                            Criada em: {pag.FORNECEDOR_ABERTURA}
                          </small>
                        </div>
                      </td>
                      <td className="fw-bold">{pag.DATA_PAGAMENTO}</td>
                      <td className="text-end fw-bold">
                        {formatarMoeda(pag.VALOR_PAGAMENTO)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {metadata && metadata.total_paginas > 1 && (
          <div className="flex justify-center items-center gap-2">
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
      </main>
    </div>
  );
}
