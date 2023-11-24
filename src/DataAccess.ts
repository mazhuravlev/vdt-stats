import { assertDefined, findLongestStreak, sum } from "./func";
import { PilotData, PilotRecord, Vdt, VdtRecord, vdtDateFormat } from "./types";
import { defaultPilotsReplacement } from "./defaultPilotsReplacement";
import initSqlJs, { Database } from "sql.js";
import * as df from 'date-fns'

export class DataAccess {
    records: PilotRecord[] = []
    pilotRecords = new Map<string, PilotRecord[]>()
    pilotData: PilotData[] = []
    private _db: Database | undefined;
    private _sqlPromise: Promise<unknown>;
    sumPilotsDict: [string, Set<string>][] = []

    constructor() {
        const sql = initSqlJs({
            locateFile: file => `${import.meta.env.BASE_URL}data/${file}`
        })
        const data = fetch(`${import.meta.env.BASE_URL}data/vdt.db`).then(res => res.arrayBuffer())
        const sqlPromise = Promise.all([sql, data])
        sqlPromise.then(([sql, data]) => {
            this._db = new sql.Database(new Uint8Array(data))
        })
        this._sqlPromise = sqlPromise
    }

    async db(): Promise<Database> {
        await this._sqlPromise
        return assertDefined(this._db)
    }

    private replaceName(name: string) {
        for (const sp of this.sumPilotsDict) {
            if (sp[1].has(name)) {
                return sp[0]
            }
        }
        return name
    }

    async init(): Promise<unknown> {
        console.log('init')

        this.sumPilotsDict = (localStorage.getItem('sumPilots') ?? defaultPilotsReplacement)
            .split('\n')
            .map(x => x.trim())
            .filter(x => x)
            .flatMap(x => {
                const records = x.split(',').map(a => a.trim()).filter(a => a)
                if (records.length > 1) {
                    return [[records[0], new Set(records.slice(1))]]
                }
                return []
            }) as [string, Set<string>][]

        this.records = []
        this.pilotRecords = new Map<string, PilotRecord[]>()
        this.pilotData = []

        const db = await this.db()
        const s = db.prepare('SELECT * from vdt_record')
        while (s.step()) {
            const vdtRecord = (s.getAsObject() as unknown) as VdtRecord
            const name = this.replaceName(vdtRecord.name)
            const record: PilotRecord = {
                place: vdtRecord.place,
                name,
                deltaPercent: vdtRecord.deltaPercent,
                updates: vdtRecord.updates,
                index: -1,
                l: -1,
                vdtDate: vdtRecord.vdtDate,
            }
            this.records.push(record)
            if (this.pilotRecords.has(name)) {
                this.pilotRecords.get(name)!.push(record)
            } else {
                this.pilotRecords.set(name, [record])
            }

        }

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

        return Promise.resolve()
    }

    async getVdtList(): Promise<Vdt[]> {
        const db = await this.db()
        const s = db.prepare('SELECT * from vdt')
        const vdtList: Vdt[] = []
        while (s.step()) {
            const vdt = (s.getAsObject() as unknown) as Vdt
            vdtList.push(vdt)
        }
        return vdtList
    }

    async getVdt(date: string): Promise<Vdt> {
        const db = await this.db()
        const s = db.prepare('SELECT * from vdt WHERE date=:date')
        const vdt = (s.getAsObject({ ':date': date }) as unknown) as Vdt
        return vdt
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

    async getRaceRecords(date: string): Promise<VdtRecord[]> {
        const db = await this.db()
        const s = db.prepare(`SELECT * from vdt_record WHERE vdtDate='${date}'`)
        const records: VdtRecord[] = []
        while (s.step()) {
            const record = (s.getAsObject() as unknown) as VdtRecord
            record.name = this.replaceName(record.name)
            records.push(record)
        }
        return records
    }

    async getRaceNavigation(date: string): Promise<{ prev: string | undefined, next: string | undefined }> {
        const db = await this.db()
        const s_prev = db.prepare('SELECT * from vdt WHERE date<:date ORDER BY date DESC LIMIT 1')
        const prev = (s_prev.getAsObject({ ':date': date }) as unknown) as Vdt
        const s_next = db.prepare('SELECT * from vdt WHERE date>:date ORDER BY date ASC LIMIT 1')
        const next = (s_next.getAsObject({ ':date': date }) as unknown) as Vdt
        return { prev: prev.date, next: next.date }
    }
}

function makeTable(records: PilotRecord[]): number[] {
    const dates = records.map(x => x.vdtDate)
    const table = dates.map(x => df.differenceInCalendarDays(new Date(), df.parse(x, vdtDateFormat, new Date())))
    return table
}
