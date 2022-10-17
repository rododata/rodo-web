<script lang="ts">
    import Home from "./views/Home.svelte";
</script>

<main>
    <Home />
</main>

<style global lang="postcss">
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    main {
        @apply w-full h-full p-4;
    }

    button {
        @apply flex justify-center items-center;
        @apply h-[36px] px-4 space-x-2;
        @apply rounded bg-indigo-600;
        @apply outline-none shadow-md;
        @apply text-white font-medium;
    }

    input,
    select {
        @apply h-[36px] w-full;
        @apply rounded border border-neutral-400;
        @apply outline-none;
    }

    i {
        @apply select-none;
    }
</style>
