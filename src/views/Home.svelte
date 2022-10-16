<script lang="ts">
    import { onDestroy } from "svelte";

    import GraphCard, { CardElement } from "../components/GraphCard.svelte";
    import GraphDialog from "../components/GraphDialog.svelte";

    import { dashboards } from "../lib/store";
    import { GraphResult, Rododata } from "../lib/Rododata";

    let cards: CardElement[] = [];
    const unsubscribe = dashboards.subscribe((data) => {
        const _cards = data.map((e) => e.cards).flat();
        cards = _cards.map(({ id, ...card }) => ({
            ...card,
            fetch: (query) => {
                if (query) return Rododata.getCardDataWithFilters(id, query);

                return Rododata.getCardData(id);
            },
        }));
    });

    Rododata.getDashboards().then((data) => dashboards.set(data));
    onDestroy(unsubscribe);

    const addCard = ({ config, name, query }) => {
        const card: CardElement = {
            options: config,
            name,
            type: config.type,
            datasets: config.data.datasets.map(({ label }) => ({ label })),
            filters: [],
            fetch: async (_query) => {
                if (_query) {
                    const { data } = await Rododata.query([_query]);
                    return data as GraphResult;
                }

                const { data } = await Rododata.query([query]);
                return data as GraphResult;
            },
        };

        cards = [...cards, card];
    };
</script>

<div class="title">Análise de Acidentes registrados pela PRF</div>
<GraphDialog on:save={(e) => addCard(e.detail)} />
<div class="dashboard">
    {#each cards as card}
        <div>
            <GraphCard data={card} chartOptions={card.options} />
        </div>
    {/each}
</div>

<style lang="postcss">
    div.title {
        @apply py-2;
        @apply text-4xl text-center font-medium;
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
