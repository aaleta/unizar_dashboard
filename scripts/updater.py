import pandas as pd
import json
import re
import unicodedata
from pathlib import Path

# Columnas que debe traer cada CSV de notas. Si la Universidad cambia el
# formato, mejor un error aquí que un JSON silenciosamente incompleto.
NOTAS_COLUMNS = [
    "Curso Académico", "Curso", "Código", "Asignatura",
    "No pre", "No pre %", "Sus", "Sus %", "Apr", "Apr %",
    "Not", "Not %", "Sob", "Sob %", "MH", "MH %", "Otr", "Otr %",
]


def convertir_notas():
    """
    Reparto de calificaciones: un CSV por curso académico en
    data/xlsx_csv/notas/ (2013_2014.csv, 2014_2015.csv…), todos con las mismas
    columnas. Se concatenan en un único notas_raw.json, que es lo que la web
    importa.
    """

    notas_dir = Path("../data/xlsx_csv/notas")

    csv_files = sorted(notas_dir.glob("*.csv"))

    if not csv_files:
        raise SystemExit(f"No hay CSV de notas en {notas_dir}")

    frames = []

    for csv_file in csv_files:

        df = pd.read_csv(csv_file, encoding="utf-8-sig")

        missing = set(NOTAS_COLUMNS) - set(df.columns)

        if missing:
            raise SystemExit(
                f"{csv_file.name}: faltan las columnas {sorted(missing)}"
            )

        # El nombre del fichero es el curso académico: si el contenido dice
        # otra cosa, alguien ha guardado el CSV en el año equivocado.
        curso_fichero = csv_file.stem.replace("_", "-")
        cursos_dentro = set(df["Curso Académico"].astype(str))

        if cursos_dentro != {curso_fichero}:
            raise SystemExit(
                f"{csv_file.name}: el fichero dice {curso_fichero} pero "
                f"contiene {sorted(cursos_dentro)}"
            )

        frames.append(df[NOTAS_COLUMNS])

    df = pd.concat(frames, ignore_index=True)

    # Algunos volcados traen espacios colgando en el nombre de la asignatura.
    df["Asignatura"] = df["Asignatura"].str.strip()

    df = df.sort_values(["Curso Académico", "Código"])

    df.to_json(
        "../data/json/notas_raw.json",
        orient="records",
        force_ascii=False,
        indent=4
    )

    print(
        f"Notas: {len(df)} filas, {len(csv_files)} cursos "
        f"({csv_files[0].stem.replace('_', '-')} a "
        f"{csv_files[-1].stem.replace('_', '-')})"
    )


# Los nombres de columna de notas_de_corte.xlsx han cambiado ya una vez
# ("Año" -> "año", "Nota media en pruebas de acceso" -> "nota_media_admision").
# La web no debe depender de cómo venga rotulada la hoja de cálculo, así que
# aquí se normalizan a nombres estables y en snake_case, como el resto de JSON.
CORTE_COLUMNS = {
    "año": "anyo",
    "ano": "anyo",
    "nota_media_admision": "nota_media_admision",
    "nota media en pruebas de acceso": "nota_media_admision",
    "nota de corte": "nota_corte",
    "nota_de_corte": "nota_corte",
}


def convertir_notas_de_corte():

    df = pd.read_excel("../data/xlsx_csv/notas_de_corte.xlsx")

    df = df.rename(columns={
        column: CORTE_COLUMNS[column.strip().lower()]
        for column in df.columns
        if column.strip().lower() in CORTE_COLUMNS
    })

    missing = {"anyo", "nota_media_admision", "nota_corte"} - set(df.columns)

    if missing:
        raise SystemExit(
            f"notas_de_corte.xlsx: no se reconocen las columnas {sorted(missing)}. "
            f"Encontradas: {list(df.columns)}. Añádelas a CORTE_COLUMNS."
        )

    df = df[["anyo", "nota_media_admision", "nota_corte"]].sort_values("anyo")

    df.to_json(
        "../data/json/notas_de_corte_raw.json",
        orient="records",
        force_ascii=False,
        indent=4
    )

    print(f"NotasDeCorte: {len(df)} cursos ({df['anyo'].min()}-{df['anyo'].max()})")


