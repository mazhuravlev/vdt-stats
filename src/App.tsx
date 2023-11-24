import './App.css'
import "primereact/resources/themes/lara-dark-blue/theme.css";
import 'primeflex/primeflex.css'
import 'primeflex/themes/primeone-dark.css'
import {
    Routes,
    Route,
    HashRouter,
    NavLink,
} from "react-router-dom";
import { Pilot } from './Pilot';
import { PilotIndex } from './PilotIndex';
import { Button } from 'primereact/button';
import { DataAccess } from './DataAccess';
import { RaceIndex } from './RaceIndex';
import { Redirect } from './Redirect';
import { Race } from './Race';
import { Toaster } from 'react-hot-toast';

function App(props: { dataAccess: DataAccess }) {
    return <HashRouter>
        <div className='m-2'>
            <NavLink to='/races' className='mx-2'>
                {props => <Button severity={props.isActive ? undefined : 'secondary'}>Races</Button>}
            </NavLink>
            <NavLink to='/pilots' className='mx-2'>
                {props => <Button severity={props.isActive ? undefined : 'secondary'}>Pilots</Button>}
            </NavLink>
        </div>
        <Routes>
            <Route
                path='/race/:date'
                element={<Race dataAccess={props.dataAccess} />} />
            <Route
                path='/races'
                element={<RaceIndex dataAccess={props.dataAccess} />} />
            <Route
                path='/pilot/:name'
                element={<Pilot dataAccess={props.dataAccess} />} />
            <Route
                path='/pilots'
                element={<PilotIndex dataAccess={props.dataAccess} />} />
            <Route
                path='/'
                element={<Redirect to='/races' />} />
        </Routes>
        <Toaster />
    </HashRouter>
}

export default App

