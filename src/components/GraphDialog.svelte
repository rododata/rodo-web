<script lang="ts">
    import { cloneDeep } from "lodash";
    import { createEventDispatcher, onMount } from "svelte";
    import { Chart } from "chart.js";

    import type { ChartConfiguration } from "chart.js";

    import Dialog from "./Dialog.svelte";
    import ProgressCircular from "./ProgressCircular.svelte";

    import {
        FilterTypeLabel,
        FilterTypes,
        QueryField,
        QueryResult,
        Rododata,
    } from "../lib/Rododata";
    import { queryableFields } from "../lib/store";
    import { generateColor, setChartType } from "../lib/commons";

    const dispatch = createEventDispatcher();

    let chart: Chart = null;
    let canvas: HTMLCanvasElement;

    let model = {
        type: null,
        fieldId: null,
    };

    let loading = false;
    let availableFields: QueryField[] = [];

    queryableFields.subscribe((value) => (availableFields = value));
    onMount(() => Rododata.getQueryableFields());

    const createChartData = (query: QueryResult) => {
        const labels = query.data.map(([label]) => label);
        const datasets = [
            {
                label: query.labels.pop(),
                backgroundColor: generateColor(),
                data: query.data.map(([, value]) => value as number),
            },
        ];

        return { labels, datasets };
    };

    const executeQuery = async () => {
        loading = true;
        const query = await Rododata.query([model]).finally(
            () => (loading = false)
        );

        if (chart === null) {
            const config: ChartConfiguration = {
                type: "bar",
                data: createChartData(query),
                options: {
                    maintainAspectRatio: false,
                    responsive: true,
                },
            };

            chart = new Chart(canvas, config);
            setChartType(chart, "bar");
        } else {
            const { labels, datasets } = createChartData(query);

            chart.data.labels = labels;
            chart.data.datasets = datasets;
            chart.update();
        }
    };

    const saveGraph = () => {
        const { name } = availableFields.find(({ id }) => id === model.fieldId);

        const data = {
            config: cloneDeep(chart.config["_config"]),
            name: [FilterTypeLabel[model.type], name].join(" "),
            query: cloneDeep(model),
        };

        dispatch("save", data);
    };

    const onClose = () => {
        model = {
            type: null,
            fieldId: null,
        };

        if (chart !== null) {
            chart.destroy();
        }

        chart = null;
    };
</script>

<Dialog let:close on:close={onClose}>
    <button slot="activator" let:open on:click={open}>
        <i class="material-icons">add</i>
        <span>Novo Gráfico</span>
    </button>
    <div class="form">
        <div>
            <span>Tipo:</span>
            <select
                bind:value={model.type}
                on:change={() => (model.fieldId = null)}
            >
                {#each FilterTypes as filterType}
                    <option value={filterType}>
                        {FilterTypeLabel[filterType]}
                    </option>
                {/each}
            </select>
        </div>
        {#if model.type !== null}
            <div>
                <span>Campo:</span>
                <select bind:value={model.fieldId} on:change={executeQuery}>
                    {#each availableFields as field}
                        <option value={field.id}>{field.name}</option>
                    {/each}
                </select>
            </div>
        {/if}
        {#if model.fieldId !== null}
            <div>
                <span>Formato:</span>
                <div class="chart-selector">
                    <div>
                        <i
                            class="material-icons"
                            on:click={() => setChartType(chart, "bar")}
                        >
                            bar_chart
                        </i>
                    </div>
                    <div>
                        <i
                            class="material-icons"
                            on:click={() => setChartType(chart, "line")}
                        >
                            show_chart
                        </i>
                    </div>
                    <div>
                        <i
                            class="material-icons"
                            on:click={() => setChartType(chart, "pie")}
                        >
                            pie_chart
                        </i>
                    </div>
                </div>
            </div>
        {/if}
    </div>
    {#if loading}
        <div class="loading">
            <ProgressCircular />
        </div>
    {/if}
    <div class={loading ? "graph graph-hidden" : "graph"}>
        <canvas bind:this={canvas} />
    </div>
    <div class="actions">
        <button on:click={() => (saveGraph(), close())}>Salvar</button>
    </div>
</Dialog>

<style lang="postcss">
    div.graph {
        @apply relative w-full h-[300px];
    }

    div.graph.graph-hidden {
        @apply hidden h-0;
    }

    div.loading {
        @apply relative flex-1;
        @apply flex justify-center items-center;
    }

    div.form {
        @apply space-y-2 py-4;
    }

    div.chart-selector {
        @apply flex;

        > div {
            @apply w-1/6 h-10;
            @apply text-indigo-600 text-center;

            > i {
                @apply p-4 py-2;
                @apply rounded shadow;
                @apply cursor-pointer;
            }
        }
    }

    div.actions {
        @apply pt-4;

        > button {
            @apply w-full;
        }
    }
</style>
