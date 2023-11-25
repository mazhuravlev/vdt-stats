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
import { Pilots } from './Pilots';
import { Button } from 'primereact/button';
import { DataAccess } from './DataAccess';
import { Races } from './Races';
import { Redirect } from './Redirect';
import { Race } from './Race';
import { Toaster } from 'react-hot-toast';
import { Tracks } from './Tracks';
import { Track } from './Track';

function App(props: { dataAccess: DataAccess }) {
    return <HashRouter>
        <div className='m-2'>
            <NavLink to='/races' className='mx-2'>
                {props => <Button severity={props.isActive ? undefined : 'secondary'}>Races</Button>}
            </NavLink>
            <NavLink to='/pilots' className='mx-2'>
                {props => <Button severity={props.isActive ? undefined : 'secondary'}>Pilots</Button>}
            </NavLink>
            <NavLink to='/tracks' className='mx-2'>
                {props => <Button severity={props.isActive ? undefined : 'secondary'}>Tracks</Button>}
            </NavLink>
        </div>
        <Routes>
            <Route
                path='/race/:date'
                element={<Race dataAccess={props.dataAccess} />} />
            <Route
                path='/races'
                element={<Races dataAccess={props.dataAccess} />} />
            <Route
                path='/pilot/:name'
                element={<Pilot dataAccess={props.dataAccess} />} />
            <Route
                path='/pilots'
                element={<Pilots dataAccess={props.dataAccess} />} />
            <Route
                path='/tracks'
                element={<Tracks dataAccess={props.dataAccess} />} />
            <Route
                path='/track/:track'
                element={<Track dataAccess={props.dataAccess} />} />
            <Route
                path='/'
                element={<Redirect to='/races' />} />
        </Routes>
        <Toaster />
    </HashRouter>
}

export default App

