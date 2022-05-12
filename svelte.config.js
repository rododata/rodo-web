import sveltePreprocess from 'svelte-preprocess';

import importing from 'postcss-import';
import nesting from 'tailwindcss/nesting/index.js';
import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const preprocess = sveltePreprocess({
    postcss: {
        plugins: [
            importing(),
            nesting(),
            tailwind(),
            autoprefixer(),
        ],
    }
});

export default { preprocess };
