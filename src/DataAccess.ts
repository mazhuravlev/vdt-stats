import moment from "moment";
import { handleResponse, sum } from "./func";
import { PilotData, PilotRecord } from "./types";

export class DataAccess {
    records: PilotRecord[] = []
    pilotRecords = new Map<string, PilotRecord[]>()
    pilotData: PilotData[] = []
    private _init = false

    async init(): Promise<unknown> {
        console.log('init')
        if (this._init) throw 'init'
        this._init = true
        return fetch('/data/vdt_record.csv')
            .then(handleResponse)
            .then(res => res.text())
            .then(text => {
                const lines = text.split('\n')
                lines.slice(1).filter(x => x).map(l => {
                    const parts = l.split(',')
                    const name = parts[2].replace('"', '')
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
                        return {
                            name,
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
    }

    async getPilots(): Promise<PilotData[]> {
        return Promise.resolve(this.pilotData)
    }

    async getPilotNames(): Promise<string[]> {
        return Promise.resolve([...this.pilotRecords.keys()])
    }

    async getPilotTable(name: string): Promise<number[]> {
        const dates = this.pilotRecords.get(name)!.map(x => x.vdtDate)
        const today = moment()
        const table = dates.map(x => today.diff(moment(x, "YYYY-MM-DD"), 'days'))
        return Promise.resolve(table)
    }

    async getPilotRecords(name: string): Promise<PilotRecord[]> {
        return Promise.resolve(this.records.filter(x => x.name === name))
    }
}