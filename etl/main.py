from scrape import deputados, senadores 
from download import siconv
from transform import merge 
from query import cnpj 

def main():
    
    print('[etl] Executando scripts de ETL.')
    
    # extract
    deputados.scrape_deputados_partidos()
    senadores.scrape_senadores_partidos()
    siconv.download_siconv_files()
    cnpj.query_cnpj_data_abertura()
    
    # transform
    merge.gerar_consolidado_investigativo()
    
    # load 
    
    
    
if __name__ == '__main__':
    main()