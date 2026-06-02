import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DashboardPage from './pages/DashboardPage'
import './app.css'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardPage />
    </QueryClientProvider>
  )
}
