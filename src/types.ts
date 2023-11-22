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
}