import { create } from 'zustand'

const useStore = create((set, get) => ({
  // Data state
  suppliers: [],
  riskData: [],
  productComponents: [],
  loading: false,
  error: null,

  // Filter state
  selectedTier: null,
  selectedCountry: null,
  selectedRiskLevel: null,
  searchQuery: '',

  // UI state
  darkMode: true,
  selectedSupplier: null,
  sidebarOpen: true,

  // Actions
  setSuppliers: (suppliers) => set({ suppliers }),
  setRiskData: (riskData) => set({ riskData }),
  setProductComponents: (productComponents) => set({ productComponents }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Filter actions
  setSelectedTier: (tier) => set({ selectedTier: tier }),
  setSelectedCountry: (country) => set({ selectedCountry: country }),
  setSelectedRiskLevel: (level) => set({ selectedRiskLevel: level }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearFilters: () => set({
    selectedTier: null,
    selectedCountry: null,
    selectedRiskLevel: null,
    searchQuery: ''
  }),

  // UI actions
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setSelectedSupplier: (supplier) => set({ selectedSupplier: supplier }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Computed getters
  getFilteredSuppliers: () => {
    const state = get()
    let filtered = [...state.suppliers]

    if (state.selectedTier !== null) {
      filtered = filtered.filter(s => s.tier_level === state.selectedTier)
    }

    if (state.selectedCountry) {
      filtered = filtered.filter(s => s.site_location_country === state.selectedCountry)
    }

    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase()
      filtered = filtered.filter(s => 
        s.supplier_name.toLowerCase().includes(query) ||
        s.supplier_id.toLowerCase().includes(query)
      )
    }

    return filtered
  },

  getSupplierWithRisk: (supplierId) => {
    const state = get()
    const supplier = state.suppliers.find(s => s.supplier_id === supplierId)
    const risk = state.riskData.find(r => r.supplier_id === supplierId)
    return { ...supplier, ...risk }
  },

  getCountryStats: () => {
    const state = get()
    const stats = {}
    
    state.suppliers.forEach(supplier => {
      const country = supplier.site_location_country
      if (!stats[country]) {
        stats[country] = { count: 0, tier1: 0, tier2: 0, tier3: 0, avgRisk: 0, risks: [] }
      }
      stats[country].count++
      stats[country][`tier${supplier.tier_level}`]++
      
      const risk = state.riskData.find(r => r.supplier_id === supplier.supplier_id)
      if (risk) {
        stats[country].risks.push(risk.overall_risk_score)
      }
    })

    Object.keys(stats).forEach(country => {
      const risks = stats[country].risks
      stats[country].avgRisk = risks.length > 0 
        ? risks.reduce((a, b) => a + b, 0) / risks.length 
        : 0
    })

    return stats
  },

  getTierStats: () => {
    const state = get()
    const stats = { 1: 0, 2: 0, 3: 0 }
    state.suppliers.forEach(s => {
      stats[s.tier_level]++
    })
    return stats
  },

  getRiskDistribution: () => {
    const state = get()
    const distribution = { low: 0, medium: 0, high: 0, critical: 0 }
    
    state.riskData.forEach(risk => {
      const score = risk.overall_risk_score
      if (score < 0.4) distribution.low++
      else if (score < 0.6) distribution.medium++
      else if (score < 0.8) distribution.high++
      else distribution.critical++
    })

    return distribution
  },

  getSupplierNetwork: () => {
    const state = get()
    const nodes = []
    const links = []

    // Add Diodes Corp as root
    nodes.push({
      id: 'DIODES_CORP',
      name: 'Diodes Inc.',
      tier: 0,
      type: 'root'
    })

    state.suppliers.forEach(supplier => {
      const risk = state.riskData.find(r => r.supplier_id === supplier.supplier_id)
      nodes.push({
        id: supplier.supplier_id,
        name: supplier.supplier_name,
        tier: supplier.tier_level,
        country: supplier.site_location_country,
        function: supplier.site_function,
        riskScore: risk?.overall_risk_score || 0
      })

      links.push({
        source: supplier.supplies_id,
        target: supplier.supplier_id,
        tier: supplier.tier_level
      })
    })

    return { nodes, links }
  }
}))

export default useStore
