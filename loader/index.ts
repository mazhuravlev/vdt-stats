import { JSDOM } from 'jsdom'
import * as df from 'date-fns'
import { DataSource, ManyToOne, Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class Vdt {
    @Column()
    season: number;

    @PrimaryColumn('varchar', { length: 10 })
    date: string;

    @Column()
    url: string;

    @Column()
    track: string;

    @Column()
    type: '3lap' | '1lap';

    @Column()
    updates: number;

    @Column()
    pilots: number;

    @OneToMany(type => VdtRecord, x => x.vdt)
    records: VdtRecord[];
}

@Entity()
export class VdtRecord {
    @PrimaryColumn('varchar', { length: 14 })
    id: string

    @Column()
    place: number

    @Column()
    globalPlace: number

    @Column()
    name: string

    @Column()
    time: number

    @Column()
    drone: string

    @Column()
    updates: number

    @Column()
    updateTime: string

    @Column()
    deltaTime: number

    @Column()
    deltaPercent: number

    @ManyToOne(type => Vdt)
    vdt: Vdt
}

const vdtBaseUrl = 'https://vdt.tg/';
console.log('start..');

(async () => {
    const dataSource = new DataSource({
        type: 'sqlite',
        database: 'vdt.db',
        entities: [Vdt, VdtRecord],
        synchronize: true,
    })
    await dataSource.initialize()
    const listResponse = await (fetch(vdtBaseUrl).then(res => res.text()))
    const dom = new JSDOM(listResponse, { url: vdtBaseUrl })
    const t = dom.window.document.querySelector('.stattable') as HTMLTableElement
    const _vdtList = [...t.tBodies[0].rows].flatMap(x => {
        const a = x.cells[2].children[0]
        if (a && ('href' in a)) {
            const vdt = new Vdt()
            vdt.date = x.cells[1].textContent
            vdt.url = a.href as string
            vdt.season = Number(x.cells[0].textContent)
            vdt.track = x.cells[2].textContent
            vdt.updates = Number(x.cells[3].textContent)
            vdt.pilots = Number(x.cells[4].textContent)
            vdt.type = (a.href as string).endsWith('3Lap') ? '3lap' : '1lap'
            return [vdt]
        } else {
            return []
        }
    })
    console.log(`Received ${_vdtList.length} VDT`)
})().then(() => {
    console.log('done..')
})
