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

    // Optional: lets the calendar highlight days where two
    // different subjects share the same exam date
    collisions: {
        type: Array,
        default: () => []
    },

    // Currently active convocatoria ("all" | "tab-E1" | ...), used
    // only to build a friendlier subtitle
    convocatoria: {
        type: String,
        default: "all"
    }

});

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const monthNames = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

// Monday-first, since exams (unlike classes) can fall on a Saturday
const weekDayLabels = ["L","M","X","J","V","S","D"];

/*
|--------------------------------------------------------------------------
| Date parsing ("DD-MM-YYYY" -> {day, month, year, key})
|--------------------------------------------------------------------------
*/

function parseDate(dateStr) {
    const [day, month, year] = dateStr.split("-").map(Number);
    return {
        day,
        month,
        year,
        key: `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`
    };
}

/*
|--------------------------------------------------------------------------
| Parsed events + grouping by day
|--------------------------------------------------------------------------
*/

const parsedEvents = computed(() => {
    return props.events.map(event => ({
        ...event,
        ...parseDate(event.date)
    }));
});

const eventsByDate = computed(() => {
    const map = {};

    parsedEvents.value.forEach(event => {
        if (!map[event.key]) map[event.key] = [];
        map[event.key].push(event);
    });

    return map;
});

function getEventsForDay(year, month, day) {
    const key = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return eventsByDate.value[key] || [];
}

/*
|--------------------------------------------------------------------------
| Months to render, sorted chronologically
|--------------------------------------------------------------------------
*/

const monthsPresent = computed(() => {
    const map = new Map();

    parsedEvents.value.forEach(event => {
        const mKey = `${event.year}-${String(event.month).padStart(2,"0")}`;

        if (!map.has(mKey)) {
            map.set(mKey, {
                year: event.year,
                month: event.month,
                convocatorias: new Set()
            });
        }

        map.get(mKey).convocatorias.add(event.convocatoria);
    });

    return Array.from(map.values()).sort(
        (a,b) => a.year - b.year || a.month - b.month
    );
});

/*
|--------------------------------------------------------------------------
| Build a Monday-first calendar grid for a given year/month
|--------------------------------------------------------------------------
|
| Returns an array of weeks, each an array of 7 cells that are
| either a day number (1..N) or null for the leading/trailing
| blanks outside the month.
|
*/

function buildMonthGrid(year, month) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstWeekday = new Date(year, month - 1, 1).getDay(); // 0=Sun..6=Sat
    const leadingBlanks = (firstWeekday + 6) % 7; // 0=Mon..6=Sun

    const cells = [];

    for (let i = 0; i < leadingBlanks; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
    }

    return weeks;
}

/*
|--------------------------------------------------------------------------
| Collision lookup (by date, not by individual event)
|--------------------------------------------------------------------------
*/

const collidingDateKeys = computed(() => {
    const keys = new Set();

    props.collisions.forEach(collision => {
        keys.add(parseDate(collision.first.date).key);
        keys.add(parseDate(collision.second.date).key);
    });

    return keys;
});

function isDayColliding(year, month, day) {
    const key = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return collidingDateKeys.value.has(key);
}

/*
|--------------------------------------------------------------------------
| Subject colour coding (same hashing approach as TimeTable.vue,
| so a subject keeps a stable colour across both calendars)
|--------------------------------------------------------------------------
*/

function subjectHue(code) {
    let hash = 0;
    const str = String(code);

    for (let i = 0; i < str.length; i++) {
        hash = (hash*31 + str.charCodeAt(i)) % 360;
    }

    return hash;
}

function chipStyle(event, colliding) {
    if (colliding) {
        return {
            background: "linear-gradient(135deg, rgba(255,90,120,0.45), rgba(180,20,60,0.6))",
            borderColor: "#ff4264",
            boxShadow: "0 0 10px rgba(255,60,100,0.55)"
        };
    }

    const hue = subjectHue(event.code);

    return {
        background: `linear-gradient(135deg, hsla(${hue},80%,58%,0.4), hsla(${hue},80%,32%,0.6))`,
        borderColor: `hsl(${hue},80%,58%)`,
        boxShadow: `0 0 8px hsla(${hue},80%,55%,0.45)`
    };
}

function convocatoriaLabel(key) {
    return key.replace(/^tab-/, "");
}
</script>

