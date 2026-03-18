from scrape import deputados, senadores 
from download import siconv
from transform import merge 
from query import cnpj 
from load import db 

def main():
    # Esses dados estão todos atualizados (a cada 24h)
    
    print('[etl] Executando scripts de ETL.')
    
    # extract
    deputados.scrape_deputados_partidos()
    senadores.scrape_senadores_partidos()
    siconv.download_siconv_files()
    cnpj.query_cnpj_data_abertura()
    
    # transform
    merge.gerar_consolidado_investigativo()
    
    # load 
    db.criar_pagamentos_tabela()

if __name__ == '__main__':
    main()