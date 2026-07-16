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

    padding:22px;

    background:#1e293b;

    border-radius:18px;

    border:1px solid rgba(255,255,255,.08);

    box-shadow:0 10px 25px rgba(0,0,0,.25);

    transition:.25s;

    box-sizing:border-box;

    margin-bottom: 90px;

    text-align: center;


}

.panel:hover{

    transform:translateY(-6px);

    border-color:#ef4444;

    box-shadow:
        0 0 25px rgba(239,68,68,.35),
        0 18px 40px rgba(0,0,0,.45);

}


h2{

    margin:30px;

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
    
    margin-top: 0;

}

.fightButton:hover{

    background:#dc2626;

    transform:scale(1.05);

}

@media(max-width:768px){

    .panel{

        width:100%;
        max-width:520px;

        padding:22px;

        background:#1e293b;

        border-radius:18px;

        border:1px solid rgba(255,255,255,.08);

        box-shadow:0 10px 25px rgba(0,0,0,.25);

        transition:.25s;

        box-sizing:border-box;

    }

    .icon{

        font-size:3rem;

        margin-bottom:14px;

    }

    h2{

        font-size:1.6rem;

        line-height:1.2;

    }

    p{

        margin:16px 0 24px;

        max-width:100%;

        font-size:.95rem;

        line-height:1.6;

    }

    .fightButton{

        width:100%;

        margin-top:0;

        padding:14px;

        font-size:1rem;

        box-sizing:border-box;

    }

}
</style>