<script setup>

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/
const props = defineProps({

    collisions: {
        type: Array,
        required:true
    }

});


/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/
const days = {
    1:"Monday",
    2:"Tuesday",
    3:"Wednesday",
    4:"Thursday",
    5:"Friday"
};

function dayName(day){
    return days[day] ?? "Unknown";
}

</script>

<template>
<div class="collision-list">

    <h3>
        Collisions
    </h3>

    <!-- No collisions -->
    <div
        v-if="collisions.length === 0"
        class="no-collisions"
    >
        No timetable conflicts detected
    </div>

    <!-- Collision list -->
    <div
        v-else
        class="collision-container"
    >

        <div
            v-for="(collision,index) in collisions"
            :key="index"
            class="collision"
        >

            <h4>
                Conflict {{index+1}}
            </h4>

            <div class="subjects">

                <div class="subject">

                    <strong>
                        {{collision.first.subject}}
                    </strong>

                    <span>
                        {{dayName(collision.first.day)}}
                        -
                        {{collision.first.start}}
                        to
                        {{collision.first.end}}
                    </span>

                </div>

                <div class="separator">
                    overlaps with
                </div>

                <div class="subject">

                    <strong>
                        {{collision.second.subject}}
                    </strong>

                    <span>
                        {{dayName(collision.second.day)}}
                        -
                        {{collision.second.start}}
                        to
                        {{collision.second.end}}
                    </span>

                </div>

            </div>

        </div>

    </div>

</div>
</template>

<style scoped>

.collision-list {
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    box-sizing: border-box;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    background:
        rgba(10,20,40,0.75);
    border:
        1px solid rgba(255,80,120,0.35);
    border-radius: 12px;
    box-shadow:
        0 0 15px rgba(255,80,120,0.25);
    color: white;
    overflow: hidden;
}

h3 {
    flex-shrink: 0;
    margin-top: 0;
    color: #ff7b9c;
    text-shadow:
        0 0 10px rgba(255,80,120,0.8);
}

.no-collisions {
    flex-shrink: 0;
    padding: 0.8rem;
    border-radius: 8px;
    background:
        rgba(0,200,120,0.15);
    border:
        1px solid rgba(0,255,150,0.4);
    font-size: 0.9rem;
}

/*
Was capped with a viewport-relative max-height (35vh),
which didn't adapt to however much room the sidebar
actually had left. Now it fills its flex parent and
scrolls internally when needed.
*/
.collision-container {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    overflow-y: auto;
}

.collision {
    width: 100%;
    flex-shrink: 0;
    box-sizing: border-box;
    padding: 0.8rem;
    border-radius: 10px;
    background:
        rgba(255,50,80,0.1);
    border-left:
        4px solid #ff4264;
}

.collision h4 {
    margin:
        0 0 0.5rem;
    color: #ff7696;
}

.subjects {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.subject {
    min-width: 0;
    padding: 0.6rem;
    border-radius: 8px;
    background:
        rgba(255,255,255,0.05);
}

.subject strong {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #8dd8ff;
}

.subject span {
    font-size: 0.8rem;
    color: #c2d8ef;
}

.separator {
    text-align: center;
    color: #ff7696;
    font-size: 0.8rem;
}

/* scrollbar */
.collision-container::-webkit-scrollbar {
    width: 6px;
}

.collision-container::-webkit-scrollbar-thumb {
    background: #ff4264;
    border-radius: 10px;
}

/* Mobile — matches Sidebar.vue's breakpoint, where the
   permanent nav collapses into a bottom bar */
@media(max-width:768px){

    .collision-list {
        height: auto;
    }

    .collision-container {
        flex: none;
        max-height: none;
    }

}

</style>