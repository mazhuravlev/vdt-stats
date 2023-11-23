import moment from "moment";
import { findLongestStreak, handleResponse, sum } from "./func";
import { PilotData, PilotRecord, Vdt } from "./types";
import { defaultPilotsReplacement } from "./defaultPilotsReplacement";

export class DataAccess {
    records: PilotRecord[] = []
    pilotRecords = new Map<string, PilotRecord[]>()
    pilotData: PilotData[] = []
    vdt: Vdt[] = []

    async init(): Promise<unknown> {
        console.log('init')

        this.records = []
        this.pilotRecords = new Map<string, PilotRecord[]>()
        this.pilotData = []
        this.vdt = []

        const sumPilotsDict: [string, Set<string>][] = (localStorage.getItem('sumPilots') ?? defaultPilotsReplacement)
            .split('\n')
            .map(x => x.trim())
            .filter(x => x)
            .flatMap(x => {
                const records = x.split(',').map(a => a.trim()).filter(a => a)
                if (records.length > 1) {
                    return [[records[0], new Set(records.slice(1))]]
                }
                return []
            })

        const vdtPromise = fetch(`${import.meta.env.BASE_URL}data/vdt.csv`)
            .then(handleResponse)
            .then(res => res.text())
            .then(text => {
                const lines = text.split('\n')
                return lines.slice(1).filter(x => x).map(l => {
                    const parts = l.split(',')
                    const vdt: Vdt = {
                        season: Number(parts[0]),
                        date: parts[1],
                        url: parts[2],
                        track: parts[3].replace(/^"/, '').replace(/"$/, ''),
                        type: parts[4] as '1lap' | '3lap',
                        updates: Number(parts[5]),
                        pilots: Number(parts[6]),
                    }
                    return vdt
                })
            })
            .then(x => this.vdt = x)
        const recordsPromise = fetch(`${import.meta.env.BASE_URL}data/vdt_record.csv`)
            .then(handleResponse)
            .then(res => res.text())
            .then(text => {
                const lines = text.split('\n')
                lines.slice(1).filter(x => x).map(l => {
                    const parts = l.split(',')
                    let name = parts[2].replace(/"/g, '')
                    for (const sp of sumPilotsDict) {
                        if (sp[1].has(name)) {
                            name = sp[0]
                            break
                        }
                    }
                    const record: PilotRecord = {
                        place: Number(parts[0]),
                        name,
                        deltaPercent: Number(parts[6]),
                        updates: Number(parts[4]),
                        index: -1,
                        l: -1,
                        vdtDate: parts[7],
                    }
                    this.records.push(record)
                    if (this.pilotRecords.has(name)) {
                        this.pilotRecords.get(name)!.push(record)
                    } else {
                        this.pilotRecords.set(name, [record])
                    }
                })
                Array.from(this.pilotRecords.keys()).forEach(name => {
                    const list = this.pilotRecords.get(name)!
                    list.forEach((x, i) => x.index = i)
                })
                this.pilotData = [...this.pilotRecords.keys()]
                    .map(name => {
                        const records = this.pilotRecords.get(name)!
                        const table = makeTable(records)
                        return {
                            name,
                            table,
                            longest_streak: findLongestStreak(table),
                            avg_delta: records
                                .map(x => x.deltaPercent)
                                .reduce(sum, 0) / records.length,
                            race_count: records.length,
                            total_updates: records
                                .map(x => x.updates)
                                .reduce(sum, 0),
                        }
                    })
            })

        return Promise.all([vdtPromise, recordsPromise])
    }

    async getPilots(): Promise<PilotData[]> {
        return Promise.resolve(this.pilotData)
    }

    async getPilotNames(): Promise<string[]> {
        return Promise.resolve([...this.pilotRecords.keys()])
    }

    async getPilotTable(name: string): Promise<number[]> {
        return Promise.resolve(this.pilotData.find(x => x.name === name)!.table)
    }

    async getPilotRecords(name: string): Promise<PilotRecord[]> {
        return Promise.resolve(this.records.filter(x => x.name === name))
    }
}

function makeTable(records: PilotRecord[]): number[] {
    const dates = records.map(x => x.vdtDate)
    const today = moment()
    const table = dates.map(x => today.diff(moment(x, "YYYY-MM-DD"), 'days'))
    table.sort()
    return table
}
