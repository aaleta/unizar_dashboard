<script setup>
import { computed } from "vue";

const props = defineProps({
    selectedSubjects: {
        type: Array,
        required: true
    }
});

const emit = defineEmits([
    "update:selectedSubjects"
]);

const hasSubjects = computed(() => props.selectedSubjects.length > 0);

function resetSelection() {
    emit("update:selectedSubjects", []);
}

function removeSubject(code) {
    const updated = props.selectedSubjects.filter(
        subject => subject.code !== code
    );

    emit("update:selectedSubjects", updated);
}
</script>

<template>

    <section class="summary-panel">

        <h3>Asignaturas Elegidas</h3>

        <button
            class="reset-button"
            @click="resetSelection"
            :disabled="!hasSubjects"
        >
            Reset
        </button>

        <div
            v-if="hasSubjects"
            class="subject-list"
        >

            <div
                v-for="subject in selectedSubjects"
                :key="subject.code"
                class="subject-item"
            >

                <div class="subject-info">
                    <span class="subject-code">
                        {{ subject.code }}
                    </span>

                    <span class="subject-name">
                        {{ subject.name }}
                    </span>
                </div>

                <button
                    class="remove-button"
                    @click="removeSubject(subject.code)"
                >
                    ✕
                </button>

            </div>

        </div>

        <p
            v-else
            class="empty-message"
        >
            No hay asignaturas elegidas.
        </p>

    </section>

</template>

<style scoped>

.summary-panel{

    display:flex;

    flex-direction:column;

    gap:1rem;

    background:rgba(10,20,45,.85);

    border:1px solid rgba(0,170,255,.35);

    border-radius:12px;

    padding:1rem;

    box-shadow:
        0 0 18px rgba(0,170,255,.15);

}

.summary-panel h3{

    margin:0;

    color:#6bc9ff;

    text-align:center;

    text-shadow:0 0 8px rgba(0,170,255,.5);

}

.reset-button{

    padding:.7rem;

    border:none;

    border-radius:8px;

    cursor:pointer;

    background:#009dff;

    color:white;

    font-weight:600;

    transition:.2s;

}

.reset-button:hover:not(:disabled){

    background:#00b7ff;

    box-shadow:0 0 12px rgba(0,170,255,.5);

}

.reset-button:disabled{

    opacity:.5;

    cursor:not-allowed;

}

.subject-list{

    display:flex;

    flex-direction:column;

    gap:.6rem;

    max-height:320px;

    overflow-y:auto;

}

.subject-item{

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:.6rem .8rem;

    background:rgba(255,255,255,.05);

    border:1px solid rgba(0,170,255,.2);

    border-radius:8px;

}

.subject-info{

    display:flex;

    flex-direction:column;

    min-width:0;

}

.subject-code{

    color:#62c5ff;

    font-weight:bold;

}

.subject-name{

    color:white;

    font-size:.92rem;

    overflow:hidden;

    text-overflow:ellipsis;

    white-space:nowrap;

}

.remove-button{

    width:34px;

    height:34px;

    border:none;

    border-radius:50%;

    background:#ff4d6d;

    color:white;

    font-size:1rem;

    cursor:pointer;

    transition:.2s;

    flex-shrink:0;

}

.remove-button:hover{

    background:#ff6784;

    transform:scale(1.08);

}

.empty-message{

    margin:0;

    text-align:center;

    color:#9cb8d6;

    font-style:italic;

}

.subject-list::-webkit-scrollbar{

    width:6px;

}

.subject-list::-webkit-scrollbar-thumb{

    background:#009dff;

    border-radius:10px;

}

</style>