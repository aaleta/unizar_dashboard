<script setup>

const props = defineProps({

    years: Array,

    modelValue: String

});

const emit = defineEmits([

    "update:modelValue"

]);

</script>

<template>

<div class="selectorContainer">

    <label>

        Año académico

    </label>

    <select
        :value="modelValue"
        @change="emit('update:modelValue', $event.target.value)"
    >

        <option
            v-for="year in years"
            :key="year"
            :value="year"
        >

            {{ year }}

        </option>

    </select>

</div>

</template>

<style scoped>

.selectorContainer{

    display:flex;

    justify-content:flex-end;

    align-items:center;

    gap:12px;

    margin-bottom:30px;

}

label{

    color:white;

    font-weight:600;

}

select{

    padding:10px 14px;

    border-radius:10px;

    border:1px solid #334155;

    background:#1f2937;

    color:white;

    font-size:.95rem;

    cursor:pointer;

}

select:focus{

    outline:none;

    border-color:#38bdf8;

}

@media(max-width:768px){

    .selectorContainer{

        justify-content:center;

        flex-direction:column;

        gap:10px;

    }

    select{

        width:100%;

        max-width:260px;

    }

}

</style>