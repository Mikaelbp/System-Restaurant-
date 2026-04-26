import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: JSX.Element
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { token } = useAuth()

  if (!token) {
    return <Navigate to="/auth/login" replace />
  }

  return children
}

export default ProtectedRoute
