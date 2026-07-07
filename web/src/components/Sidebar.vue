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

            <RouterLink to="/pagina2">
                <p>2º</p>
            </RouterLink>

            <RouterLink to="/pagina3">
                <p>3º</p>
            </RouterLink>

            <RouterLink to="/pagina4">
                <p>4º</p>
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
    left:-230px;

    width:250px;
    height:100vh;

    display:flex;
    flex-direction:column;

    backdrop-filter:blur(20px);
    -webkit-backdrop-filter:blur(20px);

    background:rgba(20,20,25,.80);

    border-right:1px solid rgba(255,255,255,.08);

    box-shadow:15px 0 40px rgba(0,0,0,.45);

    transition:.45s cubic-bezier(.22,1,.36,1);

    z-index:9999;

}

/* Zona para detectar el ratón */

.sidebar::before{

    content:"";

    position:absolute;

    top:0;
    right:-25px;

    width:25px;
    height:100%;

}

.sidebar:hover{

    left:0;

}

.logo{

    height:90px;

    display:flex;
    justify-content:center;
    align-items:center;

    font-size:28px;
    font-weight:700;

    color:white;

    letter-spacing:3px;

    border-bottom:1px solid rgba(255,255,255,.08);

}

nav{

    display:flex;

    flex-direction:column;

    margin-top:25px;

}

nav a{

    display:flex;

    align-items:center;

    gap:18px;

    margin:6px 15px;

    padding:15px 20px;

    border-radius:14px;

    text-decoration:none;

    color:#d6d6d6;

    transition:.30s;

    position:relative;

    overflow:hidden;

}

nav a span{

    font-size:22px;

}

nav a p{

    margin:0;

    font-size:17px;

}

nav a::before{

    content:"";

    position:absolute;

    left:0;
    top:0;

    width:5px;
    height:100%;

    background:#4fa9ff;

    transform:scaleY(0);

    transition:.25s;

}

nav a:hover{

    background:rgba(255,255,255,.08);

    color:white;

    transform:translateX(8px);

}

nav a:hover::before{

    transform:scaleY(1);

}

.router-link-active{

    background:rgba(79,169,255,.15);

    color:white;

}

.router-link-active::before{

    transform:scaleY(1);

}

</style>