######################################################################################


def validar_catalogo():
    """
    El catálogo de asignaturas (data/json/asignaturas.json) se mantiene A MANO:
    qué asignaturas tiene el grado, de qué curso son y si son troncales u
    optativas es información del plan de estudios, no algo que deba deducirse
    de los datos de notas con reglas de filtrado. (Antes se deducía, y las
    optativas especiales de primero salían clasificadas como troncales.)

    Este paso solo COMPRUEBA que el catálogo y los datos siguen cuadrando, y
    avisa de los códigos nuevos que habría que catalogar a mano.
    """

    with open("../data/json/asignaturas.json", "r", encoding="utf-8") as f:
        catalogo = json.load(f)["asignaturas"]

    with open("../data/json/notas_raw.json", "r", encoding="utf-8") as f:
        notas = json.load(f)

    codigos_catalogo = {a["codigo"] for a in catalogo}

    anyos_por_codigo = {}
    info_por_codigo = {}

    for row in notas:
        codigo = int(row["Código"])
        anyos_por_codigo.setdefault(codigo, set()).add(row["Curso Académico"])
        info_por_codigo[codigo] = (row["Asignatura"], row["Curso"])

    # Un código sin catalogar solo es candidato si parece del plan (Curso 1-4)
    # o si es una optativa de la bolsa de la Universidad (Curso 0) con
    # recorrido: las de un par de años sueltos son ruido de la bolsa general.
    candidatos = [
        codigo
        for codigo, anyos in anyos_por_codigo.items()
        if codigo not in codigos_catalogo
        and (info_por_codigo[codigo][1] != 0 or len(anyos) >= 5)
    ]

    if candidatos:
        print("Catálogo: códigos con notas SIN catalogar (añadir a mano si son del grado):")
        for codigo in sorted(candidatos):
            nombre, curso = info_por_codigo[codigo]
            print(f"  {codigo} (curso {curso}): {nombre}")

    sin_datos = codigos_catalogo - set(anyos_por_codigo)

    if sin_datos:
        print(
            "Catálogo: códigos catalogados sin notas todavía "
            f"(normal en asignaturas nuevas): {sorted(sin_datos)}"
        )

    # Las parejas de oferta bienal deben apuntarse mutuamente: si una dice
    # alternarse con otra que no le corresponde, la ficha mentiría.
    por_codigo = {a["codigo"]: a for a in catalogo}

    for asignatura in catalogo:

        pareja = asignatura.get("se_alterna_con")

        if pareja is None:
            continue

        reciproco = por_codigo.get(pareja, {}).get("se_alterna_con")

        if reciproco != asignatura["codigo"]:
            raise SystemExit(
                f"Catálogo: {asignatura['codigo']} dice alternarse con {pareja}, "
                f"pero {pareja} no le corresponde (se_alterna_con={reciproco})"
            )

    troncales = sum(1 for a in catalogo if a["tipo"] == "troncal")
    optativas = sum(1 for a in catalogo if a["tipo"] == "optativa")

    print(f"Catálogo: {len(catalogo)} asignaturas ({troncales} troncales, {optativas} optativas)")


######################################################################################


# Official rates for the Physics degree (success/performance/evaluation rates and
# average number of exam sittings consumed), one CSV per academic year.
#
# Cada CSV trae TODA la universidad (~5.500 filas por curso), así que el filtrado
# a Física se hace aquí, al leer, y no se guarda ningún volcado intermedio: doce
# cursos completos serían decenas de MB en el repositorio para tirarlos después.
# (Por eso data/json/ResultadosRaw.json ya no se genera: era ese volcado, de un
# solo curso. Se puede borrar.)
#
# Las asignaturas se emparejan con su código por nombre, el único campo que
# comparten las dos fuentes.


def normalize_name(name):
    text = unicodedata.normalize("NFD", str(name).strip().lower())
    return "".join(c for c in text if unicodedata.category(c) != "Mn")


