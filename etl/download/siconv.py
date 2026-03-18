import os
import requests
from tqdm import tqdm
import zipfile
import time

def extract_and_cleanup(name):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.normpath(os.path.join(base_dir, "..", "data"))
    zip_path = os.path.join(data_dir, name)

    if not os.path.exists(zip_path):
        return False

    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            internal_files = zip_ref.namelist()
            csv_files = [f for f in internal_files if f.endswith('.csv')]
            if not csv_files: return False
            
            file_to_extract = csv_files[0]
            zip_ref.extract(file_to_extract, data_dir)
            print(f"[etl][extract] {file_to_extract} extraído!")
        
        os.remove(zip_path)
        print(f"[etl][cleanup] {name} removido.")
        return True
    except zipfile.BadZipFile:
        print(f"[etl][error] Zip corrompido: {name}")
        os.remove(zip_path)
        return False

def download(url, name):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.normpath(os.path.join(base_dir, "..", "data"))
    data_path = os.path.join(data_dir, name)
    os.makedirs(data_dir, exist_ok=True)

    # Verifica se o CSV já existe para evitar baixar o ZIP à toa
    expected_csv = name.replace('.zip', '')
    if os.path.exists(os.path.join(data_dir, expected_csv)):
        print(f"[etl][skip] CSV '{expected_csv}' já existe.")
        return False # Retorna False para não tentar extrair o que não baixou

    while True:
        try:
            header = requests.head(url, allow_redirects=True, timeout=10)
            tamanho_total = int(header.headers.get('content-length', 0))
            tamanho_local = os.path.getsize(data_path) if os.path.exists(data_path) else 0

            if tamanho_total > 0 and tamanho_local >= tamanho_total:
                return True

            headers = {'Range': f'bytes={tamanho_local}-'} if tamanho_local > 0 else {}
            
            with requests.get(url, headers=headers, stream=True, timeout=20) as r:
                if r.status_code == 416:
                    os.remove(data_path)
                    continue
                
                r.raise_for_status()
                mode = 'ab' if 'Content-Range' in r.headers else 'wb'
                
                with open(data_path, mode) as f:
                    with tqdm(total=tamanho_total, initial=tamanho_local, unit='iB', 
                              unit_scale=True, colour='green', desc=name) as barra:
                        for chunk in r.iter_content(chunk_size=256 * 1024):
                            if chunk:
                                f.write(chunk)
                                barra.update(len(chunk))
                
                if os.path.getsize(data_path) >= tamanho_total:
                    return True

        except (requests.exceptions.RequestException, ConnectionResetError):
            print(f"\n[etl][retry] Erro em '{name}'. Retomando em 5s...")
            time.sleep(5)
            continue

def download_siconv_files():
    files = [
        ('https://repositorio.dados.gov.br/seges/detru/siconv_pagamento.csv.zip', 'siconv_pagamento.csv.zip'),
        ('https://repositorio.dados.gov.br/seges/detru/siconv_convenio.csv.zip', 'siconv_convenio.csv.zip'),
        ('https://repositorio.dados.gov.br/seges/detru/siconv_emenda.csv.zip', 'siconv_emenda.csv.zip'),
        ('https://repositorio.dados.gov.br/seges/detru/siconv_proposta.csv.zip', 'siconv_proposta.csv.zip')
    ]
    
    for url, name in files:
        # Se baixar ou se o ZIP já estiver lá (mas o CSV não), extrai
        if download(url, name):
            extract_and_cleanup(name)

if __name__ == '__main__':
    download_siconv_files()