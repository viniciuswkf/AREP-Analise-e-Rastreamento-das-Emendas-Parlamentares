import os
import sqlite3
import pandas as pd


def criar_pagamentos_tabela():
    
    table_name = 'pagamentos'
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.normpath(os.path.join(base_dir, "..", "data", 'siconv_consolidado_parlamentares.csv'))
    
    db_file = os.path.normpath(os.path.join(base_dir, "..", "data", 'emendas.db'))
    
    df = pd.read_csv(data_path, sep=';', decimal=',', encoding='utf-8-sig')

    conn = sqlite3.connect(db_file)

    print(f"[etl][load] Exportando para a tabela '{table_name}' no banco {db_file}...")

    df.to_sql(table_name, conn, if_exists='replace', index=False)

    conn.close()
    print("[etl][load] Sucesso! O banco de dados foi criado.")

if __name__ == "__main__":
    criar_pagamentos_tabela()