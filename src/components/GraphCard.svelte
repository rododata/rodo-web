<script lang="ts">
    import { Chart, ChartConfiguration, ChartDataset } from "chart.js";
    import { onDestroy, onMount } from "svelte";

    import { generateColor } from "../lib/commons";
    import { Card, Rododata } from "../lib/Rododata";

    export let data: Card;

    let canvas: HTMLCanvasElement;
    let chart: Chart;

    onMount(async () => {
        const cardData = await Rododata.getCardData(data.id);

        const labels: string[] = cardData.map(([label]) => label);
        const datasets: ChartDataset[] = data.datasets.map(({ label }) => ({
            label,
            backgroundColor: generateColor(),
            data: cardData.map(([, value]) => value),
        }));

        const config: ChartConfiguration = {
            type: "bar", // TODO: customizable from API
            data: { labels, datasets },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                scales: {
                    x: {
                        ticks: {
                            display: false,
                        },
                        grid: {
                            display: false,
                        },
                    },
                },
            },
        };

        chart = new Chart(canvas, config);
    });

    onDestroy(() => {
        if (chart !== undefined) {
            chart.destroy();
        }
    });
</script>

<div class="card">
    <span>{data.name}</span>
    <div class="graph">
        <canvas bind:this={canvas} />
    </div>
</div>

<style lang="postcss">
    div.card {
        @apply flex flex-col;
        @apply rounded border border-neutral-200 shadow;
        @apply h-full p-4;

        > span {
            @apply text-center font-medium text-xl;
        }

        > div.graph {
            @apply relative h-full;
        }
    }
</style>
