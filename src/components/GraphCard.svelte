<script lang="ts" context="module">
    import type { Card, QueryResult, QueryType } from "../lib/Rododata";

    export type CardElement = Card & {
        options?: ChartConfiguration | null;
        destroy?: () => void;
        fetch: (query?: QueryType | null) => Promise<QueryResult>;
    };
</script>

<script lang="ts">
    import { Chart, ChartConfiguration, ChartDataset } from "chart.js";
    import { onDestroy, onMount } from "svelte";

    import { generateColor, setChartType } from "../lib/commons";
    import { FilterTypeLabel } from "../lib/Rododata";

    import DeleteDialog from "./DeleteDialog.svelte";
    import FilterDialog from "./FilterDialog.svelte";
    import ProgressCircular from "./ProgressCircular.svelte";

    export let data: CardElement;
    export let chartOptions: ChartConfiguration;
    let loading = false;

    let canvas: HTMLCanvasElement;
    let chart: Chart;

    const getConfiguration = () => {
        if (chartOptions) {
            return chartOptions;
        }

        return {
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
    };

    onMount(async () => {
        loading = true;
        const cardData = await data.fetch();
        loading = false;

        const labels: string[] = cardData.data.map(
            ([label]) => label as string
        );
        const datasets: ChartDataset[] = data.datasets.map(() => ({
            label: cardData.labels.pop(),
            backgroundColor: generateColor(),
            data: cardData.data.map(([, value]) => value as number),
        }));

        const options = getConfiguration();
        const config: ChartConfiguration = {
            ...options,
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
        const cardData = await data.fetch(query);
        loading = false;

        chart.data.datasets[0].data = cardData.data.map(
            ([, value]) => value as number
        );
        chart.update();
    };
</script>

<div class="card">
    <div class="header">
        <div />
        <div class="title">{data.name}</div>
        <div class="actions">
            {#if data.destroy}
                <DeleteDialog let:open on:confirm={() => data.destroy()}>
                    <i
                        class="material-icons"
                        style="color: rgb(220 38 38);"
                        on:click={open}>delete</i
                    >
                </DeleteDialog>
            {/if}
            {#if data.filters && data.filters.length}
                <FilterDialog
                    let:open
                    filters={data.filters}
                    on:input={({ detail }) => onChartFilter(detail)}
                >
                    <i class="material-icons" on:click={open}>filter_alt</i>
                </FilterDialog>
            {/if}
        </div>
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

            > div.actions {
                @apply flex items-center justify-end;

                > i {
                    @apply p-1 ml-2;
                    @apply rounded shadow;
                    @apply border border-neutral-200 cursor-pointer;
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
