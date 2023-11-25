import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { PilotData, vdtDateFormat } from "./types"
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
import { Calendar } from "primereact/calendar"
import * as df from 'date-fns'
import { Nullable } from "primereact/ts-helpers"

interface IndexProps {
    dataAccess: DataAccess
}

export const PilotIndex: React.FC<IndexProps> = (props) => {
    const { dataAccess } = props
    const [pilots, setPilotData] = useState<PilotData[]>([])
    const [paginator, setPaginator] = useState(true)

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [globalFilterValue, setGlobalFilterValue] = useState('')

    const getData = () =>
        dataAccess.getPilots()
            .then((x: PilotData[]) => {
                setPilotData(x)
            })

    const applySavePilots = () => {
        localStorage.setItem('sumPilots', sumPilots)
        dataAccess.init().then(() => {
            getData()
        })
    }

    const resetSumPilots = () => {
        const x = defaultPilotsReplacement;
        localStorage.setItem('sumPilots', x)
        setSumPilots(x)
        dataAccess.init().then(() => {
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

    const setDate = (startDate: Nullable<Date>, endDate: Nullable<Date>): void => {
        dataAccess.setSeason(startDate, endDate).then(() => getData())
    }

    const parseVdtDate = (vdtDate: string | undefined): Date | undefined => vdtDate ? df.parse(vdtDate, vdtDateFormat, new Date()) : undefined

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
            <AccordionTab header="Season">
                <div className="flex">
                    <div className='m-2'>
                        <label htmlFor="cal_date_end" className="mx-2">Season end</label>
                        <Calendar
                            id="cal_date_end"
                            view='month'
                            dateFormat="MM yy"
                            value={dataAccess.seasonEndDate ? parseVdtDate(dataAccess.seasonEndDate) : undefined}
                            onChange={(e) => setDate(
                                parseVdtDate(dataAccess.seasonStartDate),
                                e.value && df.lastDayOfMonth(e.value))} />
                    </div>
                    <div className='m-2'>
                        <label htmlFor="cal_date" className="mx-2">Season start</label>
                        <Calendar
                            id="cal_date"
                            view='month'
                            dateFormat="MM yy"
                            value={parseVdtDate(dataAccess.seasonStartDate)}
                            onChange={(e) => setDate(e.value, parseVdtDate(dataAccess.seasonEndDate))} />
                    </div   >
                    <div className="flex">
                        <Button
                            onClick={() => setDate(undefined, undefined)}
                            className='m-2' outlined severity='warning'>
                            Clear
                        </Button>
                    </div>
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
                <Column header="#" body={(_, props) => props.rowIndex + 1} />
                <Column sortable field="name" header="Name" body={p => <Link to={`/pilot/${p.name}`}>{p.name}</Link>}></Column>
                <Column sortable field="race_count" header="Race count"></Column>
                <Column sortable field="avg_delta" header="Average delta %" body={x => x.avg_delta?.toFixed(2) ?? '—'}></Column>
                <Column sortable field="total_updates" header="Total updates"></Column>
                <Column sortable field="longest_streak" header="Longest streak"></Column>
            </DataTable>
        </div>
    </div>
} 