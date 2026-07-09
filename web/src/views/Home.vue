<template>

    <main class="home">

        <section class="hero">

            <h1>
                Dashboard Física Unizar
            </h1>

            <p>
                Aquí aparecerán las estadistícas globales
            </p>

        </section>

    </main>

</template>

<script setup>

</script>

<style scoped>

.home{

    min-height:100vh;

    display:flex;

    justify-content:center;
    align-items:center;

    padding:60px;

    background:#111216;

}

.hero{

    max-width:900px;

    text-align:center;

}

.hero h1{

    font-size:clamp(3rem,7vw,5.5rem);

    color:white;

    margin-bottom:30px;

    font-weight:700;

    letter-spacing:2px;

}

.hero p{

    color:#b8b8b8;

    font-size:1.2rem;

    line-height:1.8;

    margin-bottom:50px;

}
</style>