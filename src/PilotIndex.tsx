import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { PilotData } from "./types"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { DataAccess } from "./DataAccess"
import { Checkbox } from "primereact/checkbox"
import { InputTextarea } from "primereact/inputtextarea"
import { Button } from "primereact/button"
import { Accordion, AccordionTab } from "primereact/accordion"
import { defaultPilotsReplacement } from "./defaultPilotsReplacement"
import { FilterMatchMode } from "primereact/api"
import { InputText } from "primereact/inputtext"

interface IndexProps {
    dataAccess: DataAccess
}

export const PilotIndex: React.FC<IndexProps> = (props) => {
    const [pilots, setPilotData] = useState<PilotData[]>([])
    const [paginator, setPaginator] = useState(true)

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [globalFilterValue, setGlobalFilterValue] = useState('')

    const getData = () =>
        props.dataAccess.getPilots()
            .then((x: PilotData[]) => {
                setPilotData(x)
            })

    const applySavePilots = () => {
        localStorage.setItem('sumPilots', sumPilots)
        props.dataAccess.init().then(() => {
            getData()
        })
    }

    const resetSumPilots = () => {
        const x = defaultPilotsReplacement;
        localStorage.setItem('sumPilots', x)
        setSumPilots(x)
        props.dataAccess.init().then(() => {
            getData()
        })
    }

    const onGlobalFilterChange = (e: any) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const [sumPilots, setSumPilots] = useState(localStorage.getItem('sumPilots') ?? defaultPilotsReplacement)

    useEffect(() => {
        getData()
    }, [])
    return <div>
        <Accordion>
            <AccordionTab header="Settings">
                <div className="m-2">
                    <div className="flex align-items-center">
                        <Checkbox onChange={() => setPaginator(!paginator)} checked={paginator} />
                        <label className="ml-2">paginator</label>
                    </div>
                </div>
                <div className="m-2">
                    <InputTextarea value={sumPilots} onChange={e => setSumPilots(e.target.value)} rows={5} cols={50} />
                    <Button className="m-2" onClick={applySavePilots}>Save</Button>
                    <Button className="m-2" onClick={resetSumPilots}>Reset</Button>
                </div>
            </AccordionTab>
        </Accordion>
        <div>
            <div className="flex justify-content-start m-2">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search" />
                </span>
            </div>
            <DataTable
                filters={filters}
                globalFilterFields={['name']}
                paginator={paginator} rows={50}
                stripedRows size='small'
                value={pilots}
                tableStyle={{ minWidth: '50rem' }}
                sortField='avg_delta'
                sortOrder={1}
            >
                <Column sortable field="name" header="Name" body={p => <Link to={`/pilot/${p.name}`}>{p.name}</Link>}></Column>
                <Column sortable field="race_count" header="Race count"></Column>
                <Column sortable field="avg_delta" header="Average delta %" body={x => x.avg_delta.toFixed(2)}></Column>
                <Column sortable field="total_updates" header="Total updates"></Column>
                <Column sortable field="longest_streak" header="Longest streak"></Column>
            </DataTable>
        </div>
    </div>
} 