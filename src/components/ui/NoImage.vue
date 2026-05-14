<template>
    <div class="no-image" :style="boxStyle" role="img" :aria-label="label">
        <svg
            viewBox="0 0 160 100"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            aria-hidden="true"
        >
            <rect x="6" y="6" width="148" height="88" rx="10" class="frame" />
            <path d="M16 76L52 48L72 64L100 38L144 76" class="shape" />
            <circle cx="56" cy="34" r="8" class="shape" />
            <path d="M116 22L138 44" class="slash" />
            <path d="M138 22L116 44" class="slash" />
            <text x="80" y="89" text-anchor="middle" class="caption">NO IMAGE</text>
        </svg>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    width: { type: [Number, String], default: 120 },
    height: { type: [Number, String], default: 72 },
    label: { type: String, default: 'Sin imagen' },
});

const boxStyle = computed(() => ({
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}));
</script>

<style scoped>
.no-image {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.6rem;
    background: linear-gradient(145deg, rgba(108, 117, 125, 0.06), rgba(13, 110, 253, 0.06));
}

.no-image svg {
    width: 100%;
    height: 100%;
}

.frame {
    fill: rgba(248, 249, 250, 0.95);
    stroke: rgba(108, 117, 125, 0.35);
    stroke-width: 2;
}

.shape {
    stroke: rgba(13, 110, 253, 0.65);
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.slash {
    stroke: rgba(220, 53, 69, 0.7);
    stroke-width: 3;
    stroke-linecap: round;
}

.caption {
    font-size: 11px;
    letter-spacing: 0.12em;
    font-weight: 700;
    fill: rgba(108, 117, 125, 0.8);
}
</style>
