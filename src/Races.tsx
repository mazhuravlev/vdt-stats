import { useEffect, useState } from "react"
import { DataAccess } from "./DataAccess"
import { Vdt } from "./types"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Link } from "react-router-dom"
import { useQuery } from "./useQuery"
import { useTranslation } from "react-i18next"
import { Button } from "primereact/button"

interface RacesProps {
    dataAccess: DataAccess
}

export const Races: React.FC<RacesProps> = (props) => {
    const [vdtList, setVdt] = useState<Vdt[]>([])
    const query = useQuery()
    const map = query.get('map') ?? undefined
    const track = query.get('track') ?? undefined
    const pilot = query.get('pilot') ?? undefined

    const { t } = useTranslation()

    useEffect(() => {
        props.dataAccess.getVdtList(map, track, pilot).then(x => setVdt(x))
    }, [map, track])

    return <div>
        {pilot && <Link to={`/pilot/${pilot}`}><Button className="my-2"><b>{pilot}</b></Button></Link>}
        <DataTable
            paginator
            rows={50}
            size='small'
            value={vdtList}
            sortField="date"
            sortOrder={-1}
        >
            <Column sortable field="season" header={t('races.season')} />
            <Column sortable field="date" header={t('races.date')} />
            <Column header="vdt"
                body={x => <a href={x.url}>↗</a>} />
            <Column sortable header={t('races.track')}
                body={x => <Link to={`/race/${x.date}`}>{x.track}</Link>} />
            <Column sortable field="pilots" header={t('races.pilots')} />
            <Column sortable field="updates" header={t('races.updates')} />
        </DataTable>
    </div>
}