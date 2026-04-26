import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Tables from './pages/Tables'
import Orders from './pages/Orders'
import Stock from './pages/Stock'
import Reports from './pages/Reports'
import Menu from './pages/Menu'
import Products from './pages/Products'
import Cashier from './pages/Cashier'
import Login from './pages/Login'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/tables" element={<Tables />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/stock" element={<Stock />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/products" element={<Products />} />
              <Route path="/cashier" element={<Cashier />} />
              <Route path="/menu/:tableId" element={<Menu />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
