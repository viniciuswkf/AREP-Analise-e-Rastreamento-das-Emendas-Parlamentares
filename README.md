# AREP — Análise e Rastreamento das Emendas Parlamentares

Painel para análise, rastreio e investigação de pagamentos feitos usando verbas oriundas de Emendas Parlamentares. Cruzamento de dados públicos disponibilizados pelo TransfereGov.

---

## O que é

O AREP é uma ferramenta de análise de dados governamentais que permite investigar pagamentos realizados por meio de emendas parlamentares. O sistema ingere dados abertos da Câmara dos Deputados, Senado Federal e do portal TransfereGov (SICONV), enriquecendo-os com informações sobre fornecedores (CNPJ) para facilitar a identificação de padrões suspeitos.

---

## Estrutura do Projeto

```
arep/
├── api/              # Backend FastAPI — API REST com filtros e paginação
├── data/             # Pipeline ETL — coleta, transformação e carga dos dados
├── frontend/         # Painel web (Next.js 16 + TypeScript + Tailwind CSS)
└── requirements.txt  # Dependências Python
```

---

## Pré-requisitos

- Python 3.10+
- Node.js 18+
- pnpm (opcional, pode usar npm)
- Google Cloud CLI (`gcloud`) — [download](https://docs.cloud.google.com/sdk/docs/install-sdk?hl=pt-br#latest-version) — para autenticação interativa com BigQuery

---

## Instalação

### 1. Clonar o repositório

```bash
git clone git@github.com:viniciuswkf/AREP-Analise-e-Rastreamento-das-Emendas-Parlamentares.git
cd AREP-Analise-e-Rastreamento-das-Emendas-Parlamentares
```

### 2. Configurar ambiente Python

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Configurar credenciais do Google Cloud

O enriquecimento de CNPJ utiliza a API do BigQuery via Base dos Dados. Faça login interativo:

```bash
gcloud auth application-default login
```

Isso abrirá o navegador para autenticar com sua conta Google. Requer que a CLI do Google Cloud esteja instalada (`gcloud`).

### 4. Executar o pipeline ETL

```bash
cd data
python main.py
```

Isso irá:
- Buscar dados de deputados e senadores
- Baixar arquivos do SICONV
- Enriquecer com datas de abertura de CNPJ
- Consolidar e carregar no banco SQLite (`data/data/emendas.db`)

### 5. Iniciar a API

```bash
cd api
uvicorn main:app --reload
```

A API estará disponível em `http://localhost:8000`.

### 6. Iniciar o frontend

```bash
cd frontend
pnpm install
pnpm dev
```

O painel estará disponível em `http://localhost:3000`.

---

## API — Endpoints

### GET /pagamentos/

Retorna pagamentos com filtros e paginação.

**Parâmetros de consulta:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `parlamentar` | string | Nome do parlamentar |
| `partido` | string | Sigla do partido |
| `fornecedor` | string | Nome do fornecedor |
| `cnpj_fornecedor` | string | CNPJ do fornecedor |
| `uf` | string | UF do parlamentar |
| `valor_min` | float | Valor mínimo do pagamento |
| `valor_max` | float | Valor máximo do pagamento |
| `dias_abertura_pagamento` | int | Dias entre abertura do CNPJ e pagamento |
| `ordenar_por` | string | Campo de ordenação (padrão: `valor_pagamento`) |
| `ordem` | string | `asc` ou `desc` (padrão: `desc`) |
| `pagina` | int | Número da página (padrão: 1) |
| `itens_por_pagina` | int | Itens por página (padrão: 20, máx: 100) |

**Exemplo:**

```bash
curl "http://localhost:8000/pagamentos/?partido=PT&valor_min=100000&pagina=1"
```

---

## Fontes de Dados

- **Câmara dos Deputados** — Dados Abertos (`dadosabertos.camara.leg.br`)
- **Senado Federal** — API Legisl (`legis.senado.leg.br`)
- **TransfereGov (SICONV)** — Portal de convênios e transferências (`portaldatransparencia.gov.br`)
- **Base dos Dados** — Datas de abertura de CNPJ via BigQuery

---

## Tecnologias

| Camada | Stack |
|---|---|
| Backend | FastAPI · SQLite · Uvicorn |
| ETL | Python · pandas · basedosdados · Google BigQuery |
| Frontend | Next.js 16 · TypeScript · Tailwind CSS 4 |

---

## Referências e Links

Repositórios com dados do SICONV/TransfereGov:
https://repositorio.dados.gov.br/seges/detru/

Dados da Câmara e Senado:
https://dadosabertos.camara.leg.br/api/v2/deputados/
https://legis.senado.leg.br/dadosabertos/senador/lista/atual

Dataset para consulta de dados do CNPJ:
https://basedosdados.org/dataset/e43f0d5b-43cf-4bfb-8d90-c38a4e0d7c4f?table=b8432ff5-06c8-45ca-b8b6-33fceb24089d
