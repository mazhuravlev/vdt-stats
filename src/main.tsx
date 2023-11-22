import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { DataAccess } from './DataAccess.ts'

const dataAccess = new DataAccess()
dataAccess.init()
  .then(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App dataAccess={dataAccess} />
      </React.StrictMode>,
    )
  })

