import requests
from tqdm import tqdm
import os

def download(url, name):
    try:
        header = requests.head(url, allow_redirects=True)
        tamanho_remoto = int(header.headers.get('content-length', 0))
    except:
        tamanho_remoto = 0

    if os.path.exists(name):
        if tamanho_remoto > 0 and os.path.getsize(name) == tamanho_remoto:
            print(f"[etl][skip] '{name}' já está 100% baixado.")
            return

    resposta = requests.get(url, stream=True)
    
    print(f"[etl][download] Baixando '{name}'")
    
    data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", name)
    
    with open(data_dir, 'wb') as f:
        with tqdm(total=tamanho_remoto, unit='iB', unit_scale=True, colour='green') as barra:
            for dados in resposta.iter_content(1024):
                if dados:
                    f.write(dados)
                    barra.update(len(dados))

    print(f"[etl][download] '{name}' salvo com sucesso!")
    
def download_siconv_files():
    download('https://repositorio.dados.gov.br/seges/detru/siconv_pagamento.csv.zip', 'siconv_pagamento.csv.zip')
    download('https://repositorio.dados.gov.br/seges/detru/siconv_programa_proponentes.csv.zip', 'siconv_programa_proponentes.csv.zip')
    download('https://repositorio.dados.gov.br/seges/detru/siconv_emenda.csv.zip', 'siconv_emenda.csv.zip')
    download('https://repositorio.dados.gov.br/seges/detru/siconv_convenio.csv.zip', 'siconv_convenio.csv.zip')
    download('https://repositorio.dados.gov.br/seges/detru/siconv_convenio.csv.zip', 'proponentes.csv.zip')
    
if __name__ == '__main__':
    download_siconv_files()