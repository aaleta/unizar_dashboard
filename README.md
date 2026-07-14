# Unizar Dashboard

Fuente de los datos:

	- Notas: https://estudios.unizar.es/informe/resultados-academicos?estudio_id=20250124
	- Resultados: https://zaguan.unizar.es/collection/opendata-academico-rendimiento-asignatura-titulacion?ln=en

Los datos de la web se extraen todos de notas.xlsx menos los de informacion de la asignatura, que se extraen directamente de la web. Notas.xlsx está un poco desactualizado, en la web solo deja seleccionar los años para los cuales hay datos

Para actualizar la web: uv run ./Scripts/Updater.py 
--> ./web: npm run build, npm run deploy