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
import { useTranslation } from 'react-i18next';
import i18n from './i18n';

const lngs: Record<string, { nativeName: string }> = {
    en: { nativeName: 'English' },
    ru: { nativeName: 'Русский' }
}

function App(props: { dataAccess: DataAccess }) {
    const { t } = useTranslation()
    return <HashRouter>
        <div className='my-2 flex justify-content-between'>
            <div>
                <NavLink to='/races'>
                    {props => <Button severity={props.isActive ? undefined : 'secondary'}>{t('menu.races')}</Button>}
                </NavLink>
                <NavLink to='/pilots' className='mx-2'>
                    {props => <Button severity={props.isActive ? undefined : 'secondary'}>{t('menu.pilots')}</Button>}
                </NavLink>
                <NavLink to='/tracks' className='mx-2'>
                    {props => <Button severity={props.isActive ? undefined : 'secondary'}>{t('menu.tracks')}</Button>}
                </NavLink>
            </div>
            <div>
                <div className='p-buttonset'>
                    {Object.keys(lngs).map((lng) => (
                        <Button key={lng}
                            severity={i18n.resolvedLanguage === lng ? undefined : 'secondary'}
                            onClick={() => i18n.changeLanguage(lng)}>
                            {lngs[lng].nativeName}
                        </Button>
                    ))}
                </div>
            </div>
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

