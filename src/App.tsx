import './App.css'
import "primereact/resources/themes/lara-dark-blue/theme.css";
import 'primeflex/primeflex.css'
import 'primeflex/themes/primeone-dark.css'
import {
    BrowserRouter,
    Routes,
    Route,
    Link,
} from "react-router-dom";
import { Pilot } from './Pilot';
import { Index } from './Index';
import { Button } from 'primereact/button';
import { DataAccess } from './DataAccess';

function App(props: { dataAccess: DataAccess }) {

    return <BrowserRouter>
        <div className='m-2'>
            <Link to='/'>
                <Button>🗐</Button>
            </Link>
        </div>
        <Routes>
            <Route
                path='/pilot/:name'
                element={<Pilot dataAccess={props.dataAccess} />} />
            <Route
                path='/'
                element={<Index dataAccess={props.dataAccess} />} />
        </Routes>
    </BrowserRouter>
}

export default App