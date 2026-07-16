<script setup>

import { ref, onMounted } from "vue";
import FightPanel from "@/components/Dashboard/FightPanel.vue";
import FightModeResult from "@/components/Dashboard/FightModeResult.vue";

const showIntro = ref(true);

const fightResult = ref(null)

onMounted(() => {

    setTimeout(() => {

        showIntro.value = false;

    }, 1050);

});

const startFight = (fighters) => {

    fightResult.value = fighters;

};


</script>

<template>

<div class="fightPage">

    <Transition
        name="introFade"
        mode="out-in"
    >

        <div
            v-if="showIntro"
            class="introOverlay"
            key="intro"
        >

            <img
                src="@/assets/fightIntro.gif"
                alt="Fight Mode"
            >

        </div>

        <div
            v-else
            class="fightContent"
            key="panel"
        >

            <FightPanel @fight="startFight"/>

            <FightModeResult
                v-if="fightResult"
                :fighter1="fightResult.first"
                :fighter2="fightResult.second"
            />

        </div>

    </Transition>

</div>

</template>

<style scoped>

.fightPage{

    width:100%;
    min-height:100vh;

    background:#000;

}


.introOverlay{

    position:fixed;

    inset:0;

    z-index:9999;

    display:flex;

    justify-content:center;

    align-items:center;

    background:black;

}

.introOverlay img{

    width:100vw;

    height:100vh;

    object-fit:cover;

}



.fightContent{

    min-height:100vh;

    display:flex;

    flex-direction:column;

    align-items:center;

    gap:40px;

    padding:40px;

}



.introFade-enter-active,
.introFade-leave-active{

    transition:opacity .6s ease;

}

.introFade-enter-from,
.introFade-leave-to{

    opacity:0;

}

</style>