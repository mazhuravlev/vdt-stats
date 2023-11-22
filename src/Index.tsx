import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { PilotData } from "./types"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { DataAccess } from "./DataAccess"

interface IndexProps {
    dataAccess: DataAccess
}

export const Index: React.FC<IndexProps> = (props) => {
    const [pilots, setPilotData] = useState<PilotData[]>([])
    useEffect(() => {
        props.dataAccess.getPilots()
            .then((x: PilotData[]) => {
                setPilotData(x)
            })
    }, [])
    return <div>
        <div>
            <DataTable stripedRows size='small' value={pilots} tableStyle={{ minWidth: '50rem' }}>
                <Column sortable field="name" header="Name" body={p => <Link to={`/pilot/${p.name}`}>{p.name}</Link>}></Column>
                <Column sortable field="race_count" header="Race count"></Column>
                <Column sortable field="avg_delta" header="Average delta %" body={x => x.avg_delta.toFixed(2)}></Column>
                <Column sortable field="total_updates" header="Total updates"></Column>
            </DataTable>
        </div>
    </div>
} 