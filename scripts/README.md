# scripts/

`updater.py` turns the source spreadsheets in `data/xlsx_csv/` into the JSON
files the site imports, and scrapes the university's public pages for teaching
guides, timetables and exam dates.

Run it whenever the source documents change:

```sh
uv run updater.py
```

It must be run from this directory — every path inside is relative to it.
Requires Python >=3.14; dependencies are declared in `pyproject.toml`.

The converters fail loudly rather than write an incomplete JSON: a CSV with
missing columns, or one whose contents disagree with the academic year in its
filename, stops the run. Scrapers overwrite the years they fetch, so
re-running is safe.

What each step reads and writes, and how the hand-maintained catalogue
(`data/json/asignaturas.json`) is structured, is documented in
[`../docs/DEVELOPER_GUIDE.md`](../docs/DEVELOPER_GUIDE.md#6-the-data-pipeline).
</content>
