import os
import requests
from tqdm import tqdm

def download(url, name):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.normpath(os.path.join(base_dir, "..", "data", name))
    os.makedirs(os.path.dirname(data_path), exist_ok=True)

    try:
        header = requests.head(url, allow_redirects=True, timeout=10)
        tamanho_total = int(header.headers.get('content-length', 0))
    except:
        tamanho_total = 0

    tamanho_local = os.path.getsize(data_path) if os.path.exists(data_path) else 0
    
    if tamanho_total > 0 and tamanho_local >= tamanho_total:
        print(f"[etl][download] '{name}' já completo. Pulando...")
        return

    headers = {'Range': f'bytes={tamanho_local}-'} if 0 < tamanho_local < tamanho_total else {}
    mode = 'ab' if 'Range' in headers else 'wb'

    try:
        with requests.get(url, headers=headers, stream=True, timeout=30) as r:
            if r.status_code == 200 and 'Range' in headers:
                mode = 'wb'
                tamanho_local = 0
            
            r.raise_for_status()
            
            with open(data_path, mode) as f:
                with tqdm(
                    total=tamanho_total, 
                    initial=tamanho_local,
                    unit='iB', 
                    unit_scale=True, 
                    colour='green',
                    desc=f"[edl][download] {name}" 
                ) as barra:
                    for chunk in r.iter_content(chunk_size=128 * 1024):
                        if chunk:
                            f.write(chunk)
                            barra.update(len(chunk))
    except Exception as e:
        print(f"[etl][error] '{name}': {e}")

def download_siconv_files():
    files = [
        ('https://repositorio.dados.gov.br/seges/detru/siconv_pagamento.csv.zip', 'siconv_pagamento.csv.zip'),
        ('https://repositorio.dados.gov.br/seges/detru/siconv_programa_proponentes.csv.zip', 'siconv_programa_proponentes.csv.zip'),
        ('https://repositorio.dados.gov.br/seges/detru/siconv_emenda.csv.zip', 'siconv_emenda.csv.zip'),
        ('https://repositorio.dados.gov.br/seges/detru/siconv_convenio.csv.zip', 'siconv_convenio.csv.zip'),
        ('https://repositorio.dados.gov.br/seges/detru/siconv_proponentes.csv.zip', 'siconv_proponentes.csv.zip')
    ]
    
    for url, name in files:
        download(url, name)

if __name__ == '__main__':
    download_siconv_files()