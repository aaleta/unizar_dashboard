<script setup>
import subjects from '../../../data/json/processed/AsignaturasClasificadasOptTronc.json'

const coreSubjects = subjects.troncales["3"]
const optionalSubjects = subjects.optativas["3"]

const getDashboardLink = (code) => {
  return `/dashboard/${code}`
}
</script>

<template>
  <main class="page">

    <header class="hero">
      <h1>First Year</h1>
      <p>
        Select a subject to access its dashboard and statistics.
      </p>
    </header>

    <section class="section">
      <h2 class="section-title core-title">
        Core Subjects
      </h2>

      <div class="subjects-grid">
        <article
          v-for="subject in coreSubjects"
          :key="subject.code"
          class="subject-card core"
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
    </section>

    <section class="section" v-if="optionalSubjects.length">

      <h2 class="section-title optional-title">
        Optional Subjects
      </h2>

      <div class="subjects-grid">

        <article
          v-for="subject in optionalSubjects"
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

    </section>

  </main>
</template>

<style scoped>

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

.core-title{

    color:#38bdf8;
}

.optional-title{

    color:#f59e0b;
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

.core{

    background:linear-gradient(
        135deg,
        #0f4c81,
        #2563eb
    );
}

.optional{

    background:linear-gradient(
        135deg,
        #92400e,
        #f59e0b
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