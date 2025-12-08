import { Component, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Map, 
  Network, 
  AlertTriangle, 
  Package, 
  Lightbulb,
  Menu,
  X,
  Moon,
  Sun
} from 'lucide-react'
import useStore from './store/useStore'
import api from './services/api'
import Dashboard from './pages/Dashboard'
import SupplyChainMap from './pages/SupplyChainMap'
import NetworkView from './pages/NetworkView'
import RiskAlerts from './pages/RiskAlerts'
import ProductDependencies from './pages/ProductDependencies'
import Recommendations from './pages/Recommendations'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
          <div className="bg-gray-800 rounded-lg p-8 max-w-lg text-center border border-red-500/30">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-4">An unexpected error occurred.</p>
            <pre className="text-left bg-black/30 rounded p-3 mb-4 text-xs text-red-400 overflow-auto max-h-32">
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
            >
              Reload App
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/map', icon: Map, label: 'Supply Chain Map' },
    { path: '/network', icon: Network, label: 'Network View' },
    { path: '/alerts', icon: AlertTriangle, label: 'Risk Alerts' },
    { path: '/products', icon: Package, label: 'Product Dependencies' },
    { path: '/recommendations', icon: Lightbulb, label: 'Recommendations' }
  ]

  const sidebarClass = isOpen 
    ? 'fixed top-0 left-0 z-50 h-full w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out translate-x-0 lg:translate-x-0 lg:static lg:z-0'
    : 'fixed top-0 left-0 z-50 h-full w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out -translate-x-full lg:translate-x-0 lg:static lg:z-0'

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside className={sidebarClass}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Network className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Supply Chain</h1>
              <p className="text-xs text-gray-400">Visibility Platform</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => 
                isActive 
                  ? 'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors bg-primary-600 text-white'
                  : 'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-400 hover:bg-gray-700 hover:text-white'
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="text-xs text-gray-500 text-center">
            Diodes Inc. Supply Chain
            <br />
            Multi-Tier Visibility System
          </div>
        </div>
      </aside>
    </>
  )
}

function Header({ onMenuClick }) {
  const darkMode = useStore(state => state.darkMode)
  const toggleDarkMode = useStore(state => state.toggleDarkMode)

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-400 hover:text-white"
      >
        <Menu className="w-6 h-6" />
      </button>
      
      <div className="flex-1 px-4">
        <h2 className="text-lg font-semibold text-white">Multi-Tier Supply Chain Visibility</h2>
        <p className="text-xs text-gray-400">Mapping and monitoring suppliers across all tiers</p>
      </div>

      <button
        onClick={toggleDarkMode}
        className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    </header>
  )
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const setSuppliers = useStore(state => state.setSuppliers)
  const setRiskData = useStore(state => state.setRiskData)
  const setProductComponents = useStore(state => state.setProductComponents)

  useEffect(() => {
    async function loadData() {
      try {
        const [suppliersRes, riskRes, productsRes] = await Promise.all([
          api.getSuppliers(),
          api.getRiskData(),
          api.getProductComponents()
        ])

        if (suppliersRes.success) setSuppliers(suppliersRes.data)
        if (riskRes.success) setRiskData(riskRes.data)
        if (productsRes.success) setProductComponents(productsRes.data)
        
        setLoading(false)
      } catch (err) {
        console.error('Data load error:', err)
        if (retryCount < 15) {
          setTimeout(() => setRetryCount(r => r + 1), 2000)
        } else {
          setError('Failed to load data. Please refresh the page.')
          setLoading(false)
        }
      }
    }
    loadData()
  }, [retryCount, setSuppliers, setRiskData, setProductComponents])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading Supply Chain Data...</p>
          <p className="text-gray-400 text-sm mt-2">Attempt {retryCount + 1}/15</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="bg-gray-800 rounded-lg p-8 max-w-lg text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <p className="text-white mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/map" element={<SupplyChainMap />} />
            <Route path="/network" element={<NetworkView />} />
            <Route path="/alerts" element={<RiskAlerts />} />
            <Route path="/products" element={<ProductDependencies />} />
            <Route path="/recommendations" element={<Recommendations />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
