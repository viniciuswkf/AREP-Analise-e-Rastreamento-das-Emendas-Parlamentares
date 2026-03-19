"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";

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

interface Metada {
  total_registros: number;
  total_paginas: number;
  pagina_atual: number;
  itens_por_pagina: number;
  ordenacao: string;
}

interface FiltrosSectionProps {
  filtros: Filtros;
  setFiltros: React.Dispatch<React.SetStateAction<Filtros>>;
  itensPorPagina: number;
  setItensPorPagina: (value: number) => void;
  setPagina: (value: number) => void;
  metadata: Metada | null;
  onLimpar: () => void;
  onBuscar: () => void;
}

const estados = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const partidos = [
  "MDB", "PT", "PSD", "PL", "UNIÃO", "REPUBLICANOS", "PP", "PSB",
  "PV", "PCdoB", "REDE", "CIDADANIA", "SOLIDARIEDADE",
];

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

const InputField = memo(function InputField({ label, value, onChange, placeholder, type = "text" }: InputFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange(newValue);
    }, 500);
  };

  return (
    <div>
      <label className="form-label text-xs mb-1 fw-bold text-secondary">
        {label}
      </label>
      <input
        ref={inputRef}
        type={type}
        className="form-control"
        style={{
          padding: "0.375rem 0.75rem",
          fontSize: "0.875rem",
          height: "32px",
          width: "100%",
          boxSizing: "border-box",
        }}
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
      />
    </div>
  );
});

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

const SelectField = memo(function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <div>
      <label className="form-label text-xs mb-1 fw-bold text-secondary">
        {label}
      </label>
      <select
        className="form-select"
        style={{
          fontSize: "0.875rem",
          height: "32px",
          width: "100%",
          boxSizing: "border-box",
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Selecione</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
});

export function FiltrosSection({ filtros, setFiltros, itensPorPagina, setItensPorPagina, setPagina, metadata, onLimpar, onBuscar }: FiltrosSectionProps) {
  const [mostrarFiltros, setMostrarFiltros] = useState(true);

  const handleFiltroChange = useCallback((key: keyof Filtros, value: string) => {
    setFiltros(prev => ({ ...prev, [key]: value }));
  }, [setFiltros]);

  return (
    <>
      <div className="flex items-center justify-between">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
        >
          <i className={`bi ${mostrarFiltros ? "bi-chevron-up" : "bi-chevron-down"} me-1`}></i>
          Filtros
        </button>
        <span className="text-sm text-slate-600">
          {metadata ? `${metadata.total_registros.toLocaleString("pt-BR")} registros` : "Carregando..."}
        </span>
      </div>

      {mostrarFiltros && (
        <div className="bg-white rounded shadow border border-slate-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-4 gap-y-3">
            <InputField
              label="Parlamentar"
              value={filtros.parlamentar}
              onChange={(v) => handleFiltroChange("parlamentar", v)}
            />
            <SelectField
              label="Partido"
              value={filtros.partido}
              onChange={(v) => handleFiltroChange("partido", v)}
              options={partidos}
            />
            <InputField
              label="Entidade"
              value={filtros.entidade}
              onChange={(v) => handleFiltroChange("entidade", v)}
              placeholder="Nome..."
            />
            <InputField
              label="Fornecedor"
              value={filtros.fornecedor}
              onChange={(v) => handleFiltroChange("fornecedor", v)}
              placeholder="Nome..."
            />
            <InputField
              label="CNPJ Fornecedor"
              value={filtros.cnpj_fornecedor}
              onChange={(v) => handleFiltroChange("cnpj_fornecedor", v)}
              placeholder="00.000.000/0000-00"
            />
            <SelectField
              label="UF"
              value={filtros.uf}
              onChange={(v) => handleFiltroChange("uf", v)}
              options={estados}
            />
            <InputField
              label="Dias Abertura (max)"
              value={filtros.dias_abertura_pagamento}
              onChange={(v) => handleFiltroChange("dias_abertura_pagamento", v)}
              type="number"
              placeholder="0"
            />
            <InputField
              label="Valor Mín. (R$)"
              value={filtros.valor_min}
              onChange={(v) => handleFiltroChange("valor_min", v)}
              type="number"
              placeholder="0,00"
            />
            <InputField
              label="Valor Máx. (R$)"
              value={filtros.valor_max}
              onChange={(v) => handleFiltroChange("valor_max", v)}
              type="number"
              placeholder="999999999"
            />
            <SelectField
              label="Itens por Página"
              value={String(itensPorPagina)}
              onChange={(v) => {
                setItensPorPagina(Number(v));
                setPagina(1);
              }}
              options={["25", "50", "100", "200"]}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button className="btn btn-outline-secondary" onClick={onLimpar}>
              <i className="bi bi-x-circle me-1"></i>Limpar
            </button>
            <button className="btn btn-secondary" onClick={onBuscar}>
              <i className="bi bi-search me-1"></i>Buscar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
