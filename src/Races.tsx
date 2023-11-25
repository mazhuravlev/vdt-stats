import { useEffect, useState } from "react"
import { DataAccess } from "./DataAccess"
import { Vdt } from "./types"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { FilterMatchMode } from "primereact/api"
import { Link } from "react-router-dom"
import { useQuery } from "./useQuery"

interface RacesProps {
    dataAccess: DataAccess
}

export const Races: React.FC<RacesProps> = (props) => {
    const [vdtList, setVdt] = useState<Vdt[]>([])
    const query = useQuery()
    const map = query.get('map') ?? undefined
    const track = query.get('track') ?? undefined

    useEffect(() => {
        props.dataAccess.getVdtList(map, track).then(x => setVdt(x))
    }, [map, track])

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
            sortField="date"
            sortOrder={-1}
        >
            <Column sortable field="season" header="S" body={x => <span title={`Season ${x.season}`}>{x.season}</span>} />
            <Column sortable field="date" header="Date" />
            <Column header="vdt"
                body={x => <a href={x.url}>↗</a>} />
            <Column sortable filter={true} filterField='track' header="Track"
                body={x => <Link to={`/race/${x.date}`}>{x.track}</Link>} />
            <Column sortable field="pilots" header="Pilots" />
            <Column sortable field="updates" header="Updates" />
        </DataTable>
    </div>
}