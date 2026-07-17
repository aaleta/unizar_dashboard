<template>

<div class="panel">

    <h2>

        Red de Profesores

    </h2>

    <p>

        Consulta de forma visual la cantidad de asignaturas que imparten los profesores y las relaciones entre ellos.

    </p>

    <RouterLink
        to="/ProfWeb"
        class="panelButton"
    >

        Ir a la red

    </RouterLink>

</div>

</template>

<style scoped>

.panel{

    width:100%;
    max-width:520px;

    min-height:320px;

    padding:28px;

    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    text-align:center;

    background:
        linear-gradient(
            145deg,
            #14213d,
            #1e293b
        );

    border:2px solid rgba(59,130,246,.25);

    border-radius:22px;

    box-shadow:
        0 15px 35px rgba(0,0,0,.35);

    transition:.25s;

}

.panel:hover{

    transform:translateY(-6px);

    border-color:#3b82f6;

    box-shadow:
        0 0 25px rgba(59,130,246,.25),
        0 18px 40px rgba(0,0,0,.45);

}

.icon{

    font-size:4rem;

    margin-bottom:18px;

}

h2{

    margin:0;

    color:white;

    font-size:2rem;

    font-weight:700;

}

p{

    margin:20px 0 30px;

    color:#cbd5e1;

    line-height:1.7;

    max-width:360px;

}

.panelButton{

    display:inline-flex;

    justify-content:center;
    align-items:center;

    padding:14px 28px;

    border-radius:999px;

    background:#2563eb;

    color:white;

    text-decoration:none;

    font-weight:700;

    transition:.25s;

    box-shadow:
        0 8px 20px rgba(37,99,235,.35);

}

.panelButton:hover{

    background:#1d4ed8;

    transform:scale(1.05);

}

@media(max-width:768px){

    .panel{

        max-width:100%;

        min-height:auto;

        padding:24px 20px;

        border-radius:18px;

    }

    .icon{

        font-size:3rem;

        margin-bottom:14px;

    }

    h2{

        font-size:1.6rem;

    }

    p{

        max-width:100%;

        font-size:.95rem;

        margin:16px 0 24px;

    }

    .panelButton{

        width:100%;

        padding:14px;

        box-sizing:border-box;

    }

}

</style>