def normalize_study(name):
    """
    El rótulo del estudio no es estable a lo largo de los años: "Física" en los
    cursos antiguos, "Grado: Física" desde 2017-2018 y "1-Física" en algunos
    volcados. Se quita el prefijo y se compara el nombre pelado, siempre junto a
    TIPO_ESTUDIO == "Grado" para no confundirlo con el máster, el doctorado ni
    con el programa conjunto Física-Matemáticas, que es otra titulación.
    """
    text = re.sub(r"^\d+-", "", str(name).strip())
    text = re.sub(r"^(Grado|Máster|Doctorado):\s*", "", text)
    return normalize_name(text)


NUMERIC_FIELDS = [
    "CURSO_ACADEMICO",
    "TASA_EXITO",
    "TASA_RENDIMIENTO",
    "TASA_EVALUACION",
    "ALUMNOS_EVALUADOS",
    "ALUMNOS_SUPERADOS",
    "ALUMNOS_PRESENTADOS",
    "MEDIA_CONVOCATORIAS_CONSUMIDAS",
]

def procesar_resultados():

    rendimiento_dir = Path("../data/xlsx_csv/rendimiento")
    notas_file = Path("../data/json/notas_raw.json")
    output_file = Path("../data/json/processed/resultados_fisica.json")

    with open(notas_file, "r", encoding="utf-8") as f:
        notas = json.load(f)

    codes_by_name = {}

    for row in notas:
        codes_by_name.setdefault(normalize_name(row["Asignatura"]), row["Código"])

    physics_rows = []
    unmatched = set()

    csv_files = sorted(rendimiento_dir.glob("*.csv"))

    if not csv_files:
        raise SystemExit(f"No hay CSV de rendimiento en {rendimiento_dir}")

    for csv_file in csv_files:

        # Todo como texto y las columnas numéricas se convierten después, a mano.
        # Algunos volcados de la Universidad traen saltos de línea dentro del nombre
        # de la asignatura sin entrecomillar: eso parte el registro en dos y corre
        # todas las columnas. Son ~60 filas de 61.000 y ninguna es de Física, pero si
        # se deja que pandas deduzca el tipo, un solo curso contaminado convierte
        # CURSO_ACADEMICO en texto y el resto del proceso empieza a mentir en
        # silencio. Leyendo en texto, esas filas simplemente no pasan el filtro.
        rendimiento = pd.read_csv(
            csv_file,
            sep=";",
            encoding="utf-8-sig",
            dtype=str
        )

        fisica = rendimiento[
            (rendimiento["TIPO_ESTUDIO"] == "Grado")
            & (rendimiento["ESTUDIO"].map(normalize_study) == "fisica")
        ].copy()

        for field in NUMERIC_FIELDS:
            fisica[field] = pd.to_numeric(fisica[field], errors="coerce")

        fisica["CURSO_ACADEMICO"] = fisica["CURSO_ACADEMICO"].astype("Int64")

        for row in fisica.to_dict("records"):

            code = codes_by_name.get(normalize_name(row["ASIGNATURA"]))

            if code is None:
                unmatched.add(row["ASIGNATURA"].strip())
                continue

            physics_rows.append({
                "code": int(code),
                "anyo_academico": int(row["CURSO_ACADEMICO"]),
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

    # NaN no es JSON válido y json.dump lo escribiría como NaN a secas, que luego
    # revienta al importarlo. Un dato que falta es null, no cero.
    physics_rows = json.loads(
        pd.DataFrame(physics_rows).to_json(orient="records", force_ascii=False)
    )

    physics_rows.sort(key=lambda r: (r["anyo_academico"], r["code"]))

    years = sorted({row["anyo_academico"] for row in physics_rows})

    print(
        f"ResultadosFisica: {len(physics_rows)} filas, "
        f"{len(years)} cursos ({years[0]}-{years[-1]})"
    )

    if unmatched:
        print(f"  sin código (no están en las notas): {sorted(unmatched)}")

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

    with open("../data/json/processed/resultados_fisica.json", "r", encoding="utf-8") as f:
        resultados_fisica = json.load(f)

    frescura = {
        "notas": {
            "label": "Calificaciones por asignatura",
            "ultimo_curso": ultimo("../data/json/notas_raw.json", "Curso Académico"),
            "fuente": "https://estudios.unizar.es/informe/resultados-academicos?estudio_id=20250124",
        },
        "resultados": {
            "label": "Tasas oficiales de rendimiento",
            "ultimo_curso": curso(max(r["anyo_academico"] for r in resultados_fisica)),
            # La fecha de la fila más reciente, no la de la primera: ahora hay
            # doce cursos y el orden es ascendente, así que la primera fila es
            # la más ANTIGUA y daría una fecha de actualización falsa.
            "actualizado": max(
                resultados_fisica,
                key=lambda r: r["anyo_academico"]
            )["fecha_actualizacion"],
            "fuente": "https://zaguan.unizar.es/collection/opendata-academico-rendimiento-asignatura-titulacion?ln=en",
        },
        "notas_corte": {
            "label": "Notas de corte y de acceso",
            "ultimo_curso": str(ultimo("../data/json/notas_de_corte_raw.json", "anyo")),
            "fuente": "https://estudios.unizar.es/",
        },
        "guias": {
            "label": "Profesorado y guías docentes",
            "ultimo_curso": ultimo(
                "../data/json/processed/profesores_guias_doc.json", "anyo_academico"
            ),
            "fuente": "https://estudios.unizar.es/",
        },
        "horarios": {
            "label": "Horarios y fechas de examen",
            "ultimo_curso": curso_de_publicacion(),
            "fuente": BASE_PUBLICACION,
        },
    }

    with open("../data/json/processed/data_freshness.json", "w", encoding="utf-8") as f:
        json.dump(frescura, f, ensure_ascii=False, indent=4)

    print("DataFreshness:", {k: v["ultimo_curso"] for k, v in frescura.items()})



######################################################################################


# Horarios de clase y fechas de examen, de la publicación del centro.
#
# El centro publica cada curso académico bajo un identificador propio
# (2627 = curso 2026-2027). Al cambiar de curso solo hay que actualizar
# PUBLICACION: la URL, el JSON y la frescura salen de ahí.

PUBLICACION = "2627"
TITULACION = "447"
BASE_PUBLICACION = f"http://155.210.84.118/publicacion/{PUBLICACION}"


def curso_de_publicacion():
    """'2627' -> '2026-2027'."""
    inicio = 2000 + int(PUBLICACION[:2])
    return f"{inicio}-{inicio + 1}"


def descargar_horario(curso, grupo, semestre):
    respuesta = requests.post(
        f"{BASE_PUBLICACION}/horarios/tabla/series",
        json={
            "curso": curso,
            "grupo": grupo,
            "periodo": semestre,
            "__curso": f"{TITULACION}-1",
            "__grupo": grupo,
            "__periodo": semestre,
        },
    )
    respuesta.raise_for_status()

    # Pausa entre peticiones para no martillear el servidor del centro.
    time.sleep(1)

    # La respuesta envuelve las clases en {"status", "message", "data"}.
    return respuesta.json()["data"]


def actualizar_horario():

    bloques = []

    for anyo in range(1, 5):

        # Cuarto solo tiene un grupo de teoría; el resto tienen dos.
        grupos = [0] if anyo == 4 else [0, 1]

        for grupo in grupos:
            for semestre in ("S1", "S2"):
                bloques.append(descargar_horario(
                    f"{TITULACION}-{anyo}",
                    f"{TITULACION}-{anyo}-{grupo}",
                    semestre,
                ))
                print(f"Horario: curso {anyo}, grupo {grupo}, {semestre} descargado")

    eventos = []
    vistos = set()

    # "Asignatura" no es decorativo: una asignatura que se imparte en dos
    # idiomas viene dos veces, con el mismo código y el mismo grupo pero con
    # su título en cada idioma ("26937 Gravitación y cosmología" y
    # "26937 Gravitation and cosmology", ambas en 447-3-6, la segunda con
    # código interno negativo). El título es lo único que las distingue, y la
    # web monta con él el selector de versión.
    for bloque in bloques:
        for clase in bloque:

            try:
                evento = {
                    "Asignatura": clase["title"],
                    "TipoActividad": clase["actividad"],
                    "Curso-Grupo": "-".join(clase["subgrupo"].split("-")[:3]),
                    "Semestre": clase["periodo_de_clases"],
                    "HoraIni": clase["h_ini"],
                    "HoraFin": clase["h_fin"],
                    "Dia": clase["wday"],
                }
            except KeyError:
                # Filas decorativas de la tabla (cabeceras, huecos) que no
                # describen una clase.
                continue

            # El servidor repite series entre peticiones (el mismo
            # laboratorio aparece al pedir cada grupo): sin esto el JSON
            # sale con filas duplicadas y la web pintaría la clase dos veces.
            clave = json.dumps(evento, sort_keys=True, ensure_ascii=False)

            if clave in vistos:
                continue

            vistos.add(clave)
            eventos.append(evento)

    with open("../data/json/processed/horarios.json", "w", encoding="utf-8") as f:
        json.dump(eventos, f, indent=4, ensure_ascii=False)

    print(f"Horario: {len(eventos)} clases guardadas ({curso_de_publicacion()})")


def es_fecha(texto):
    """Comprueba si un texto tiene formato dd-mm-yyyy."""
    return bool(re.match(r"\d{2}-\d{2}-\d{4}", texto))


def actualizar_examenes():

    respuesta = requests.get(f"{BASE_PUBLICACION}/examenes/listado/titulacion?id={TITULACION}")
    respuesta.raise_for_status()

    soup = BeautifulSoup(respuesta.text, "html.parser")

    resultado = {}

    # Una pestaña por convocatoria (tab-E1, tab-E2, tab-E3…).
    for container in soup.find_all("div", class_="tab-container"):

        examenes = []
        tabla = container.find("table", class_="listado-examenes")

        if tabla is not None:

            # La tabla mezcla dos tipos de fila: la primera de cada asignatura
            # trae curso y nombre, y las siguientes solo la fecha de otra
            # sesión. Curso y asignatura se arrastran de la última fila
            # completa vista.
            curso_actual = None
            asignatura_actual = None

            for fila in tabla.find_all("tr"):

                valores = [
                    celda.get_text(strip=True)
                    for celda in fila.find_all("td")
                ]

                if not valores:
                    continue

                if len(valores) >= 3 and not es_fecha(valores[0]):
                    curso_actual = valores[0]
                    asignatura_actual = valores[1]
                    fecha = valores[2]
                elif es_fecha(valores[0]):
                    fecha = valores[0]
                else:
                    continue

                examenes.append({
                    "curso": curso_actual,
                    "asignatura": asignatura_actual,
                    "fecha_examen": fecha,
                })

        resultado[container.get("id")] = examenes

    with open("../data/json/processed/examenes.json", "w", encoding="utf-8") as f:
        json.dump(resultado, f, indent=4, ensure_ascii=False)

    print(
        "Exámenes:",
        {convocatoria: len(examenes) for convocatoria, examenes in resultado.items()},
    )


if __name__ == "__main__":

    # Conversión de datos locales (sin red).
    convertir_notas()
    convertir_notas_de_corte()
    procesar_resultados()
    validar_catalogo()

    # Scrapers (necesitan red).
    ruta_salida = '../data/json/processed/profesores_guias_doc.json'

    datos_completos = obtener_datos_asignaturas()
    if datos_completos:
        guardar_json(datos_completos, ruta_salida)
    else:
        print("\nNo se extrajeron datos nuevos para guardar en cuanto a profesores o guias docentes.")

    actualizar_horario()
    actualizar_examenes()

    # Siempre al final: necesita todos los ficheros ya escritos.
    escribir_frescura()
