import pandas as pd
import json
from pathlib import Path

# Conversion to Json
df = pd.read_excel("../data/xlsx_csv/notas.xlsx")

df.to_json(
    "../data/json/NotasRaw.json",
    orient="records",
    force_ascii=False,
    indent=4
)

df = pd.read_csv("../data/xlsx_csv/resultados.csv", sep=";")

df.to_json(
    "../data/json/ResultadosRaw.json",
    orient="records",
    force_ascii=False,
    indent=4
)

# Treatment of data (this makes the files AsigPorCurs.json and AsigClasTroncOpt with the information of notasraw.json,
# it overwrites the information of this files when executed)#########################################################

input_file = Path("../data/json/NotasRaw.json")
output_file = Path("../data/json/processed/AsignaturasPorCurso.json")

with open(input_file, "r", encoding="utf-8") as f:
    data = json.load(f)

subjects_by_course = {
    "0": [],
    "1": [],
    "2": [],
    "3": [],
    "4": []
}

seen_subjects = set()

for subject in data:

    course = str(subject["Curso"])
    name = subject["Asignatura"].strip()
    code = subject["Código"]

    key = (course, code)

    if key in seen_subjects:
        continue

    subjects_by_course[course].append({
        "code": code,
        "name": name
    })

    seen_subjects.add(key)

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(
        subjects_by_course,
        f,
        ensure_ascii=False,
        indent=4
    )

input_file = Path("../data/json/processed/AsignaturasPorCurso.json")
output_file = Path("../data/json/processed/AsignaturasClasificadasOptTronc.json")

output_file.parent.mkdir(parents=True, exist_ok=True)

with open(input_file, "r", encoding="utf-8") as f:
    subjects_by_course = json.load(f)

subjects = {}

for course, subject_list in subjects_by_course.items():

    for subject in subject_list:

        code = subject["code"]

        if code not in subjects:
            subjects[code] = {
                "name": subject["name"],
                "courses": []
            }

        subjects[code]["courses"].append(course)

classified_subjects = {
    "troncales": {
        "1": [],
        "2": [],
        "3": [],
        "4": []
    },
    "optativas": {
        "1": [],
        "2": [],
        "3": [],
        "4": []
    }
}


for code, subject in subjects.items():

    courses = set(subject["courses"])

    academic_years = {

        row["Curso Académico"]

        for row in data

        if row["Código"] == code

    }

    subject_data = {

        "code": code,

        "name": subject["name"]

    }


    if "0" in courses:

        if len(academic_years) < 5:
            continue

        if courses == {"0"}:

            for course in ["1", "2", "3", "4"]:

                classified_subjects["optativas"][course].append(subject_data)

        else:

            for course in ["1", "2", "3", "4"]:

                if course in courses:

                    classified_subjects["optativas"][course].append(subject_data)

    else:

        for course in ["1", "2", "3", "4"]:

            if course in courses:

                classified_subjects["troncales"][course].append(subject_data)

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(
        classified_subjects,
        f,
        ensure_ascii=False,
        indent=4
    )

######################################################################################





# Scraper of teachers and guides (it searchs in the web the teachers and guides of each subject each academic year and
# writes it in Prof_Gu.json, you have to select the year that you want to apend)
import requests
from bs4 import BeautifulSoup
import json
import time
import os 

