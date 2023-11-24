import { Link, useParams } from "react-router-dom"
import { DataAccess } from "./DataAccess"
import { useEffect, useState } from "react"
import { Vdt, VdtRecord } from "./types"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { assertDefined } from "./func"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Button } from "primereact/button"
import { useLocalStorage } from "@uidotdev/usehooks"
import toast from "react-hot-toast"

interface RaceIndexProps {
    dataAccess: DataAccess
}

interface DataState {
    records: (VdtRecord & { avgDelta: number })[]
    vdt: Vdt,
    navigation: { prev: string | undefined, next: string | undefined }
}

export const Race: React.FC<RaceIndexProps> = (props) => {
    const params = useParams()
    const date = assertDefined(params.date)
    const [data, setData] = useState<DataState>()
    const [sizeC, setSizeC] = useLocalStorage('race_sizeC', 20)

    useEffect(() => {
        const { dataAccess } = props
        Promise.all([
            dataAccess.getRaceRecords(date),
            dataAccess.getVdt(date),
            dataAccess.getPilots(),
            dataAccess.getRaceNavigation(date,)
        ] as const)
            .then(x => {
                const map = new Map(x[2].map(pd => [pd.name, pd]))
                setData({
                    records: x[0].map(r => ({ ...r, avgDelta: assertDefined(map.get(r.name)?.avg_delta) })),
                    vdt: x[1],
                    navigation: x[3]
                })
            })
    }, [date])
    if (!data) return 'loading..'
    const { vdt, records, navigation } = data

    const onTrackClick = async (vdt: Vdt) => {
        const text = vdt.track.split('/')[1].trim()
        await navigator.clipboard.writeText(text)
        toast('Track name copied to clipboard')
    }

    return <div className="my-4">
        <div className="flex justify-content-between my-2">
            {navigation.prev && <div className="align-self-start h-2rem flex align-items-center justify-content-center">
                <Link to={`/race/${navigation.prev}`}><Button outlined size='small'>⮜ {navigation.prev} </Button></Link>
            </div>}
            {navigation.next && <div className="align-self-end h-2rem flex align-items-center justify-content-center">
                <Link to={`/race/${navigation.next}`}><Button outlined size='small'>{navigation.next} ⮞</Button></Link>
            </div>}
        </div>
        <div className="flex gap-3 my-2">
            <div className="border-round  h-2rem flex align-items-center justify-content-center">Season {vdt.season}</div>
            <div className="border-round  h-2rem flex align-items-center justify-content-center">{vdt.date}</div>
            <div
                className="border-round  h-2rem px-4 bg-primary font-bold flex align-items-center justify-content-center">
                {vdt.track} <span style={{ cursor: 'pointer' }} onClick={() => onTrackClick(vdt)}>📋</span>
            </div>
            <div className="border-round  h-2rem flex align-items-center justify-content-center">
                <a href={vdt.url}>VDT ↗</a>
            </div>
        </div>
        <div className="my-2">
            <span className="p-buttonset">
                {[15, 20, 30].map(x =>
                    <Button
                        key={x}
                        label={x.toFixed(0)}
                        size='small'
                        severity={x === sizeC ? undefined : 'secondary'}
                        onClick={() => setSizeC(x)}
                    />)}
            </span>
        </div>
        <div style={{ width: '100%', height: records.length * sizeC }}>
            <ResponsiveContainer>
                <BarChart layout='vertical' data={records}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type='number' dataKey='deltaPercent' />
                    <YAxis width={150} type='category' dataKey='name' />
                    <Tooltip content={CustomTooltip} />
                    <Legend />
                    <Bar name="Delta %" dataKey="deltaPercent" fill="#82ca9d" />
                    <Bar name='Avg delta %' dataKey="avgDelta" fill="#504e81" />
                </BarChart>
            </ResponsiveContainer>
        </div>
        <DataTable size='small' value={records}>
            <Column field='place' header='VDT place' />
            <Column field='globalPlace' header='VD place' />
            <Column body={x => <Link to={`/pilot/${x.name}`}>{x.name}</Link>} header='Name' />
            <Column field='drone' header='Drone' />
            <Column field='time' header='Time' />
            <Column field='updates' header='Updates' />
            <Column field='deltaPercent' header='Delta %' />
        </DataTable>
    </div>
}

const CustomTooltip = (props: any) => {
    const { active, payload } = props
    if (active && payload && payload.length) {
        const rec = payload[0].payload
        return (
            <div className="custom-tooltip">
                <div><b>{rec.name}</b></div>
                <div><b>{rec.deltaPercent}</b> дельта %</div>
                <div><b>{rec.avgDelta.toFixed(2)}</b> сред. дельта %</div>
            </div>
        );
    }

    return null;
};