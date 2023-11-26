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

const dbFile = '../public/data/vdt.db'
const vdtBaseUrl = 'https://vdt.tg/';
console.log('start..');

(async () => {
    const dataSource = new DataSource({
        type: 'sqlite',
        database: dbFile,
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


    const today = df.format(new Date(), 'yyyy-MM-dd')
    const recordDeleteResult = await dataSource
        .getRepository(VdtRecord)
        .createQueryBuilder('vdtRecord')
        .delete()
        .from(VdtRecord)
        .where("vdtDate = :today", { today })
        .execute()
    console.log(`deleted today's vdt records: ${recordDeleteResult.affected ?? 0}`)
    const deleteResult = await dataSource
        .getRepository(Vdt)
        .createQueryBuilder('vdt')
        .delete()
        .from(Vdt)
        .where("date = :today", { today })
        .execute()
    console.log(`deleted today's vdt: ${deleteResult.affected ?? 0}`)

    const vdts = await dataSource
        .getRepository(Vdt)
        .createQueryBuilder('vdt')
        .select('date')
        .getRawMany<{ date: string }>()

    const dateSet = new Set(vdts.map(x => x.date))

    const vdtList = _vdtList.filter(x => !dateSet.has(x.date))
    console.log(`got ${_vdtList.length} vdt, ${vdtList.length} new`)
    dataSource.manager.save([...vdtList])


    for (let i = 0; i < vdtList.length; i++) {
        const vdt = vdtList[i];
        const res = await fetch(vdt.url).then(res => res.text())
        const dom = new JSDOM(res, { url: vdtBaseUrl })
        const t = dom.window.document.querySelector('.stattable') as HTMLTableElement
        const records = [...t.tBodies[0].rows].slice(1).map(x => {
            const row = [...x.cells].map(x => x.textContent)
            const deltaParts = row[4].replace('+', '').split(' ')
            const record = new VdtRecord();
            const placeStr = row[0].replace(')', '');
            record.id = `${vdt.date}_${placeStr}`
            record.place = Number(placeStr)
            record.globalPlace = Number(row[1])
            record.name = row[2].trim()
            record.time = Number(row[3].split('+')[0])
            record.drone = row[5]
            record.updates = Number(row[7])
            record.updateTime = row[6]
            record.deltaTime = Number(deltaParts[0])
            record.deltaPercent = deltaParts[1] === '' ? 0 : Number(deltaParts[1].replaceAll(/[()%]/g, ''))
            record.vdt = vdt
            return record
        })
        console.log(`save (records: ${records.length}) ${vdt.date} ${((i / vdtList.length) * 100).toFixed(1)}% (${i + 1})`)
        dataSource.manager.save(records)
        await new Promise(resolve =>
            setTimeout(resolve, 50)
        )
    }
})().then(() => {
    console.log('done..')
})
