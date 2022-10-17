import Axios from 'axios';
import type { ChartType } from 'chart.js';

import { queryableFields } from './store';

const RODODATA_API_URL = import.meta.env['VITE_RODODATA_API_URL'];

const axios = Axios.create({
    baseURL: RODODATA_API_URL
});

export type Dataset = {
    label: string;
};

export const FilterTypes = ['filterBy', 'groupBy'] as const;
export type PossibleFilters = typeof FilterTypes[number];

export type FilterableField = {
    type: PossibleFilters;
    fieldId: number;
    name: string;
};

export const FilterTypeLabel: Record<FilterableField["type"], string> = {
    filterBy: "Filtrado por",
    groupBy: "Agrupado por",
};

export type Card = {
    id: number;
    name: string;
    type?: ChartType;
    datasets: Dataset[];
    filters: FilterableField[];
};

export type Dashboard = {
    id: number;
    name: string;
    cards?: Card[];
};

export type QueryField = {
    id: number;
    name: string;
    type: string;
};

export type QueryOptions = {
    fields: QueryField[];
};

export type QueryResult = {
    data: unknown[][];
    labels: string[];
};

type Query<T extends PossibleFilters> = {
    type: T;
    fieldId: number;
};

export type FilterByQuery = Query<'filterBy'> & {
    operator?: '>' | '<' | '=';
    value?: unknown;
};

export type GroupByQuery = Query<'groupBy'>;

export type QueryType = FilterByQuery | GroupByQuery;

export namespace Rododata {

    export async function getDashboards(): Promise<Dashboard[]> {
        const { data } = await axios.get('/dashboards');

        return data;
    }

    export async function getDashboard(id: number): Promise<Dashboard> {
        const { data } = await axios.get(`/dashboards/${id}`);

        return data;
    }

    export async function getCardData(id: number): Promise<QueryResult> {
        const { data } = await axios.get(`/graphs/${id}`);

        return data;
    }

    export async function getCardDataWithFilters(id: number, query: QueryType): Promise<QueryResult> {
        const { data } = await axios.post(`/graphs/filter/${id}`, [query]);

        return data;
    }

    export async function getQueryableFields(): Promise<QueryField[]> {
        if (queryableFields.loaded)
            return queryableFields.value;

        const { data } = await axios.get<QueryOptions>('/query/options');
        queryableFields.set(data.fields);

        return queryableFields.value;
    }

    export async function query(filters: QueryType[]) {
        const { data } = await axios.post<QueryResult>('/query', filters);

        return data;
    }

}
