<script lang="ts">
    import { createEventDispatcher } from "svelte";

    import Dialog from "./Dialog.svelte";

    const dispatch = createEventDispatcher();

    const confirm = (close: () => void) => {
        dispatch("confirm");
        close();
    };
</script>

<Dialog let:close>
    <slot slot="activator" let:open {open} />
    <div class="content">Deseja deletar este gráfico?</div>
    <div class="actions">
        <button on:click={close}>Não</button>
        <button on:click={() => confirm(close)}>Sim</button>
    </div>
</Dialog>

<style lang="postcss">
    div.content {
        @apply text-xl text-center;
    }

    div.actions {
        @apply flex;
        @apply mt-auto space-x-2;

        > button:nth-child(1) {
            @apply bg-red-600;
        }

        > button:nth-child(2) {
            @apply bg-green-600;
        }

        > button {
            @apply w-1/2;
        }
    }
</style>
