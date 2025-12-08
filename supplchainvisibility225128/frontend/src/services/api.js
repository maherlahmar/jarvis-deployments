const API_BASE = '/api'

let useMockData = false

async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    })
    if (!response.ok) {
      if (response.status >= 502 && response.status <= 504) {
        console.warn(`Backend not ready (${response.status}), using mock data`)
        throw new Error(`Backend starting up (${response.status})`)
      }
      throw new Error(`API Error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Fetch error for ${endpoint}:`, error)
    throw error
  }
}

export const api = {
  // Health check
  health: async () => {
    if (useMockData) return { status: 'mock' }
    try {
      return await fetchApi('/health')
    } catch {
      useMockData = true
      return { status: 'mock' }
    }
  },

  // Suppliers
  getSuppliers: async () => {
    if (useMockData) {
      const { getMockSuppliers } = await import('./mockData')
      return getMockSuppliers()
    }
    try {
      return await fetchApi('/suppliers')
    } catch {
      useMockData = true
      const { getMockSuppliers } = await import('./mockData')
      return getMockSuppliers()
    }
  },

  getSupplierById: async (id) => {
    if (useMockData) {
      const { getMockSupplierById } = await import('./mockData')
      return getMockSupplierById(id)
    }
    try {
      return await fetchApi(`/suppliers/${id}`)
    } catch {
      const { getMockSupplierById } = await import('./mockData')
      return getMockSupplierById(id)
    }
  },

  // Risk data
  getRiskData: async () => {
    if (useMockData) {
      const { getMockRiskData } = await import('./mockData')
      return getMockRiskData()
    }
    try {
      return await fetchApi('/risk')
    } catch {
      useMockData = true
      const { getMockRiskData } = await import('./mockData')
      return getMockRiskData()
    }
  },

  // Product components
  getProductComponents: async () => {
    if (useMockData) {
      const { getMockProductComponents } = await import('./mockData')
      return getMockProductComponents()
    }
    try {
      return await fetchApi('/products')
    } catch {
      useMockData = true
      const { getMockProductComponents } = await import('./mockData')
      return getMockProductComponents()
    }
  },

  // Analytics
  getConcentrationAnalysis: async () => {
    if (useMockData) {
      const { getMockConcentrationAnalysis } = await import('./mockData')
      return getMockConcentrationAnalysis()
    }
    try {
      return await fetchApi('/analytics/concentration')
    } catch {
      const { getMockConcentrationAnalysis } = await import('./mockData')
      return getMockConcentrationAnalysis()
    }
  },

  getDiversificationRecommendations: async () => {
    if (useMockData) {
      const { getMockRecommendations } = await import('./mockData')
      return getMockRecommendations()
    }
    try {
      return await fetchApi('/analytics/recommendations')
    } catch {
      const { getMockRecommendations } = await import('./mockData')
      return getMockRecommendations()
    }
  }
}

export default api
