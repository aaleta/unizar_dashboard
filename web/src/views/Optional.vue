<script setup>
import { ref, computed } from 'vue'
import subjects from '../../../data/json/processed/AsignaturasClasificadasOptTronc.json'

//Merge the subjects from 3 and 4 and eliminates the duplicated subjects
const optionalSubjects = [
  ...new Map(
    [...subjects.optativas["3"], ...subjects.optativas["4"]]
      .map(subject => [subject.code, subject])
  ).values()
]

const search = ref('')

const normalize = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const filteredSubjects = computed(() => {
  const query = normalize(search.value.trim())

  if (!query) return optionalSubjects

  return optionalSubjects.filter(subject =>
    normalize(subject.name).includes(query)
  )
})

const getDashboardLink = (code) => {
  return `/dashboard/${code}`
}
</script>

<template>
  <main class="page">

    <header class="hero">
      <h1>Asignaturas Optativas</h1>
      <p>
        Busca o selecciona una asignatura para acceder a su dashboard.
      </p>
    </header>

    <section class="section">

      <div class="search-container">
        <input
          v-model="search"
          type="text"
          class="search-input"
          placeholder="Buscar asignatura..."
        >
      </div>

      <h2 class="section-title optional-title">
        Optativas
      </h2>

      <div
        v-if="filteredSubjects.length"
        class="subjects-grid"
      >
        <article
          v-for="subject in filteredSubjects"
          :key="subject.code"
          class="subject-card optional"
        >
          <h3>{{ subject.name }}</h3>

          <p class="code">
            Code: {{ subject.code }}
          </p>

          <RouterLink
            :to="getDashboardLink(subject.code)"
            class="dashboard-button"
          >
            Open Dashboard →
          </RouterLink>
        </article>
      </div>

      <p
        v-else
        class="no-results"
      >
        No se ha encontrado ninguna asignatura.
      </p>

    </section>

  </main>
</template>

<style scoped>

.search-container{
    margin-bottom:30px;
}

.search-input{
    width:100%;
    max-width:500px;

    padding:14px 18px;

    border:none;
    outline:none;

    border-radius:14px;

    font-size:1rem;

    background:#1e293b;
    color:white;

    transition:.2s;
}

.search-input::placeholder{
    color:#94a3b8;
}

.search-input:focus{
    box-shadow:0 0 0 3px rgba(192,132,252,.35);
}

.no-results{
    margin-top:20px;
    color:#94a3b8;
    font-style:italic;
}

.page{
    margin-left:90px;
    padding:50px;
    min-height:100vh;

    background:#0f172a;
    color:white;
}

.hero{
    margin-bottom:60px;
}

.hero h1{
    font-size:3rem;
    font-weight:700;
    margin-bottom:12px;
}

.hero p{
    color:#94a3b8;
    font-size:1.1rem;
}

.section{
    margin-bottom:60px;
}

.section-title{
    margin-bottom:25px;
    font-size:1.8rem;
    font-weight:600;
}

.optional-title{
    color:#c084fc;
}

.subjects-grid{
    display:grid;
    grid-template-columns:
        repeat(auto-fill,minmax(320px,1fr));
    gap:25px;
}

.subject-card{
    padding:25px;
    border-radius:18px;
    transition:.25s;
    backdrop-filter:blur(10px);
}

.subject-card:hover{
    transform:translateY(-6px);
    box-shadow:
        0 12px 30px rgba(0,0,0,.25);
}

.optional{
    background:linear-gradient(
        135deg,
        #6d28d9,
        #9333ea
    );
}

.subject-card h3{
    font-size:1.15rem;
    margin-bottom:14px;
}

.code{
    opacity:.8;
    margin-bottom:25px;
}

.dashboard-button{
    display:inline-block;
    padding:10px 18px;
    border-radius:10px;
    background:white;
    color:#111827;
    font-weight:600;
    text-decoration:none;
    transition:.2s;
}

.dashboard-button:hover{
    transform:scale(1.05);
}

@media(max-width:768px){

    .page{
        margin-left:0;
        padding:25px;
    }

    .hero h1{
        font-size:2.2rem;
    }

}

</style>