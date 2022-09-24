<script lang="ts">
    import { onDestroy } from "svelte";

    import GraphCard from "../components/GraphCard.svelte";
    import { dashboards } from "../lib/store";
    import { Card, Rododata } from "../lib/Rododata";

    let cards: Card[] = [];
    const unsubscribe = dashboards.subscribe(
        (data) => (cards = data.map((e) => e.cards).flat())
    );

    Rododata.getDashboards().then((data) => dashboards.set(data));
    onDestroy(unsubscribe);
</script>

<div class="dashboard">
    {#each cards as card}
        <div>
            <GraphCard data={card} />
        </div>
    {/each}
</div>

<style lang="postcss">
    div.dashboard {
        @apply flex;

        > div {
            @apply w-full min-h-[480px] max-h-[480px];
            @apply p-2;

            @screen md {
                @apply w-1/2;
            }
        }
    }
</style>
