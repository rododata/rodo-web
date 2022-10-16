<script lang="ts">
    import { map, uniqBy } from "lodash";
    import { createEventDispatcher } from "svelte";

    import { FilterTypeLabel } from "../lib/Rododata";
    import type { FilterableField } from "../lib/Rododata";

    import Dialog from "./Dialog.svelte";

    export let filters: FilterableField[];
    const dispatch = createEventDispatcher();

    const availableFilterTypes: FilterableField["type"][] = map(
        uniqBy(filters, "type"),
        "type"
    );

    let model = {
        type: null,
        fieldId: null,
        value: null,
    };

    const clear = () => {
        model = {
            type: null,
            fieldId: null,
            value: null,
        };

        dispatch("input", null);
    };

    const doFilter = () => {
        const { type, fieldId } = filters.find(
            (e) => e.type === model.type && e.fieldId === model.fieldId
        );

        const query = { type, fieldId, value: model.value };
        dispatch("input", query);
    };
</script>

<Dialog let:close>
    <button class="w-full" slot="activator" let:open on:click={open}>
        Filtros
    </button>
    <div class="form">
        <div>
            <span>Tipo:</span>
            <select
                bind:value={model.type}
                on:change={() => (model.fieldId = null)}
            >
                {#each availableFilterTypes as filterType}
                    <option value={filterType}>
                        {FilterTypeLabel[filterType]}
                    </option>
                {/each}
            </select>
        </div>
        {#if model.type !== null}
            <div>
                <span>Campo:</span>
                <select bind:value={model.fieldId}>
                    {#each filters.filter(({ type }) => type === model.type) as field}
                        <option value={field.fieldId}>{field.name}</option>
                    {/each}
                </select>
            </div>
        {/if}
        {#if model.type === "filterBy" && model.fieldId !== null}
            <div>
                <span>Valor:</span>
                <input type="text" bind:value={model.value} />
            </div>
        {/if}
    </div>
    <div class="actions">
        <button on:click={() => (clear(), close())}>Limpar filtros</button>
        <button on:click={() => (doFilter(), close())}>Filtrar</button>
    </div>
</Dialog>

<style lang="postcss">
    div.form {
        @apply space-y-2 py-4;
    }

    div.actions {
        @apply mt-auto space-y-2;

        > button {
            @apply w-full;
        }
    }
</style>
