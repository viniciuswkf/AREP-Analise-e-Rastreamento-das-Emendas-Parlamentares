import os
import pandas as pd
import basedosdados as bd
from pathlib import Path

def query_cnpj_data_abertura():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.normpath(os.path.join(base_dir, "..", "data", 'siconv_pagamento.csv'))
    output_file = os.path.join(base_dir, "..", "data", "cnpj_data_abertura.csv")


    print("[etl][query] Filtrando CNPJ fornecedores para buscar data de inicio de atividade...")
    
    df_original = pd.read_csv(
        data_path, 
        sep=';', 
        usecols=['IDENTIF_FORNECEDOR'],
        dtype={'IDENTIF_FORNECEDOR': str}
    )

    cnpjs_completos = df_original['IDENTIF_FORNECEDOR'].dropna()
    cnpjs_completos = cnpjs_completos[cnpjs_completos.str.len() == 14].unique()

    cnpj_map = {c[:8]: c for c in cnpjs_completos}
    lista_basicos = list(cnpj_map.keys())

    total_processar = len(lista_basicos)
    print(f"[etl][query] Iniciando consulta de {total_processar} CNPJs...")

    tamanho_lote = 10000 
    resultados_dfs = []

    
    for i in range(0, total_processar, tamanho_lote):
        lote_atual = lista_basicos[i : i + tamanho_lote]
        lote_limpo = ["".join(filter(str.isdigit, str(c))) for c in lote_atual]
        lote_limpo = [c for c in lote_limpo if len(c) == 8] # Apenas básicos válidos
        
        if not lote_limpo:
            continue

        lote_str = ", ".join([f"'{c}'" for c in lote_limpo])
        
        query = f"""
        SELECT 
            cnpj_basico,
            MIN(data_inicio_atividade) as data_inicio_atividade
        FROM `basedosdados.br_me_cnpj.estabelecimentos`
        WHERE cnpj_basico IN ({lote_str})
          AND identificador_matriz_filial = '1'
        GROUP BY 1
        """
        
        print(f"   Processando lote {i//tamanho_lote + 1}... ", end="", flush=True)
        try:
            df_lote = bd.read_sql(query, billing_project_id="practical-brace-393312")
            resultados_dfs.append(df_lote)
            print(f"OK ({len(df_lote)} encontrados)")
        except Exception as e:
            print(f"\nERRO no lote: {e}")

    if resultados_dfs:
        print(f"[etl][query] Salvando resultados da consulta dos CNPJs...")
        df_final = pd.concat(resultados_dfs, ignore_index=True)
        
        df_final["CNPJ"] = df_final["cnpj_basico"].map(cnpj_map)

        df_final["data_inicio_atividade"] = pd.to_datetime(df_final["data_inicio_atividade"])

        df_final["ABERTURA"] = df_final["data_inicio_atividade"].dt.strftime('%d/%m/%Y')
        
        df_export = df_final[["CNPJ", "ABERTURA"]].drop_duplicates()
        
        df_export.to_csv(output_file, index=False, encoding="utf-8-sig")
        
        print(f"[etl][query] Início de atividade dos CNPJs salvo em {output_file}!")
    else:
        print("\nNenhum dado retornado da consulta.")

if __name__ == '__main__':
    query_cnpj_data_abertura()