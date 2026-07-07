import pandas as pd


df = pd.read_excel("../data/xlsx_csv/notas.xlsx")

df.to_json(
    "../data/json/Notas.json",
    orient="records",
    force_ascii=False,
    indent=4
)

df = pd.read_csv("../data/xlsx_csv/resultados.csv", sep=";")

df.to_json(
    "../data/json/Resultados.json",
    orient="records",
    force_ascii=False,
    indent=4
)



