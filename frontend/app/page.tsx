"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { FiltrosSection } from "./components/FiltrosSection";
import { TabelaPagamentos } from "./components/TabelaPagamentos";

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
      if (filtros.parlamentar) params.append("parlamentar", filtros.parlamentar);
      if (filtros.partido) params.append("partido", filtros.partido);
      if (filtros.entidade) params.append("entidade", filtros.entidade);
      if (filtros.fornecedor) params.append("fornecedor", filtros.fornecedor);
      if (filtros.cnpj_fornecedor) params.append("cnpj_fornecedor", filtros.cnpj_fornecedor);
      if (filtros.uf) params.append("uf", filtros.uf);
      if (filtros.valor_min) params.append("valor_min", filtros.valor_min);
      if (filtros.valor_max) params.append("valor_max", filtros.valor_max);
      if (filtros.dias_abertura_pagamento) params.append("dias_abertura_pagamento", filtros.dias_abertura_pagamento);
      params.append("pagina", pagina.toString());
      params.append("itens_por_pagina", itensPorPagina.toString());

      const response = await fetch(`http://localhost:8000/pagamentos/?${params}`);
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

  const limparFiltros = useCallback(() => {
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
  }, []);

  const handleBuscar = useCallback(() => {
    setPagina(1);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      <div className="bg-linear-to-t flex flex-col from-gray-200 to-gray-50 text-gray-600 px-4 py-1 ">
        <h1 className="text-sm! font-semibold tracking-tight leading-1">
          AREP - Análise e Rastreamento de Emendas Parlamentares
        </h1>
        <span className="text-xs">
          Esta ferramenta lista pagamentos executados por ONGs, Prefeituras ou
          Institutos que receberam verba de Emenda Parlamentar.
        </span>
      </div>

      <main className="flex-1 overflow-hidden flex flex-col p-4 gap-3">
        <FiltrosSection
          filtros={filtros}
          setFiltros={setFiltros}
          itensPorPagina={itensPorPagina}
          setItensPorPagina={setItensPorPagina}
          setPagina={setPagina}
          metadata={metadata}
          onLimpar={limparFiltros}
          onBuscar={handleBuscar}
        />
        <TabelaPagamentos
          dados={dados}
          loading={loading}
          pagina={pagina}
          setPagina={setPagina}
          metadata={metadata}
        />
      </main>
    </div>
  );
}
