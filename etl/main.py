from scrape import deputados, senadores 
from download import siconv

def main():
    
    print('[etl] Executando scripts de ETL.')
    
    deputados.scrape_deputados_partidos()
    senadores.scrape_senadores_partidos()
    siconv.download_siconv_files()
    
if __name__ == '__main__':
    main()