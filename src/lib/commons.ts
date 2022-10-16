import type { Chart, ChartType } from "chart.js";

const _round = (number: number) =>
    Math.round((number + Number.EPSILON) * 100) / 100;

export const generateColor = (alpha: number = 128): string => {
    const _rand = () => Math.floor(Math.random() * 256);
    const _alpha = _round(Math.min(Math.max(0, alpha), 255) / 255);

    return 'rgba(' + [_rand(), _rand(), _rand(), _alpha].join() + ')';
};

export const setChartType = (chart: Chart, type: ChartType) => {
    if (type === "bar" || type === "line") {
        chart.data.datasets[0].backgroundColor = generateColor();
        chart.config.options.elements = undefined;

        chart.config.options.scales = {
            x: {
                ticks: {
                    display: false,
                },
                grid: {
                    display: false,
                },
            },
        };
    } else if (type === "pie") {
        const i = chart.data.labels.length;

        chart.data.datasets[0].backgroundColor = [...new Array(i)].map(() =>
            generateColor()
        );

        chart.config.options.elements = {
            arc: {
                borderWidth: 0,
            },
        };

        chart.config.options.scales = {
            x: {
                ticks: {
                    display: false,
                },
                grid: {
                    display: false,
                },
            },
            y: {
                ticks: {
                    display: false,
                },
                grid: {
                    display: false,
                },
            },
        };
    }

    chart.config.type = type;
    chart.update();
};
