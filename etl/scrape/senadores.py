import os
import pandas as pd
import requests
from scrape.util import remover_acentos

SENADO_API_URL = "https://legis.senado.leg.br/dadosabertos/senador/lista/atual"

def scrape_senadores_partidos():
    try: 
        request = requests.get(SENADO_API_URL, headers={
        "Accept": "application/json"
        })
        
        response = request.json()
        
        senadores = response['ListaParlamentarEmExercicio']['Parlamentares']['Parlamentar']
        
        colunas_interesse = {
            'IdentificacaoParlamentar.CodigoParlamentar': 'CODIGO',
            'IdentificacaoParlamentar.NomeParlamentar': 'NOME',
            'IdentificacaoParlamentar.SiglaPartidoParlamentar': 'PARTIDO',
            'IdentificacaoParlamentar.UfParlamentar': 'UF',
            'IdentificacaoParlamentar.EmailParlamentar': 'EMAIL',
            'IdentificacaoParlamentar.UrlFotoParlamentar': 'FOTO',
        }
        
        df = pd.json_normalize(senadores)
        
        df = df[colunas_interesse.keys()].rename(columns=colunas_interesse)
        
        df['NOME'] = df['NOME'].str.upper().apply(remover_acentos)
        
        data_name = "senadores.csv"
        
        data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", data_name)
            
        df.to_csv(data_dir, index=False, encoding='utf-8-sig', sep=';')

        print("[etl][scrape] Dados dos senadores baixados.")
        
    except Exception as e: 
        exit(f"[etl][scrape] Erro: Não foi possível baixar os dados dos senadores. {e} ")


if __name__ == "__main__":
    test = scrape_senadores_partidos()  