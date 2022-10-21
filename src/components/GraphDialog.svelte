<script lang="ts">
    import { cloneDeep } from "lodash";
    import { createEventDispatcher, onMount } from "svelte";
    import { Chart } from "chart.js";

    import type { ChartConfiguration } from "chart.js";

    import Dialog from "./Dialog.svelte";
    import ProgressCircular from "./ProgressCircular.svelte";

    import {
        FilterableField,
        FilterTypeLabel,
        FilterTypes,
        QueryField,
        QueryResult,
        QueryType,
        Rododata,
    } from "../lib/Rododata";
    import { queryableFields } from "../lib/store";
    import { getStore } from "../lib/storage";
    import { generateColor, setChartType } from "../lib/commons";

    const dispatch = createEventDispatcher();

    let chart: Chart = null;
    let canvas: HTMLCanvasElement;

    let model: QueryType = {
        type: "groupBy",
        fieldId: null,
    };

    let filter: FilterableField = {
        type: "filterBy",
        fieldId: null,
        name: null,
    };

    let filters: FilterableField[] = [];

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
            setChartType(chart, "bar");
            chart.update();
        }
    };

    const saveGraph = async (close: () => void) => {
        const store = await getStore("queries");
        const { name } = availableFields.find(({ id }) => id === model.fieldId);

        const data = {
            config: cloneDeep(chart.config["_config"]),
            name: [FilterTypeLabel[model.type], name].join(" "),
            filters: cloneDeep(filters),
            query: cloneDeep(model),
        };

        const id = await store.save(data);
        store.commit();

        dispatch("save", { id, data });
        close();
    };

    const onClose = () => {
        model = {
            type: "groupBy",
            fieldId: null,
        };

        filter = {
            type: "filterBy",
            fieldId: null,
            name: null,
        };

        filters = [];

        if (chart !== null) {
            chart.destroy();
        }

        chart = null;
    };

    const addFilter = () => {
        if (filter.fieldId === null) return;

        filters.push(cloneDeep(filter));
        filters = filters;

        filter = {
            type: "filterBy",
            fieldId: null,
            name: null,
        };
    };

    const removeFilter = (i: number) => {
        filters.splice(i, 1);
        filters = filters;
    };

    const getFieldName = (id: number) => {
        const field = availableFields.find((e) => e.id === id);

        if (field) {
            return field.name;
        }

        return null;
    };
</script>

<Dialog let:close on:close={onClose}>
    <button slot="activator" let:open on:click={open}>
        <i class="material-icons">add</i>
        <span>Novo Gráfico</span>
    </button>
    <div class="form">
        <div>
            <span>Agrupar por:</span>
            <select bind:value={model.fieldId} on:change={executeQuery}>
                {#each availableFields as field}
                    <option value={field.id}>{field.name}</option>
                {/each}
            </select>
        </div>
        {#if model.fieldId !== null}
            <div class="filters">
                <span>Filtros:</span>
                {#each filters as filter, i}
                    <div class="field">
                        <span>{filter.name}</span>
                        <i
                            class="material-icons"
                            on:click={() => removeFilter(i)}
                        >
                            close
                        </i>
                    </div>
                {/each}
                <div>
                    <span>Campo:</span>
                    <select
                        bind:value={filter.fieldId}
                        on:change={() =>
                            (filter.name = getFieldName(filter.fieldId))}
                    >
                        {#each availableFields as field}
                            <option value={field.id}>{field.name}</option>
                        {/each}
                    </select>
                </div>
                <button on:click={addFilter}>
                    <i class="material-icons">add</i>
                    <span>Adicionar filtro</span>
                </button>
            </div>
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
        <button on:click={() => saveGraph(close)}>Salvar</button>
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

        > div.filters {
            @apply space-y-2;

            > div.field {
                @apply flex justify-between items-center;

                > span {
                    @apply text-sm text-blue-400;
                }

                > i {
                    @apply cursor-pointer;
                }
            }

            > div:not(.field) {
                > span {
                    @apply text-xs text-neutral-500;
                }
            }

            > button {
                @apply w-full;
            }
        }
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
