import { useEffect, useState } from 'react'
import { ScatterChart, XAxis, YAxis, Scatter, Tooltip, CartesianGrid, ComposedChart, Area, ResponsiveContainer, ReferenceLine } from 'recharts'
import { PilotData, PilotRecord } from './types'
import lowess from '@stdlib/stats-lowess'
import { AutoComplete, AutoCompleteCompleteEvent } from "primereact/autocomplete";
import { PrimeReactProvider } from 'primereact/api';
import { Slider } from 'primereact/slider'
import moment from 'moment'
import { useDebounce } from './useDebounce'
import { useLocalStorage } from '@uidotdev/usehooks'
import { Button } from 'primereact/button'
import { useNavigate, useParams } from 'react-router-dom';
import { DataAccess } from './DataAccess';

interface PilotProps {
  dataAccess: DataAccess
}

export const Pilot: React.FC<PilotProps> = (props) => {
  let { name } = useParams()
  if (!name) throw 'name'
  const navigate = useNavigate()

  const [f_ui, setF_ui] = useState((() => {
    const f = Number(localStorage.getItem('loess_f'))
    return f ? f : 0.25
  })())
  const [f, setF] = useDebounce(200, f_ui)
  useEffect(() => {
    setF(f_ui)
    localStorage.setItem('loess_f', f_ui.toFixed(2))
  }, [f_ui])

  const [showScatter, setsShowScatter] = useLocalStorage('show_scatter', true)

  const [table, setTable] = useState<{ x: number, y: number }[]>([])
  const [records, setRecords] = useState<(PilotRecord)[]>([])
  const [pilotData, setPilotData] = useState<Map<string, PilotData>>(new Map())
  const [pilotNames, setPilotNames] = useState(new Set<string>)
  const [autocompletePilotNames, setAutocompletePilotNames] = useState<string[]>([])

  const [name_ui, setName_ui] = useState(name)
  useEffect(() => {
    if (pilotNames.has(name_ui)) {
      navigate(`/pilot/${name_ui}`)
    }
  }, [name_ui])

  useEffect(() => {
    props.dataAccess.getPilots()
      .then((x: PilotData[]) => {
        setPilotData(new Map(x.map(x => [x.name, x])))
        setPilotNames(new Set(x.map(a => a.name)))
      })
  }, [])

  useEffect(() => {
    if (!name) return
    props.dataAccess.getPilotTable(name)
      .then(a => setTable(a.map(x => ({ x, y: 0 }))))
  }, [name])

  useEffect(() => {
    if (!name) return
    props.dataAccess.getPilotRecords(name)
      .then((rec: PilotRecord[]) => {
        if (rec.length === 0) {
          setRecords([])
          return
        }
        const l = lowess(rec.map(x => x.index), rec.map(x => x.deltaPercent), { sorted: true, f })
        for (let i = 0; i < rec.length; i++) {
          rec[i].l = l.y[i] > 0 ? l.y[i] : 0
        }
        setRecords(rec)
      })
  }, [name, f])

  const search = (event: AutoCompleteCompleteEvent) => {
    setAutocompletePilotNames(
      [...pilotNames]
        .filter(x => x.toLowerCase().includes(event.query.toLowerCase())));
  }

  const pilot = pilotData.get(name)

  const [selectedDates, setSelectedDates] = useState<{ x: number, date: string }[]>([])
  const onClick = (e: any): void => {
    const a = { x: e.activeLabel, date: e.activePayload[0].payload.vdtDate }
    selectedDates.unshift(a)
    setSelectedDates(selectedDates.slice(0, 2))
  }

  return (
    <PrimeReactProvider>
      <AutoComplete
        value={name_ui}
        suggestions={autocompletePilotNames}
        completeMethod={search}
        style={{ marginBottom: '12px' }}
        onChange={(e) => setName_ui(e.value)}
        dropdown />
      <div style={{ width: '100vw', maxWidth: 1280 }}>
        {pilot && <table className='tt' cellSpacing={0}><tbody>
          <tr><td>Количество гонок</td><td>{pilot.race_count}</td></tr>
          <tr><td>Количество обновлений</td><td>{pilot.total_updates}</td></tr>
          <tr><td>Средняя дельта %</td><td>{pilot.avg_delta.toFixed(2)}</td></tr>
        </tbody></table>}
        <div style={{ width: '100%', height: 80 }}>
          <ResponsiveContainer>
            <ScatterChart syncId='pilot'>
              <XAxis dataKey="x" type="number" />
              <YAxis dataKey="y" type="number" />
              <Tooltip content={CustomTooltip} />
              <Scatter name="a" data={table} fill="#82ca9d" shape={square(3, 8)} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        {records &&
          <div>
            <div className='flex'>
              <div className='flex-initial m-2'>
                <Button onClick={() => setsShowScatter(!showScatter)}>{showScatter ? 'Скрыть' : 'Показать'} точки</Button>
              </div>
              <div className='flex-initial m-2'>Сглаживание {f_ui}</div>
              <div className='flex-initial m-2' style={{ width: 300 }}>
                <Slider title='Сглаживание' style={{ marginTop: 12, marginBottom: 12 }}
                  value={f_ui} onChange={(e) => setF_ui(Number(e.value))} min={0.01} max={1} step={0.01} />
              </div>
              {selectedDates.length === 2 && <div className='flex-initial m-2'>
                Разница в днях: {Math.abs(moment(selectedDates[0].date, "YYYY-MM-DD").diff(moment(selectedDates[1].date, "YYYY-MM-DD"), 'days'))}
              </div>}
            </div>
            <div style={{ width: '100%', height: 500 }}>
              <ResponsiveContainer>
                <ComposedChart
                  onClick={e => onClick(e)}
                  syncId='pilot'
                  data={records}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index" />
                  {showScatter ? <YAxis type='number' dataKey='deltaPercent' /> :
                    <YAxis type='number' dataKey='l' />}
                  <Tooltip content={CustomTooltip2} />
                  {showScatter && <Scatter
                    dataKey="deltaPercent"
                    stroke="transparent"
                    fill='rgb(107 107 107)'
                    shape={dot(2)} />}
                  <Area dataKey="l" fill="rgba(130,202,157,0.1)" stroke="red" />
                  {selectedDates.map(x => <ReferenceLine x={x.x} key={x.x} stroke="green" />)}
                </ComposedChart >
              </ResponsiveContainer>
            </div>
          </div>}
      </div>
    </PrimeReactProvider>
  )
}

const dot = (r: number) => (props: any) => <circle
  fill="#82ca9d"
  cx={props.x + r / 2}
  cy={props.y + r / 2}
  r={r} />

const square = (w: number, h: number) => (props: any) => <rect
  fill="#82ca9d"
  x={props.x}
  y={props.y}
  width={w} height={h} />

const CustomTooltip = (props: any) => {
  const { active, payload } = props
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        {moment().subtract(payload[0].value, 'days').format('DD.MM.YYYY')}
      </div>
    );
  }

  return null;
};

const CustomTooltip2 = (props: any) => {
  const { active, payload } = props
  if (active && payload && payload.length) {
    if (payload[0].payload && payload[0].payload.vdtDate) {
      return (
        <div className="custom-tooltip">
          <p>{moment(payload[0].payload.vdtDate, "YYYY-MM-DD").format('DD.MM.YYYY')}</p>
          <p>{payload[0].payload.l.toFixed(0)} %</p>
        </div>
      );
    }
    return null
  }

  return null;
};

