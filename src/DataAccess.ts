import { assertDefined, assertString, assertTrue, findLongestStreak, parseTrackName, sum } from "./func"
import { PilotData, PilotRecord, TrackSummary, Vdt, VdtRecord, vdtDateFormat } from "./types"
import { defaultPilotsReplacement } from "./defaultPilotsReplacement"
import initSqlJs, { Database } from 'sql.js/dist/sql-wasm.js';
import wasmBinary from 'sql.js/dist/sql-wasm.wasm?url';
import * as df from 'date-fns'
import { Nullable } from "primereact/ts-helpers"
import * as zip from "@zip.js/zip.js"

const SEASON_START_DATE_KEY = 'season_start_date'
const SEASON_END_DATE_KEY = 'season_end_date'

export class DataAccess {
    records: PilotRecord[] = []
    pilotRecords = new Map<string, PilotRecord[]>()
    pilotData: PilotData[] = []
    private _db: Database | undefined;
    private _sqlPromise: Promise<unknown>;
    sumPilotsDict: [string, Set<string>][] = []
    seasonStartDate: string | undefined = localStorage.getItem(SEASON_START_DATE_KEY) ?? undefined
    seasonEndDate: string | undefined = localStorage.getItem(SEASON_END_DATE_KEY) ?? undefined

    constructor() {
        const sql = initSqlJs({
            locateFile: () => wasmBinary,
        })
        const dbUrl = `${import.meta.env.BASE_URL}data/vdt.zip`;
        const data = fetch(dbUrl).then(res => res.blob())
        this._sqlPromise = Promise.all([sql, data]).then(async ([sql, blob]) => {
            const zipReader = new zip.ZipReader(new zip.BlobReader(blob));
            const entries = await zipReader.getEntries()
            const dbEntry = assertDefined(entries.find(x => x.filename === 'vdt.db'))
            if (!dbEntry.getData) throw '!dbEntry.getData'
            const writer = new zip.Uint8ArrayWriter()
            await dbEntry.getData(writer)
            const data = await writer.getData()
            this._db = new sql.Database(data)
        })
    }

    async db(): Promise<Database> {
        await this._sqlPromise
        return assertDefined(this._db, 'this._db')
    }

    async getTrackSummary(): Promise<TrackSummary[]> {
        const db = await this.db()
        const q = db.exec(`select count(track) as cnt, track, sum(updates) as updates 
        from vdt 
        group by track 
        order by cnt desc, updates desc`)
        return q[0].values.map((x): TrackSummary => {
            const { map, track } = parseTrackName(assertString(x[1]))
            return ({
                repeats: x[0] as number,
                map,
                track,
                updates: x[2] as number,
            })
        })
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
        const s = db.prepare('SELECT * from vdt_record ORDER BY vdtDate DESC')
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
            if (record.vdtDate <= (this.seasonStartDate ?? '2000-00-00')) continue
            if (record.vdtDate >= (this.seasonEndDate ?? '3000-00-00')) continue
            this.records.push(record)
            if (this.pilotRecords.has(name)) {
                this.pilotRecords.get(name)!.push(record)
            } else {
                this.pilotRecords.set(name, [record])
            }

        }
        s.free()

        Array.from(this.pilotRecords.keys()).forEach(name => {
            const list = this.pilotRecords.get(name)!
            list.forEach((x, i) => x.index = i)
        })

        this.pilotData = [...this.pilotRecords.keys()]
            .map(name => {
                const records = assertDefined(this.pilotRecords.get(name))
                const table = makeTable(records)
                return {
                    name,
                    table,
                    longest_streak: findLongestStreak(table),
                    avg_delta: this.calculateDelta(records),
                    race_count: records.length,
                    total_updates: records
                        .map(x => x.updates)
                        .reduce(sum, 0),
                }
            })

