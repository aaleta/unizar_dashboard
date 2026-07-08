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

# Treatment of data

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

    subject_data = {
        "code": code,
        "name": subject["name"]
    }

    if courses == {"0"}:

        for course in ["1", "2", "3", "4"]:
            classified_subjects["optativas"][course].append(subject_data)

        continue

    if "0" in courses:

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

#Hasta aquí solo lee notas.xlsx