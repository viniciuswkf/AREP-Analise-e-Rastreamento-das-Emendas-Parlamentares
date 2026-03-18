import pandas as pd
import os

def gerar_consolidado_investigativo():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.normpath(os.path.join(base_dir, "..", "data"))
    
    print("[etl][transform] Carregando bases do SICONV...")
    df_pgto = pd.read_csv(f"{data_dir}/siconv_pagamento.csv", sep=';', dtype=str,
                          usecols=['NR_MOV_FIN', 'NR_CONVENIO', 'IDENTIF_FORNECEDOR', 'NOME_FORNECEDOR', 'VL_PAGO', 'DATA_PAG'])

    # --- NOVO: Carregando dados de abertura dos fornecedores ---
    print("[etl][transform] Carregando datas de abertura de CNPJs...")
    path_abertura = f"{data_dir}/cnpj_data_abertura.csv"
    if os.path.exists(path_abertura):
        df_abertura = pd.read_csv(path_abertura, dtype=str)
    else:
        print(f"AVISO: Arquivo {path_abertura} não encontrado. Coluna de abertura ficará vazia.")
        df_abertura = pd.DataFrame(columns=['CNPJ', 'ABERTURA'])
    # -----------------------------------------------------------

    df_conv = pd.read_csv(f"{data_dir}/siconv_convenio.csv", sep=';', dtype=str,
                          usecols=['NR_CONVENIO', 'ID_PROPOSTA'])

    df_prop = pd.read_csv(f"{data_dir}/siconv_proposta.csv", sep=';', dtype=str,
                          usecols=['ID_PROPOSTA', 'NM_PROPONENTE', 'IDENTIF_PROPONENTE', 
                                   'MUNIC_PROPONENTE', 'UF_PROPONENTE'])

    df_emenda = pd.read_csv(f"{data_dir}/siconv_emenda.csv", sep=';', dtype=str,
                            usecols=['ID_PROPOSTA', 'NOME_PARLAMENTAR', 'NR_EMENDA'])

    df_emenda = df_emenda.dropna(subset=['NOME_PARLAMENTAR'])
    df_emenda = df_emenda[df_emenda['NOME_PARLAMENTAR'].str.strip() != ""]

    print("[etl][transform] Unificando base de Partidos...")
    df_dep = pd.read_csv(f"{data_dir}/deputados.csv", sep=';', dtype=str, usecols=['NOME', 'PARTIDO'])
    df_sen = pd.read_csv(f"{data_dir}/senadores.csv", sep=';', dtype=str, usecols=['NOME', 'PARTIDO'])
    
    df_politicos = pd.concat([df_dep, df_sen]).drop_duplicates(subset=['NOME'])
    df_politicos['NOME'] = df_politicos['NOME'].str.upper().str.strip()

    print("[etl][transform] Cruzando dados (Inner Joins)...")
    res = pd.merge(df_emenda, df_conv, on='ID_PROPOSTA', how='inner')
    res = pd.merge(res, df_pgto, on='NR_CONVENIO', how='inner')
    res = pd.merge(res, df_prop, on='ID_PROPOSTA', how='inner')

    # --- NOVO: Cruzamento com a data de abertura ---
    # Fazemos um merge à esquerda com base no IDENTIF_FORNECEDOR
    res = pd.merge(res, df_abertura, left_on='IDENTIF_FORNECEDOR', right_on='CNPJ', how='left')
    # -----------------------------------------------

    res['NOME_PARLAMENTAR'] = res['NOME_PARLAMENTAR'].str.upper().str.strip()
    res = pd.merge(res, df_politicos, left_on='NOME_PARLAMENTAR', right_on='NOME', how='left')

    colunas_finais = {
        'NR_MOV_FIN': 'ID_MOVIMENTACAO',
        'NOME_PARLAMENTAR': 'PARLAMENTAR',
        'PARTIDO': 'PARTIDO',
        'NR_EMENDA': 'NUMERO_EMENDA',
        'NR_CONVENIO': 'NUMERO_CONVENIO',
        'NM_PROPONENTE': 'ENTIDADE',
        'IDENTIF_PROPONENTE': 'ENTIDADE_CNPJ',
        'MUNIC_PROPONENTE': 'ENTIDADE_MUNICIPIO',
        'UF_PROPONENTE': 'ENTIDADE_UF',
        'DATA_PAG': 'DATA_PAGAMENTO',
        'VL_PAGO': 'VALOR_PAGAMENTO',
        'NOME_FORNECEDOR': 'FORNECEDOR',
        'IDENTIF_FORNECEDOR': 'FORNECEDOR_CPF_CNPJ',
        'ABERTURA': 'FORNECEDOR_ABERTURA'  # Adicionado aqui
    }
    
    # Garantir que apenas colunas existentes sejam mapeadas (caso o csv de abertura falhe)
    colunas_presentes = [c for c in colunas_finais.keys() if c in res.columns]
    res = res.rename(columns=colunas_finais)
    res = res[[colunas_finais[c] for c in colunas_presentes]]
    
    res['PARTIDO'] = res['PARTIDO'].fillna('N/D')

    print("[etl][transform] Salvando consolidado...")
    output_path = f"{data_dir}/siconv_consolidado_parlamentares.csv"
    res.to_csv(output_path, index=False, sep=';', encoding='utf-8-sig')
    
    print(f"[etl][transform] Gerado: {output_path}")
    print(f"[etl][transform] Total: {len(res)} registros processados.")

if __name__ == '__main__':
    gerar_consolidado_investigativo()