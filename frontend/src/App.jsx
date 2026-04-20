import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import api from './services/api'

function App() {
  const [mensaje, setMensaje] = useState('Conectando...')

  useEffect(() => {
    api.get('/hello/')
      .then(res => setMensaje(res.data.mensaje))
      .catch(() => setMensaje('Error al conectar con el backend'))
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div className="p-8">
            <h1 className="text-2xl font-bold text-yellow-500">Sistema Gestión Finca Villa Yaiza</h1>
            <p className="mt-4 text-gray-600">Estado backend: <span className="font-bold">{mensaje}</span></p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App