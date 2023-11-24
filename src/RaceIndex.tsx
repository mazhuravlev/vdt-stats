import { useEffect, useState } from "react"
import { DataAccess } from "./DataAccess"
import { Vdt } from "./types"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { FilterMatchMode } from "primereact/api"
import { Link } from "react-router-dom"

interface RaceIndexProps {
    dataAccess: DataAccess
}


export const RaceIndex: React.FC<RaceIndexProps> = (props) => {
    const [vdtList, setVdt] = useState<Vdt[]>([])

    useEffect(() => {
        props.dataAccess.getVdtList().then(x => setVdt(x))
    }, [])

    const [filters] = useState({
        track: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });

    return <div>
        <DataTable
            paginator
            rows={50}
            size='small'
            value={vdtList}
            filters={filters}
            filterDisplay='row'
        >
            <Column sortable field="season" header="Season" />
            <Column sortable field="date" header="Date" />
            <Column header="VDT"
                body={x => <a href={x.url}>↗</a>} />
            <Column sortable filter={true} filterField='track' header="Track"
                body={x => <Link to={`/race/${x.date}`}>{x.track}</Link>} />
            <Column sortable field="pilots" header="Pilots" />
            <Column sortable field="updates" header="Updates" />
        </DataTable>
    </div>
}