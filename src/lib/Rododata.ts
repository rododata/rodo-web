import Axios from 'axios';
import type { ChartType } from 'chart.js';

const RODODATA_API_URL = import.meta.env['VITE_RODODATA_API_URL'];

const axios = Axios.create({
    baseURL: RODODATA_API_URL
});

export type GraphData = [string, number];
export type GraphResult = Array<GraphData>;

export type Dataset = {
    label: string;
};

export type Card = {
    id: number;
    name: string;
    type?: ChartType;
    datasets: Dataset[];
};

export type Dashboard = {
    id: number;
    name: string;
    cards?: Card[];
};

export namespace Rododata {

    export async function getDashboards(): Promise<Dashboard[]> {
        const { data } = await axios.get('/dashboards');

        return data;
    }

    export async function getDashboard(id: number): Promise<Dashboard> {
        const { data } = await axios.get(`/dashboards/${id}`);

        return data;
    }

    export async function getCardData(id: number): Promise<GraphResult> {
        const { data } = await axios.get(`/graphs/${id}`);

        return data;
    }

}
