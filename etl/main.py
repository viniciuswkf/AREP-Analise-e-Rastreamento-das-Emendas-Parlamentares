from scrape import deputados, senadores 

def main():
    
    print('[etl] Executando scripts de ETL.')
    
    deputados.scrape_deputados_partidos()
    senadores.scrape_senadores_partidos()
    
if __name__ == '__main__':
    main()