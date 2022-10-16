<svg
    fill="none"
    viewBox="0 0 24 24"
    width="48"
    height="48"
    xmlns="http://www.w3.org/2000/svg"
>
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
    <path
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
</svg>

<style lang="postcss">
    svg {
        @apply animate-spin text-indigo-600;

        > circle {
            @apply opacity-25;
        }

        > path {
            @apply opacity-75;
        }
    }
</style>