<template>
<div class="exam-calendar">

    <h3>
        Horario de Exámenes
    </h3>

    <div
        v-if="monthsPresent.length === 0"
        class="empty-state"
    >
        Selecciona asignaturas para ver su calendario de exámenes.
    </div>

    <div
        v-else
        class="months-container"
    >
        <div
            v-for="m in monthsPresent"
            :key="m.year+'-'+m.month"
            class="month-block"
        >
            <div class="month-title">
                <span>{{ monthNames[m.month-1] }} {{ m.year }}</span>

                <small v-if="convocatoria === 'all'">
                    {{ Array.from(m.convocatorias).map(convocatoriaLabel).join(', ') }}
                </small>
            </div>

            <div class="week-header">
                <div
                    v-for="d in weekDayLabels"
                    :key="d"
                    class="week-day-label"
                >
                    {{ d }}
                </div>
            </div>

            <div class="month-grid">
                <template
                    v-for="(week, wi) in buildMonthGrid(m.year, m.month)"
                    :key="wi"
                >
                    <div
                        v-for="(day, di) in week"
                        :key="wi+'-'+di"
                        class="day-cell"
                        :class="{ 'day-cell--empty': day === null }"
                    >
                        <template v-if="day !== null">
                            <span class="day-number">{{ day }}</span>

                            <div
                                v-for="event in getEventsForDay(m.year, m.month, day)"
                                :key="event.code + event.date"
                                class="exam-chip"
                                :class="{ 'exam-chip--collision': isDayColliding(m.year, m.month, day) }"
                                :style="chipStyle(event, isDayColliding(m.year, m.month, day))"
                                :title="event.name"
                            >
                                <strong>{{ event.code }}</strong>
                                <small>{{ event.name }}</small>
                            </div>
                        </template>
                    </div>
                </template>
            </div>
        </div>
    </div>

</div>
</template>

<style scoped>

.exam-calendar {
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

.empty-state {
    margin: auto;
    color: #9cb8d6;
    font-style: italic;
    text-align: center;
}

.months-container {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-right: 0.3rem;
}

.month-block {
    border: 1px solid rgba(0,150,255,0.3);
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
}

.month-title {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 0.6rem 0.8rem;
    background: #10233f;
    color: #8dd8ff;
    font-weight: bold;
}

.month-title small {
    color: #6ba9d6;
    font-weight: normal;
    font-size: 0.75rem;
}

.week-header {
    display: grid;
    grid-template-columns: repeat(7,1fr);
    background: #0d1b30;
}

.week-day-label {
    padding: 0.4rem;
    text-align: center;
    font-size: 0.75rem;
    color: #b8d7ef;
    border-left:
        1px solid rgba(255,255,255,0.08);
}

.week-day-label:first-child {
    border-left: none;
}

.month-grid {
    display: grid;
    grid-template-columns: repeat(7,1fr);
}

.day-cell {
    min-height: 90px;
    box-sizing: border-box;
    padding: 0.3rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    border-left:
        1px solid rgba(255,255,255,0.08);
    border-top:
        1px solid rgba(255,255,255,0.08);
}

.day-cell:nth-child(7n+1) {
    border-left: none;
}

.day-cell--empty {
    background: rgba(255,255,255,0.02);
}

.day-number {
    font-size: 0.75rem;
    color: #6ba9d6;
}

.exam-chip {
    padding: 0.25rem 0.35rem;
    border-radius: 6px;
    border: 1px solid transparent;
    font-size: 0.68rem;
    overflow: hidden;
    transition: box-shadow 0.2s ease, transform 0.15s ease;
}

.exam-chip:hover {
    transform: translateY(-1px);
}

.exam-chip--collision {
    animation: pulse-danger 1.6s ease-in-out infinite;
}

@keyframes pulse-danger {
    0%, 100% { box-shadow: 0 0 8px rgba(255,60,100,0.45); }
    50% { box-shadow: 0 0 16px rgba(255,60,100,0.85); }
}

.exam-chip strong {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.exam-chip small {
    display: block;
    color: #cceeff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.months-container::-webkit-scrollbar {
    width: 6px;
}

.months-container::-webkit-scrollbar-thumb {
    background: #009dff;
    border-radius: 10px;
}

@media(max-width:768px){

    .day-cell {
        min-height: 70px;
    }

    .exam-chip small {
        display: none;
    }

}

</style>