        return Promise.resolve()
    }

    setSeason(startDate: Nullable<Date>, endDate: Nullable<Date>) {
        const f = (x: Date) => df.format(x, 'yyyy-MM-dd')
        if (startDate) {
            localStorage.setItem(SEASON_START_DATE_KEY, f(startDate))
        } else {
            localStorage.removeItem(SEASON_START_DATE_KEY)
        }
        if (endDate) {
            localStorage.setItem(SEASON_END_DATE_KEY, f(endDate))
        } else {
            localStorage.removeItem(SEASON_END_DATE_KEY)
        }
        this.seasonStartDate = startDate ? f(startDate) : undefined
        this.seasonEndDate = endDate ? f(endDate) : undefined
        return this.init()
    }

    private calculateDelta(records: PilotRecord[]): number | undefined {
        if (records.length === 0) return undefined
        const delta = records
            .map(x => x.deltaPercent)
            .reduce(sum, 0) / records.length;
        return delta
    }

    async getVdtList(map?: string, track?: string, pilot?: string): Promise<Vdt[]> {
        const db = await this.db()
        if (pilot) {
            const s = db.prepare(`SELECT * FROM vdt_record LEFT JOIN vdt ON vdt_record.vdtDate = vdt.date WHERE name=:name`)
            s.bind({ ':name': pilot })
            const vdtList: Vdt[] = []
            while (s.step()) {
                const vdt = (s.getAsObject() as unknown) as Vdt
                vdtList.push(vdt)
            }
            s.free()
            return vdtList
        } else if (!map && !track) {
            const s = db.prepare('SELECT * from vdt')
            const vdtList: Vdt[] = []
            while (s.step()) {
                const vdt = (s.getAsObject() as unknown) as Vdt
                vdtList.push(vdt)
            }
            s.free()
            return vdtList
        } else if (map && !track) {
            const s = db.prepare(`SELECT * FROM vdt WHERE track LIKE :track`)
            const vdtList: Vdt[] = []
            assertTrue(s.bind({ ':track': `${map}%` }))
            while (s.step()) {
                const vdt = (s.getAsObject() as unknown) as Vdt
                vdtList.push(vdt)
            }
            s.free()
            return vdtList
        } else if (map && track) {
            const s = db.prepare('SELECT * FROM vdt WHERE track=:track')
            const vdtList: Vdt[] = []
            assertTrue(s.bind({ ':track': `${map} / ${track}` }))
            while (s.step()) {
                const vdt = (s.getAsObject() as unknown) as Vdt
                vdtList.push(vdt)
            }
            s.free()
            return vdtList
        } else {
            throw `map: ${map} & track: ${track}`
        }
    }

    async getVdt(date: string): Promise<Vdt> {
        const db = await this.db()
        const s = db.prepare('SELECT * from vdt WHERE date=:date')
        const vdt = (s.getAsObject({ ':date': date }) as unknown) as Vdt
        s.free()
        return vdt
    }

    async getPilots(): Promise<PilotData[]> {
        return Promise.resolve(this.pilotData)
    }

    async getPilotNames(): Promise<string[]> {
        return Promise.resolve([...this.pilotRecords.keys()])
    }

    async getPilotTable(name: string): Promise<number[]> {
        const pd = this.pilotData.find(x => x.name === name)
        return Promise.resolve(pd ? pd.table : [])
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
        s.free()
        return records
    }

    async getRaceNavigation(date: string): Promise<{ prev: string | undefined, next: string | undefined }> {
        const db = await this.db()
        const s_prev = db.prepare('SELECT * from vdt WHERE date<:date ORDER BY date DESC LIMIT 1')
        const prev = (s_prev.getAsObject({ ':date': date }) as unknown) as Vdt
        const s_next = db.prepare('SELECT * from vdt WHERE date>:date ORDER BY date ASC LIMIT 1')
        const next = (s_next.getAsObject({ ':date': date }) as unknown) as Vdt
        s_prev.free()
        s_next.free()
        return { prev: prev.date, next: next.date }
    }
}

function makeTable(records: PilotRecord[]): number[] {
    const dates = records.map(x => x.vdtDate)
    const table = dates.map(x => df.differenceInCalendarDays(new Date(), df.parse(x, vdtDateFormat, new Date())))
    return table
}
