<template>

    <aside class="sidebar">

        <div class="logo">
            Menú
        </div>

        <nav>

            <RouterLink to="/">
                <p>Inicio</p>
            </RouterLink>

            <RouterLink to="/firstYear">
                <p>1º</p>
            </RouterLink>

            <RouterLink to="/secondYear">
                <p>2º</p>
            </RouterLink>

            <RouterLink to="/thirdYear">
                <p>3º</p>
            </RouterLink>

            <RouterLink to="/forthYear">
                <p>4º</p>
            </RouterLink>

            <RouterLink to="/Optional">
                <p>Optativas</p>
            </RouterLink>

        </nav>

    </aside>

</template>

<script setup>
</script>

<style scoped>

.sidebar{

    position:fixed;

    top:0;
    left:0;

    width:220px;
    height:100vh;

    display:flex;
    flex-direction:column;

    background:#111827;

    border-right:1px solid rgba(255,255,255,.08);

    box-shadow:8px 0 25px rgba(0,0,0,.35);

    z-index:1000;

}

.logo{

    height:80px;

    display:flex;
    justify-content:center;
    align-items:center;

    color:white;

    font-size:1.6rem;
    font-weight:700;

    letter-spacing:2px;

    border-bottom:1px solid rgba(255,255,255,.08);

}

nav{

    display:flex;

    flex-direction:column;

    gap:8px;

    padding:20px 12px;

}

nav a{

    display:flex;

    align-items:center;

    padding:14px 18px;

    border-radius:12px;

    text-decoration:none;

    color:#d1d5db;

    transition:.2s;

}

nav a p{

    margin:0;

    font-size:1rem;

    font-weight:500;

}

nav a:hover{

    background:rgba(255,255,255,.08);

    color:white;

}

.router-link-active{

    background:rgba(56,189,248,.18);

    color:white;

    border-left:4px solid #38bdf8;

}

/* ========================= */
/*          MÓVIL            */
/* ========================= */

@media (max-width:768px){

    .sidebar{

        top:auto;
        bottom:0;
        left:0;

        width:100%;
        height:70px;

        flex-direction:row;

        border-right:none;
        border-top:1px solid rgba(255,255,255,.08);

        box-shadow:0 -8px 20px rgba(0,0,0,.35);

    }

    .logo{

        display:none;

    }

    nav{

        width:100%;

        padding:0;

        flex-direction:row;

        justify-content:space-around;

        align-items:center;

        gap:0;

    }

    nav a{

        flex:1;

        height:70px;

        justify-content:center;
        align-items:center;

        padding:0;

        border-radius:0;

    }

    nav a p{

        font-size:.85rem;

        text-align:center;

    }

    .router-link-active{

        border-left:none;

        border-top:4px solid #38bdf8;

        background:rgba(56,189,248,.18);

    }

}

</style>