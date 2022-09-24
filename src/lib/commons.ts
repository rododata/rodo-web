export const generateColor = (alpha: number = 128): string =>
    '#' + Math.floor(Math.random() * 16777215).toString(16) + Math.min(Math.max(0, alpha), 255).toString(16);
