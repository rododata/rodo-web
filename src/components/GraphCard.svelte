<script lang="ts" context="module">
    import type { Card, GraphResult, QueryType } from "../lib/Rododata";

    export type CardElement = Omit<Card, "id"> & {
        options?: ChartConfiguration | null;
        fetch: (query?: QueryType | null) => Promise<GraphResult>;
    };
</script>

<script lang="ts">
    import { Chart, ChartConfiguration, ChartDataset } from "chart.js";
    import { onDestroy, onMount } from "svelte";

    import { generateColor, setChartType } from "../lib/commons";
    import { FilterTypeLabel } from "../lib/Rododata";

    import FilterDialog from "./FilterDialog.svelte";
    import ProgressCircular from "./ProgressCircular.svelte";

    export let data: CardElement;
    export let chartOptions: ChartConfiguration = {
        type: data.type,
        data: {
            labels: [],
            datasets: [],
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
        },
    };

    let loading = false;

    let canvas: HTMLCanvasElement;
    let chart: Chart;

    onMount(async () => {
        loading = true;
        const cardData = await data.fetch();
        loading = false;

        const labels: string[] = cardData.map(([label]) => label);
        const datasets: ChartDataset[] = data.datasets.map(() => ({
            backgroundColor: generateColor(),
            data: cardData.map(([, value]) => value),
        }));

        const config: ChartConfiguration = {
            ...chartOptions,
            data: { labels, datasets },
        };

        chart = new Chart(canvas, config);
        setChartType(chart, config.type || "bar");
    });

    onDestroy(() => {
        if (chart !== undefined) {
            chart.destroy();
        }
    });

    let filter: QueryType = null;
    const onChartFilter = async (query: QueryType) => {
        filter = query;

        loading = true;
        const cardData: GraphResult = await data.fetch(query);
        loading = false;

        chart.data.datasets[0].data = cardData.map(([, value]) => value);
        chart.update();
    };
</script>

<div class="card">
    <div class="header">
        <div />
        <div class="title">{data.name}</div>
        {#if data.filters && data.filters.length}
            <div>
                <FilterDialog
                    filters={data.filters}
                    on:input={({ detail }) => onChartFilter(detail)}
                />
            </div>
        {/if}
    </div>
    {#if filter}
        <div class="details">
            {FilterTypeLabel[filter.type]}
            {#if filter.type === "filterBy"}
                = {filter.value}
            {/if}
        </div>
    {/if}
    {#if loading}
        <div class="loading">
            <ProgressCircular />
        </div>
    {/if}
    <div class={loading ? "graph graph-hidden" : "graph"}>
        <canvas bind:this={canvas} />
    </div>
</div>

<style lang="postcss">
    div.card {
        @apply flex flex-col;
        @apply rounded border border-neutral-200 shadow;
        @apply h-full p-4;

        > div.header {
            @apply flex items-center;
            @apply pb-2;

            > :not(:nth-child(2)) {
                @apply w-1/4;
            }

            > :nth-child(2) {
                @apply w-2/4;
            }

            > div.title {
                @apply text-center font-medium text-xl;
            }

            > section {
                @apply flex space-x-2;

                > select {
                    @apply w-full;
                }
            }
        }

        > div.details {
            @apply text-center text-sm text-neutral-400;
        }

        > div.graph {
            @apply relative h-full;
        }

        > div.graph.graph-hidden {
            @apply hidden h-0;
        }

        > div.loading {
            @apply flex justify-center items-center;
            @apply relative h-full;
        }
    }
</style>
