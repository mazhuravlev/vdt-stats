export interface PilotRecord {
    place: number
    name: string
    deltaPercent: number;
    updates: number;
    index: number;
    l: number
    vdtDate: string
}

export interface PilotData {
    name: string;
    race_count: number;
    total_updates: number;
    avg_delta: number;
    table: number[];
    longest_streak: number;
}

export interface Vdt {
    date: string
    track: string
    url: string
    season: number
    updates: number
    pilots: number
    type: '1lap' | '3lap'
}