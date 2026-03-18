import os 
import requests 
import pandas as pd 
from scrape.util import remover_acentos

CAMARA_API_URL = "https://dadosabertos.camara.leg.br/api/v2/deputados/"

def scrape_deputados_partidos():
    try:
        
        data_name = "deputados.csv"
        data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", data_name)
        
        if os.path.exists(data_dir):
            print(f"[edl][scrape] '{data_name}' já existe, pulando...")
            return    
        
        request = requests.get(CAMARA_API_URL, headers={
        'Accept': "application/json"
        })
        
        response = request.json()
        
        deputados = response['dados']
        
        df = pd.json_normalize(deputados)
        
        colunas_interesse = {
            'id': 'CODIGO',
            'nome': 'NOME',
            'siglaPartido': 'PARTIDO',
            'siglaUf': 'UF',
            'email': 'EMAIL',
            'urlFoto': 'FOTO'
        }
        
        df = df[colunas_interesse.keys()].rename(columns=colunas_interesse)
        
        df['NOME'] = df['NOME'].str.upper().apply(remover_acentos)
        
        
        os.makedirs(os.path.dirname(data_dir), exist_ok=True)
        
        df.to_csv(data_dir, index=False, encoding='utf-8-sig', sep=';')
        
        print("[etl][scrape] Dados dos deputados baixados.")
    except Exception as e:
        exit(f"[etl][scrape] Erro: Não foi possível baixar os dados dos deputados. {e} ")


if __name__ == '__main__':
    test = scrape_deputados_partidos()