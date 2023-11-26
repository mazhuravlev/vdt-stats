import { DataTable } from "primereact/datatable"
import { DataAccess } from "./DataAccess"
import { useEffect, useState } from "react"
import { TrackSummary } from "./types"
import { Column } from "primereact/column"
import { FilterMatchMode } from "primereact/api"
import { InputText } from "primereact/inputtext"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

interface TracksProps {
    dataAccess: DataAccess
}

export const Tracks: React.FC<TracksProps> = props => {
    const { t } = useTranslation()

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
                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder={t('search')} />
            </span>
        </div>
        <DataTable
            size='small'
            filters={filters}
            globalFilterFields={['track']}
            paginator rows={50}
            value={trackSummary}
        >
            <Column header='#' body={(_data, props) => props.rowIndex} />
            <Column sortable header={t('tracks.repeats')}
                body={x => <span title={`vdt repeats: ${x.repeats}`}>{x.repeats}</span>} />
            <Column sortable body={x => <Link to={{ pathname: '/races', search: `map=${x.map}` }} >{x.map}</Link>} header={t('tracks.map')} />
            <Column sortable body={x => <Link to={{ pathname: '/races', search: `track=${x.track}&map=${x.map}` }} >{x.track}</Link>} header={t('tracks.track')} />
            <Column sortable field="updates" header={t('tracks.updates')} />
        </DataTable>
    </div>
}