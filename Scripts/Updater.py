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

df = pd.read_excel("../data/xlsx_csv/Notas_de_corte.xlsx")

df.to_json(
    "../data/json/NotasDeCorteRaw.json",
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


# Official rates for the Physics degree (success/performance/evaluation rates and
# average number of exam sittings consumed). ResultadosRaw.json holds every degree
# in the university (~3.5 MB), so only the Physics rows are kept: the web imports
# this file directly and must not carry the whole university in its bundle.
# Subjects are matched to their code by name, the only field both sources share.

import unicodedata

input_file = Path("../data/json/ResultadosRaw.json")
notas_file = Path("../data/json/NotasRaw.json")
output_file = Path("../data/json/processed/ResultadosFisica.json")

STUDY = "Grado: Física"


def normalize_name(name):
    text = unicodedata.normalize("NFD", str(name).strip().lower())
    return "".join(c for c in text if unicodedata.category(c) != "Mn")


with open(input_file, "r", encoding="utf-8") as f:
    resultados = json.load(f)

with open(notas_file, "r", encoding="utf-8") as f:
    notas = json.load(f)

codes_by_name = {}

for row in notas:
    codes_by_name.setdefault(normalize_name(row["Asignatura"]), row["Código"])

physics_rows = []
unmatched = []

for row in resultados:

    if row["ESTUDIO"] != STUDY:
        continue

    code = codes_by_name.get(normalize_name(row["ASIGNATURA"]))

    if code is None:
        unmatched.append(row["ASIGNATURA"])
        continue

    physics_rows.append({
        "code": code,
        "anyo_academico": row["CURSO_ACADEMICO"],
        "asignatura": row["ASIGNATURA"].strip(),
        "clase": row["CLASE_ASIGNATURA"],
        "tasa_exito": row["TASA_EXITO"],
        "tasa_rendimiento": row["TASA_RENDIMIENTO"],
        "tasa_evaluacion": row["TASA_EVALUACION"],
        "alumnos_evaluados": row["ALUMNOS_EVALUADOS"],
        "alumnos_superados": row["ALUMNOS_SUPERADOS"],
        "alumnos_presentados": row["ALUMNOS_PRESENTADOS"],
        "media_convocatorias": row["MEDIA_CONVOCATORIAS_CONSUMIDAS"],
        "fecha_actualizacion": row["FECHA_ACTUALIZACION"],
    })

print(f"ResultadosFisica: {len(physics_rows)} filas")

if unmatched:
    print(f"  sin código (no están en notas.xlsx): {unmatched}")

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(
        physics_rows,
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

######################################################################################


# Freshness of each dataset, so the web can state how up to date it is instead of
# hardcoding a year in the page. Each source is updated on its own schedule, so a
# single "datos de 2024-2025" claim on the home page was wrong for three of them.

def escribir_frescura():

    def ultimo(path, key, transform=lambda v: v):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        values = {transform(row[key]) for row in data if row.get(key) is not None}
        return max(values) if values else None

    def curso(year):
        return f"{year}-{year + 1}"

    with open("../data/json/processed/ResultadosFisica.json", "r", encoding="utf-8") as f:
        resultados_fisica = json.load(f)

    frescura = {
        "notas": {
            "label": "Calificaciones por asignatura",
            "ultimo_curso": ultimo("../data/json/NotasRaw.json", "Curso Académico"),
            "fuente": "https://estudios.unizar.es/informe/resultados-academicos?estudio_id=20250124",
        },
        "resultados": {
            "label": "Tasas oficiales de rendimiento",
            "ultimo_curso": curso(max(r["anyo_academico"] for r in resultados_fisica)),
            "actualizado": resultados_fisica[0]["fecha_actualizacion"],
            "fuente": "https://zaguan.unizar.es/collection/opendata-academico-rendimiento-asignatura-titulacion?ln=en",
        },
        "notas_corte": {
            "label": "Notas de corte y de acceso",
            "ultimo_curso": str(ultimo("../data/json/NotasDeCorteRaw.json", "Año")),
            "fuente": "https://estudios.unizar.es/",
        },
        "guias": {
            "label": "Profesorado y guías docentes",
            "ultimo_curso": ultimo(
                "../data/json/processed/Profesores_GuiasDoc.json", "anyo_academico"
            ),
            "fuente": "https://sia.unizar.es/",
        },
    }

    with open("../data/json/processed/DataFreshness.json", "w", encoding="utf-8") as f:
        json.dump(frescura, f, ensure_ascii=False, indent=4)

    print("DataFreshness:", {k: v["ultimo_curso"] for k, v in frescura.items()})


if __name__ == "__main__":
    ruta_salida = '../data/json/processed/Profesores_GuiasDoc.json'

    datos_completos = obtener_datos_asignaturas()
    if datos_completos:
        guardar_json(datos_completos, ruta_salida)
    else:
        print("\nNo se extrajeron datos nuevos para guardar en cuanto a profesores o guias docentes.")

    # Siempre al final: necesita todos los ficheros ya escritos.
    escribir_frescura()
