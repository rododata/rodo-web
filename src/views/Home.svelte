<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import type { ChartConfiguration } from "chart.js";

    import GraphCard, { CardElement } from "../components/GraphCard.svelte";
    import GraphDialog from "../components/GraphDialog.svelte";

    import { dashboards } from "../lib/store";
    import { getStore } from "../lib/storage";
    import { FilterableField, QueryType, Rododata } from "../lib/Rododata";

    type CustomQuery = {
        config: ChartConfiguration;
        name: string;
        filters: FilterableField[];
        query: QueryType;
    };

    type SaveEvent = {
        id: number;
        data: CustomQuery;
    };

    let cards: CardElement[] = [];
    const unsubscribe = dashboards.subscribe((data) => {
        const _cards = data.map((e) => e.cards).flat();
        cards = _cards.map((card) => ({
            ...card,
            fetch: (query) => {
                if (query) {
                    return Rododata.getCardDataWithFilters(card.id, query);
                }

                return Rododata.getCardData(card.id);
            },
        }));
    });

    onDestroy(unsubscribe);

    const addCard = (event: SaveEvent) => {
        const { id } = event;
        const { config, name, filters, query } = event.data;

        const card: CardElement = {
            id,
            options: config,
            name,
            type: config.type,
            datasets: config.data.datasets.map(({ label }) => ({ label })),
            filters,
            fetch: async (_query) => {
                if (_query) {
                    return Rododata.query([query, _query]);
                }

                return Rododata.query([query]);
            },
            destroy: async () => {
                const store = await getStore<CustomQuery>("queries");

                await store.remove(id);
                store.commit();

                const i = cards.findIndex((e) => e.id === id);
                cards.splice(i, 1);
                cards = cards;
            },
        };

        cards = [...cards, card];
    };

    onMount(async () => {
        await Rododata.getDashboards().then((data) => {
            dashboards.set(data);
        });

        const store = await getStore<CustomQuery>("queries");
        const data = await store.list();

        data.forEach(({ id, value: data }) => addCard({ id, data }));
    });
</script>

<div class="title">Análise de Acidentes registrados pela PRF</div>
<div class="action">
    <GraphDialog on:save={(e) => addCard(e.detail)} />
</div>
<div class="dashboard">
    {#each cards as card}
        <div>
            <GraphCard data={card} chartOptions={card.options} />
        </div>
    {/each}
</div>

<style lang="postcss">
    div.title {
        @apply py-2 px-2;
        @apply text-4xl text-center font-medium;
    }

    div.action {
        @apply px-2;
    }

    div.dashboard {
        @apply flex flex-wrap;

        > div {
            @apply w-full min-h-[480px];
            @apply p-2;

            @screen md {
                @apply w-1/2;
            }

            @screen 2xl {
                @apply w-1/3;
            }
        }
    }
</style>
