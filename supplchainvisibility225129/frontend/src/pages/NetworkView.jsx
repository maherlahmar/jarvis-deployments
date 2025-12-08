import { useState, useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import { ZoomIn, ZoomOut, Maximize2, Filter } from 'lucide-react'
import useStore from '../store/useStore'

const TIER_COLORS = {
  0: '#ef4444',
  1: '#3b82f6',
  2: '#8b5cf6',
  3: '#14b8a6'
}

function getRiskColor(score) {
  if (score >= 0.9) return '#ef4444'
  if (score >= 0.7) return '#f97316'
  if (score >= 0.5) return '#eab308'
  return '#22c55e'
}

export default function NetworkView() {
  const suppliers = useStore(function(state) { return state.suppliers })
  const riskData = useStore(function(state) { return state.riskData })
  const getSupplierNetwork = useStore(function(state) { return state.getSupplierNetwork })
  
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [selectedTier, setSelectedTier] = useState(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  const riskMap = useMemo(function() {
    const map = {}
    riskData.forEach(function(r) {
      map[r.supplier_id] = r
    })
    return map
  }, [riskData])

  const networkData = useMemo(function() {
    const data = getSupplierNetwork()
    
    if (selectedTier !== null) {
      const filteredNodes = data.nodes.filter(function(n) {
        return n.tier === 0 || n.tier === selectedTier
      })
      const nodeIds = new Set(filteredNodes.map(function(n) { return n.id }))
      const filteredLinks = data.links.filter(function(l) {
        return nodeIds.has(l.source) && nodeIds.has(l.target)
      })
      return { nodes: filteredNodes, links: filteredLinks }
    }
    
    return data
  }, [getSupplierNetwork, selectedTier])

  useEffect(function() {
    function handleResize() {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        })
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return function() { window.removeEventListener('resize', handleResize) }
  }, [])

  useEffect(function() {
    if (!svgRef.current || networkData.nodes.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = dimensions.width
    const height = dimensions.height
    const centerX = width / 2
    const centerY = height / 2

    const g = svg.append('g')

    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', function(event) {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    const nodesByTier = { 0: [], 1: [], 2: [], 3: [] }
    networkData.nodes.forEach(function(node) {
      if (nodesByTier[node.tier]) {
        nodesByTier[node.tier].push(node)
      }
    })

    const tierRadii = {
      0: 0,
      1: Math.min(width, height) * 0.15,
      2: Math.min(width, height) * 0.28,
      3: Math.min(width, height) * 0.40
    }

    networkData.nodes.forEach(function(node) {
      if (node.tier === 0) {
        node.x = centerX
        node.y = centerY
      } else {
        const tierNodes = nodesByTier[node.tier]
        const idx = tierNodes.indexOf(node)
        const angle = (2 * Math.PI * idx) / tierNodes.length - Math.PI / 2
        const radius = tierRadii[node.tier]
        node.x = centerX + radius * Math.cos(angle)
        node.y = centerY + radius * Math.sin(angle)
      }
    })

    const nodeMap = {}
    networkData.nodes.forEach(function(n) {
      nodeMap[n.id] = n
    })

    g.selectAll('.tier-circle')
      .data([1, 2, 3])
      .enter()
      .append('circle')
      .attr('class', 'tier-circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', function(d) { return tierRadii[d] })
      .attr('fill', 'none')
      .attr('stroke', '#374151')
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.5)

    g.selectAll('.tier-label')
      .data([1, 2, 3])
      .enter()
      .append('text')
      .attr('class', 'tier-label')
      .attr('x', centerX)
      .attr('y', function(d) { return centerY - tierRadii[d] - 10 })
      .attr('text-anchor', 'middle')
      .attr('fill', '#9ca3af')
      .attr('font-size', '12px')
      .text(function(d) { return 'Tier ' + d })

    const validLinks = networkData.links.filter(function(link) {
      return nodeMap[link.source] && nodeMap[link.target]
    })

    g.selectAll('.link')
      .data(validLinks)
      .enter()
      .append('line')
      .attr('class', 'link network-link')
      .attr('x1', function(d) { return nodeMap[d.source].x })
      .attr('y1', function(d) { return nodeMap[d.source].y })
      .attr('x2', function(d) { return nodeMap[d.target].x })
      .attr('y2', function(d) { return nodeMap[d.target].y })
      .attr('stroke', function(d) { return TIER_COLORS[d.tier] })
      .attr('stroke-width', 1)
      .attr('opacity', 0.3)

    const nodeGroups = g.selectAll('.node')
      .data(networkData.nodes)
      .enter()
      .append('g')
      .attr('class', 'node network-node')
      .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')' })
      .on('click', function(event, d) {
        setSelectedNode(d)
      })

    nodeGroups.append('circle')
      .attr('r', function(d) {
        if (d.tier === 0) return 25
        if (d.tier === 1) return 12
        if (d.tier === 2) return 8
        return 5
      })
      .attr('fill', function(d) { return TIER_COLORS[d.tier] })
      .attr('stroke', function(d) {
        if (d.tier === 0) return '#fff'
        const risk = riskMap[d.id]
        return risk ? getRiskColor(risk.overall_risk_score) : '#374151'
      })
      .attr('stroke-width', function(d) { return d.tier === 0 ? 3 : 2 })

    nodeGroups.filter(function(d) { return d.tier === 0 })
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('fill', 'white')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text('DIO')

    nodeGroups.append('title')
      .text(function(d) {
        if (d.tier === 0) return 'Diodes Inc.'
        return d.name + ' (' + d.country + ')'
      })

  }, [networkData, dimensions, riskMap])

  const supplierDetails = useMemo(function() {
    if (!selectedNode || selectedNode.tier === 0) return null
    const supplier = suppliers.find(function(s) { return s.supplier_id === selectedNode.id })
    const risk = riskMap[selectedNode.id]
    return { supplier: supplier, risk: risk }
  }, [selectedNode, suppliers, riskMap])

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Supply Chain Network</h1>
          <p className="text-gray-400">Interactive visualization of supplier relationships</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Filter by Tier:</span>
            <select
              value={selectedTier === null ? '' : selectedTier}
              onChange={function(e) {
                setSelectedTier(e.target.value === '' ? null : parseInt(e.target.value))
              }}
              className="input-field w-32"
            >
              <option value="">All Tiers</option>
              <option value="1">Tier 1</option>
              <option value="2">Tier 2</option>
              <option value="3">Tier 3</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500" />
          <span className="text-sm text-gray-300">Diodes Inc.</span>
        </div>
        {[1, 2, 3].map(function(tier) {
          return (
            <div key={tier} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: TIER_COLORS[tier] }}
              />
              <span className="text-sm text-gray-300">Tier {tier}</span>
            </div>
          )
        })}
      </div>

      <div className="flex-1 flex gap-4">
        <div 
          ref={containerRef}
          className="flex-1 card overflow-hidden relative"
        >
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="bg-gray-800"
          />
          
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-white">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-white">
              <ZoomOut className="w-4 h-4" />
            </button>
            <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-white">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {supplierDetails && (
          <div className="w-80 card p-4">
            <h3 className="font-semibold text-white mb-4">Supplier Details</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Name</p>
                <p className="text-white">{supplierDetails.supplier?.supplier_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">ID</p>
                <p className="text-white">{selectedNode.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Tier</p>
                <span className={'tier-badge tier-' + selectedNode.tier}>
                  Tier {selectedNode.tier}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-400">Location</p>
                <p className="text-white">
                  {supplierDetails.supplier?.site_location_city}, {supplierDetails.supplier?.site_location_country}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Function</p>
                <p className="text-white">{supplierDetails.supplier?.site_function}</p>
              </div>
              
              {supplierDetails.risk && (
                <>
                  <div className="border-t border-gray-700 pt-3">
                    <p className="text-sm text-gray-400 mb-2">Risk Indicators</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Overall Risk</span>
                        <span className="font-medium" style={{ color: getRiskColor(supplierDetails.risk.overall_risk_score) }}>
                          {(supplierDetails.risk.overall_risk_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Geopolitical</span>
                        <span className="text-gray-100">
                          {(supplierDetails.risk.geopolitical_risk_index * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Natural Disaster</span>
                        <span className="text-gray-100">
                          {(supplierDetails.risk.natural_disaster_risk_index * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">ESG Score</span>
                        <span className="text-gray-100">{supplierDetails.risk.esg_audit_score}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Alternatives</span>
                        <span className="text-gray-100">{supplierDetails.risk.alternative_source_count}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
