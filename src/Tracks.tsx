import { DataTable } from "primereact/datatable"
import { DataAccess } from "./DataAccess"
import { useEffect, useState } from "react"
import { TrackSummary } from "./types"
import { Column } from "primereact/column"
import { FilterMatchMode } from "primereact/api"
import { InputText } from "primereact/inputtext"

interface TracksProps {
    dataAccess: DataAccess
}

export const Tracks: React.FC<TracksProps> = props => {
    const [trackSummary, setTrackSummary] = useState<TrackSummary[]>()

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [globalFilterValue, setGlobalFilterValue] = useState('')

    useEffect(() => {
        props.dataAccess.getTrackSummary().then(setTrackSummary)
    }, [])

    const onGlobalFilterChange = (e: any) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    return <div>
        <div className="flex justify-content-start m-2">
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search" />
            </span>
        </div>
        <DataTable
            size='small'
            filters={filters}
            globalFilterFields={['map']}
            paginator rows={50}
            value={trackSummary}
        >
            <Column header='#' body={(_data, props) => props.rowIndex} />
            <Column sortable header="R"
                body={x => <span title={`vdt repeats: ${x.repeats}`}>{x.repeats}</span>} />
            <Column sortable field="map" header="Map" />
            <Column sortable field="track" header="Track" />
            <Column sortable field="updates" header="Updates" />
        </DataTable>
    </div>
}