def obtener_datos_asignaturas():
    resultados = []
    
    # Select the years that you want to search into
    anhos = [] 
    
    id_inicio = 26900
    id_fin = 26958
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    }

    for anho in anhos:
        print(f"\n--- Consultando curso académico {anho}-{int(anho)+1} ---")
        
        estudio_id = f"{anho}0124" 
        
        for asig_id in range(id_inicio, id_fin + 1):
            url = "https://estudios.unizar.es/estudio/asignatura"
            params = {
                'anyo_academico': anho,
                'asignatura_id': asig_id,
                'estudio_id': estudio_id,
                'centro_id': '100',
                'plan_id_nk': '447' #Plan selected (447 (extinted) or 719 (new plan))
            }
            
            try:
                response = requests.get(url, params=params, headers=headers)
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Nombre de la asignatura
                    h3_tag = soup.find('h3')
                    nombre_asignatura = h3_tag.text.strip() if h3_tag else f"Asignatura_{asig_id}"
                    
                    profesores = []
                    guia_docente_web = None
                    guia_docente_pdf = None
                    
                    tabla = soup.find('table', id='w0')
                    
                    if tabla:
                        filas = tabla.find_all('tr')
                        for fila in filas:
                            th = fila.find('th')
                            td = fila.find('td')
                            
                            if th and td:
                                th_texto = th.text.strip().lower()
                                
                                if 'profesores' in th_texto:
                                    enlaces_profesores = td.find_all('a')
                                    for a in enlaces_profesores:
                                        nombre_prof = a.text.strip()
                                        if nombre_prof:
                                            profesores.append(nombre_prof)
                                
                                elif 'guia docente' in th_texto or 'guía docente' in th_texto:
                                    enlaces_guia = td.find_all('a')
                                    for a in enlaces_guia:
                                        texto_enlace = a.text.strip().lower()
                                        href = a.get('href')
                                        if href:
                                            href_limpio = href.strip().replace(" ", "")
                                            
                                            if 'web' in texto_enlace:
                                                guia_docente_web = href_limpio
                                            elif 'pdf' in texto_enlace:
                                                guia_docente_pdf = href_limpio
                    
                    resultados.append({
                        "anyo_academico": f"{anho}-{int(anho)+1}",
                        "id_asignatura": asig_id,
                        "asignatura": nombre_asignatura,
                        "profesores": profesores if profesores else ["No asignados / No encontrados"],
                        "guia_docente_web": guia_docente_web if guia_docente_web else "No disponible",
                        "guia_docente_pdf": guia_docente_pdf if guia_docente_pdf else "No disponible"
                    })
                    print(f"Procesada: ID {asig_id} ({nombre_asignatura})")
                
                elif response.status_code == 404:
                    print(f"La asignatura con ID {asig_id} no existe para el año {anho}.")
                else:
                    print(f"Error {response.status_code} al consultar la asignatura ID {asig_id}.")
                    
            except Exception as e:
                print(f"Error procesando la asignatura con ID {asig_id}: {e}")
            
            time.sleep(1) 

    return resultados

def guardar_json(datos_nuevos, ruta):
    try:
        datos_finales = []
        
        if os.path.exists(ruta):
            try:
                with open(ruta, 'r', encoding='utf-8') as f:
                    datos_finales = json.load(f)
                    if not isinstance(datos_finales, list):
                        datos_finales = []
            except (json.JSONDecodeError, ValueError):
                print(f"Advertencia: El archivo {ruta} estaba corrupto o vacío. Se creará uno nuevo.")
                datos_finales = []
        
        #Avoid duplicates
        diccionario_datos = {
            (d["anyo_academico"], d["id_asignatura"]): d for d in datos_finales
        }
        
        #New data
        for dato in datos_nuevos:
            clave = (dato["anyo_academico"], dato["id_asignatura"])
            diccionario_datos[clave] = dato  # Si ya existía, se sobreescribe con el más reciente
            
        
        datos_finales = list(diccionario_datos.values())
        
        
        with open(ruta, 'w', encoding='utf-8') as f:
            json.dump(datos_finales, f, ensure_ascii=False, indent=4)
            
        print(f"\nProceso completado.")
        print(f"- Registros nuevos/actualizados en esta tanda: {len(datos_nuevos)}")
        print(f"- Total de asignaturas guardadas en el JSON: {len(datos_finales)}")
        print(f"Archivo guardado en: {ruta}")
        
    except Exception as e:
        print(f"Error al escribir el archivo JSON: {e}")

if __name__ == "__main__":
    ruta_salida = '../data/json/processed/Profesores_GuiasDoc.json'
    
    datos_completos = obtener_datos_asignaturas()
    if datos_completos:
        guardar_json(datos_completos, ruta_salida)
    else:
        print("\nNo se extrajeron datos nuevos para guardar en cuanto a profesores o guias docentes.")
