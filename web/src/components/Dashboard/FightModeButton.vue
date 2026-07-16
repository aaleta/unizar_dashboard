<script setup>

import { RouterLink } from "vue-router";

</script>

<template>

<div class="panel">


    <h2>

        Fight Mode

    </h2>

    <RouterLink
        to="/fight-mode"
        class="fightButton"
    >

        Entrar al Fight Mode →

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
    align-items:center;
    justify-content:center;
    text-align:center;

    background:
        linear-gradient(
            145deg,
            #2b0f13,
            #1a1d2c
        );

    border:2px solid rgba(239,68,68,.35);

    border-radius:22px;

    box-shadow:
        0 15px 35px rgba(0,0,0,.35);

    transition:.25s;

}

.panel:hover{

    transform:translateY(-6px);

    border-color:#ef4444;

    box-shadow:
        0 0 25px rgba(239,68,68,.35),
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

.fightButton{

    display:inline-flex;

    justify-content:center;
    align-items:center;

    padding:14px 28px;

    border-radius:999px;

    background:#ef4444;

    color:white;

    text-decoration:none;

    font-weight:700;

    font-size:1rem;

    transition:.25s;

    box-shadow:
        0 8px 20px rgba(239,68,68,.35);
    
    margin-top: 10%;

}

.fightButton:hover{

    background:#dc2626;

    transform:scale(1.05);

}

</style>