<script lang="ts">
    import { createEventDispatcher } from "svelte";

    let visible: boolean = false;
    const dispatch = createEventDispatcher();

    const open = () => {
        visible = true;
    };

    const close = () => {
        visible = false;
        dispatch("close");
    };
</script>

<slot name="activator" {open} />

{#if visible}
    <div class="dialog">
        <div class="content">
            <div class="header">
                <i on:click={() => (visible = false)} class="material-icons">
                    close
                </i>
            </div>
            <slot {close} />
        </div>
    </div>
{/if}

<style lang="postcss">
    div.dialog {
        @apply w-screen h-screen;
        @apply flex justify-center items-center;
        @apply fixed top-0 left-0;
        @apply bg-black/40 z-[100];

        > div.content {
            @apply flex flex-col;
            @apply min-w-[480px] min-h-[300px] p-4;
            @apply rounded shadow-xl;
            @apply bg-white;

            > div.header {
                @apply h-auto;
                @apply flex justify-end items-center;

                > i {
                    @apply float-right cursor-pointer;
                }
            }
        }
    }
</style>
