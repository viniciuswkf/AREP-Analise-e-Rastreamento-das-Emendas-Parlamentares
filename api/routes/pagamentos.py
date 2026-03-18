from fastapi import APIRouter, Query
import sqlite3
import pandas as pd
import os
import math
from typing import Optional

router = APIRouter(prefix="/pagamentos", tags=["Pagamentos"])

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.normpath(os.path.join(BASE_DIR, "../../data/data/emendas.db"))

@router.get("/")
def listar_pagamentos(
    parlamentar: Optional[str] = None,
    partido: Optional[str] = None,
    fornecedor: Optional[str] = None,
    cnpj_fornecedor: Optional[str] = None,
    uf: Optional[str] = None,
    valor_min: Optional[float] = None,
    valor_max: Optional[float] = None,
    dias_abertura_pagamento: Optional[int] = None,
    ordenar_por: str = "DATA_PAGAMENTO",
    ordem: str = Query("desc", regex="^(asc|desc)$"),
    pagina: int = Query(1, ge=1),
    itens_por_pagina: int = Query(100, gt=0, le=1000)
):
    conn = sqlite3.connect(DB_PATH)
    
    filtros = " WHERE 1=1"
    params = []

    if parlamentar:
        filtros += " AND PARLAMENTAR LIKE ?"
        params.append(f"%{parlamentar.upper()}%")
    
    if partido:
        filtros += " AND PARTIDO = ?"
        params.append(partido.upper())

    if fornecedor:
        filtros += " AND FORNECEDOR LIKE ?"
        params.append(f"%{fornecedor.upper()}%")

    if cnpj_fornecedor:
        filtros += " AND FORNECEDOR_CPF_CNPJ = ?"
        params.append(cnpj_fornecedor)

    if uf:
        filtros += " AND ENTIDADE_UF = ?"
        params.append(uf.upper())

    if valor_min:
        filtros += " AND VALOR_PAGAMENTO >= ?"
        params.append(valor_min)

    if valor_max:
        filtros += " AND VALOR_PAGAMENTO <= ?"
        params.append(valor_max)

    if dias_abertura_pagamento is not None:
        sql_data_pag = "SUBSTR(DATA_PAGAMENTO, 7, 4) || '-' || SUBSTR(DATA_PAGAMENTO, 4, 2) || '-' || SUBSTR(DATA_PAGAMENTO, 1, 2)"
        sql_data_abertura = "SUBSTR(FORNECEDOR_ABERTURA, 7, 4) || '-' || SUBSTR(FORNECEDOR_ABERTURA, 4, 2) || '-' || SUBSTR(FORNECEDOR_ABERTURA, 1, 2)"
        
        filtros += f" AND FORNECEDOR_ABERTURA IS NOT NULL AND (JULIANDAY({sql_data_pag}) - JULIANDAY({sql_data_abertura})) <= ?"
        params.append(dias_abertura_pagamento)

    query_count = f"SELECT COUNT(*) FROM pagamentos {filtros}"
    total_registros = pd.read_sql_query(query_count, conn, params=params).iloc[0, 0]
    total_paginas = math.ceil(total_registros / itens_por_pagina)

    offset = (pagina - 1) * itens_por_pagina
    
    if ordenar_por == "DATA_PAGAMENTO":
        order_sql = f"SUBSTR(DATA_PAGAMENTO, 7, 4) || '-' || SUBSTR(DATA_PAGAMENTO, 4, 2) || '-' || SUBSTR(DATA_PAGAMENTO, 1, 2)"
    else:
        order_sql = ordenar_por

    query_dados = f"""
        SELECT * FROM pagamentos 
        {filtros} 
        ORDER BY {order_sql} {ordem.upper()} 
        LIMIT ? OFFSET ?
    """
    
    params_dados = params + [itens_por_pagina, offset]
    df = pd.read_sql_query(query_dados, conn, params=params_dados)
    conn.close()

    return {
        "metadata": {
            "total_registros": int(total_registros),
            "total_paginas": total_paginas,
            "pagina_atual": pagina,
            "itens_por_pagina": itens_por_pagina,
            "ordenacao": f"{ordenar_por} {ordem}"
        },
        "data": df.to_dict(orient="records")
    }