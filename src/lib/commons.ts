const _round = (number: number) =>
    Math.round((number + Number.EPSILON) * 100) / 100;

export const generateColor = (alpha: number = 128): string => {
    const _rand = () => Math.floor(Math.random() * 256);
    const _alpha = _round(Math.min(Math.max(0, alpha), 255) / 255);

    return 'rgba(' + [_rand(), _rand(), _rand(), _alpha].join() + ')';
};
