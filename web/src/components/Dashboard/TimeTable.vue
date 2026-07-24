<script setup>
import { computed } from "vue";

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

const props = defineProps({

    events: {
        type: Array,
        required: true
    },

    // Optional: lets the grid highlight the same
    // events that show up in the collision list
    collisions: {
        type: Array,
        default: () => []
    }

});

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const days = [
    { id:1, name:"Monday" },
    { id:2, name:"Tuesday" },
    { id:3, name:"Wednesday" },
    { id:4, name:"Thursday" },
    { id:5, name:"Friday" }
];

const hours = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00"
];

/*
|--------------------------------------------------------------------------
| Convert time to grid position
|--------------------------------------------------------------------------
*/

function timeToIndex(time){
    return hours.indexOf(time);
}

/*
|--------------------------------------------------------------------------
| Events in each cell
|--------------------------------------------------------------------------
*/

function getEvents(day,hour){
    return props.events.filter(event => {
        return (
            event.day === day &&
            event.start === hour
        );
    });
}

/*
|--------------------------------------------------------------------------
| Event height
|--------------------------------------------------------------------------
|
| Example:
|
| 09:00 - 11:00
|
| occupies two rows
|
|--------------------------------------------------------------------------
*/

function eventHeight(event){
    const start = timeToIndex(event.start);
    const end = timeToIndex(event.end);

    return (end-start)*60;
}

/*
|--------------------------------------------------------------------------
| Collision lookup
|--------------------------------------------------------------------------
*/

function eventKey(event){
    return `${event.code}|${event.group}|${event.day}|${event.start}`;
}

const collidingKeys = computed(() => {
    const keys = new Set();

    props.collisions.forEach(collision => {
        keys.add(eventKey(collision.first));
        keys.add(eventKey(collision.second));
    });

    return keys;
});

function isColliding(event){
    return collidingKeys.value.has(eventKey(event));
}

/*
|--------------------------------------------------------------------------
| Subject colour coding
|--------------------------------------------------------------------------
|
| Every subject gets a stable colour (derived from its
| own code) so simultaneous classes are easy to tell
| apart at a glance, even without opening the sidebar.
|
*/

function subjectHue(code){
    let hash = 0;
    const str = String(code);

    for(let i=0;i<str.length;i++){
        hash = (hash*31 + str.charCodeAt(i)) % 360;
    }

    return hash;
}

function eventStyle(event){
    const height = eventHeight(event)+'px';

    if(isColliding(event)){
        return {
            height,
            background: "linear-gradient(135deg, rgba(255,90,120,0.45), rgba(180,20,60,0.6))",
            borderColor: "#ff4264",
            boxShadow: "0 0 14px rgba(255,60,100,0.55)"
        };
    }

    const hue = subjectHue(event.code);

    return {
        height,
        background: `linear-gradient(135deg, hsla(${hue},80%,58%,0.4), hsla(${hue},80%,32%,0.6))`,
        borderColor: `hsl(${hue},80%,58%)`,
        boxShadow: `0 0 12px hsla(${hue},80%,55%,0.45)`
    };
}
</script>

<template>
<div class="timetable">

    <h3>
        Timetable
    </h3>

    <!-- Scrolls both ways: the grid has a minimum width,
         and this keeps the header pinned while scrolling down -->
    <div class="grid-container">

        <div class="grid">

            <!-- Empty corner -->
            <div class="corner"></div>

            <!-- Days header -->
            <div
                v-for="day in days"
                :key="day.id"
                class="day-header"
            >
                {{day.name}}
            </div>

            <!-- Hours + cells -->
            <template
                v-for="hour in hours"
                :key="hour"
            >

                <!-- Hour label -->
                <div class="hour">
                    {{hour}}
                </div>

                <!-- Day cells -->
                <div
                    v-for="day in days"
                    :key="day.id+'-'+hour"
                    class="cell"
                >

                    <div
                        v-for="event in getEvents(day.id,hour)"
                        :key="event.subject+event.start"
                        class="event"
                        :class="{ 'event--collision': isColliding(event) }"
                        :style="eventStyle(event)"
                    >

                        <strong>
                            {{event.subject}}
                        </strong>

                        <small>
                            {{event.semester}}
                        </small>

                    </div>

                </div>

            </template>

        </div>

    </div>

</div>
</template>

<style scoped>

.timetable {
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
        1px solid rgba(0,150,255,0.35);
    border-radius: 12px;
    box-shadow:
        0 0 15px rgba(0,150,255,0.25);
    overflow: hidden;
    color: white;
}

h3 {
    flex-shrink: 0;
    margin: 0 0 0.75rem;
    color: #4db8ff;
    text-shadow:
        0 0 10px rgba(0,150,255,0.8);
}

/*
Wrapper that actually owns the scrolling.
This was previously defined in CSS but never
used in the markup, so the grid had nowhere
to scroll and simply got clipped.
*/

.grid-container {
    flex: 1;
    min-height: 0;
    width: 100%;
    overflow: auto;
    border-radius: 8px;
}

/*
The grid should never shrink too much
*/

.grid {
    min-width: 900px;
    display: grid;
    grid-template-columns:
        70px repeat(5,1fr);
    border:
        1px solid rgba(0,150,255,0.3);
}

.corner {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 3;
    background: #0d1b30;
}

.day-header {
    position: sticky;
    top: 0;
    z-index: 2;
    padding: 0.7rem;
    text-align: center;
    font-weight: bold;
    background: #10233f;
    color: #8dd8ff;
    border-left:
        1px solid rgba(0,150,255,0.2);
}

.hour {
    position: sticky;
    left: 0;
    z-index: 1;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #0d1b30;
    color: #b8d7ef;
    font-size: 0.8rem;
    border-top:
        1px solid rgba(255,255,255,0.08);
}

.cell {
    min-height: 60px;
    position: relative;
    border-left:
        1px solid rgba(255,255,255,0.08);
    border-top:
        1px solid rgba(255,255,255,0.08);
}

.event {
    position: absolute;
    left: 4px;
    right: 4px;
    padding: 0.4rem;
    box-sizing: border-box;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid transparent;
    font-size: 0.75rem;
    transition: box-shadow 0.2s ease, transform 0.15s ease;
}

.event:hover {
    transform: translateY(-1px);
    z-index: 1;
}

.event--collision {
    z-index: 2;
    animation: pulse-danger 1.6s ease-in-out infinite;
}

@keyframes pulse-danger {
    0%, 100% { box-shadow: 0 0 12px rgba(255,60,100,0.45); }
    50% { box-shadow: 0 0 20px rgba(255,60,100,0.85); }
}

.event strong {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.event small {
    color: #cceeff;
}

/* scrollbar */

.grid-container::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.grid-container::-webkit-scrollbar-thumb {
    background: #009dff;
    border-radius: 10px;
}

/* Mobile — matches Sidebar.vue's breakpoint, where the
   permanent nav collapses into a bottom bar */

@media(max-width:768px){

    .grid {
        min-width: 750px;
    }

}

</style>