<script setup>
import subjects from '../../../data/json/processed/AsignaturasClasificadasOptTronc.json'

const coreSubjects = subjects.troncales["1"]


const getDashboardLink = (code) => {
  return `/dashboard/${code}`
}

const getYearDashboardLink = (course) => {
  return `/dashboardYear/${course}`
}
</script>

<template>
  <main class="page">

    <header class="hero">
      <h1>Primero</h1>
      <p>
        Elige una asignatura para acceder al dashboard particular.
      </p>

        <RouterLink
            :to="getYearDashboardLink(1)"
            class="year-dashboard-button"
        >
            Accede al dashboard del curso →
        </RouterLink>
    </header>

    <section class="section">
      <h2 class="section-title core-title">
        Troncales
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

  </main>
</template>

<style scoped>

.page{

    margin-left:220px;

    padding:50px;

    min-height:100vh;

    box-sizing:border-box;

    overflow-x:hidden;

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

.subjects-grid{

    display:grid;

    grid-template-columns:repeat(auto-fit,minmax(320px,1fr));

    gap:25px;

    width:100%;

}

.subject-card{

    min-width:0;

    padding:25px;

    border-radius:18px;

    transition:.25s;

    backdrop-filter:blur(10px);

}

.subject-card:hover{

    transform:translateY(-6px);

    box-shadow:0 12px 30px rgba(0,0,0,.25);

}

.core{

    background:linear-gradient(
        135deg,
        #0f4c81,
        #2563eb
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
        margin-bottom:70px;      /* espacio para la barra inferior */

        padding:20px 16px;

    }

    .hero{

        margin-bottom:35px;

    }

    .hero h1{

        font-size:2rem;

        line-height:1.2;

    }

    .hero p{

        font-size:1rem;

    }

    .section{

        margin-bottom:40px;

    }

    .section-title{

        font-size:1.4rem;

        margin-bottom:18px;

    }

    .subjects-grid{

        grid-template-columns:1fr;

        gap:18px;

    }

    .subject-card{

        padding:20px;

        border-radius:16px;

    }

    .subject-card h3{

        font-size:1.05rem;

    }

    .code{

        margin-bottom:18px;

        font-size:.9rem;

    }

    .dashboard-button{

        width:100%;

        text-align:center;

        padding:12px;

        box-sizing:border-box;

    }

    .year-dashboard-button{

        display:block;

        width:100%;

        text-align:center;

        padding:14px;

        box-sizing:border-box;

    }

}

.year-dashboard-button{

    display:inline-block;

    margin-top:22px;

    padding:14px 24px;

    border-radius:14px;

    background:#38bdf8;

    color:white;

    text-decoration:none;

    font-weight:700;

    transition:.25s;

    box-shadow:0 8px 20px rgba(56,189,248,.25);

}

.year-dashboard-button:hover{

    background:#0ea5e9;

    transform:translateY(-2px);

    box-shadow:0 12px 28px rgba(56,189,248,.35);

}

</style>