const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'supplychain',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.json({ status: 'ok', database: 'disconnected', error: error.message });
  }
});

// Get all suppliers
app.get('/api/suppliers', async (req, res) => {
  try {
    const { tier, country, search } = req.query;
    let query = 'SELECT * FROM suppliers WHERE 1=1';
    const params = [];

    if (tier) {
      params.push(parseInt(tier));
      query += ' AND tier_level = $' + params.length;
    }

    if (country) {
      params.push(country);
      query += ' AND site_location_country = $' + params.length;
    }

    if (search) {
      params.push('%' + search + '%');
      query += ' AND (supplier_name ILIKE $' + params.length + ' OR supplier_id ILIKE $' + params.length + ')';
    }

    query += ' ORDER BY tier_level, supplier_id';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get supplier by ID with risk data
app.get('/api/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supplierResult = await pool.query(
      'SELECT * FROM suppliers WHERE supplier_id = $1',
      [id]
    );

    if (supplierResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Supplier not found' });
    }

    const riskResult = await pool.query(
      'SELECT * FROM risk_monitoring WHERE supplier_id = $1',
      [id]
    );

    const componentsResult = await pool.query(
      'SELECT * FROM product_components WHERE supplier_id = $1',
      [id]
    );

    const supplier = supplierResult.rows[0];
    const risk = riskResult.rows[0] || {};
    const components = componentsResult.rows;

    res.json({ 
      success: true, 
      data: { ...supplier, ...risk, components } 
    });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get risk data
app.get('/api/risk', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM risk_monitoring ORDER BY overall_risk_score DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching risk data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get product components
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pc.*, s.supplier_name, s.tier_level, s.site_location_country
      FROM product_components pc
      LEFT JOIN suppliers s ON pc.supplier_id = s.supplier_id
      ORDER BY pc.diodes_sku, pc.criticality_flag DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Concentration analysis
app.get('/api/analytics/concentration', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.site_location_country as country,
        COUNT(*) as supplier_count,
        SUM(CASE WHEN s.tier_level = 1 THEN 1 ELSE 0 END) as tier1_count,
        SUM(CASE WHEN s.tier_level = 2 THEN 1 ELSE 0 END) as tier2_count,
        SUM(CASE WHEN s.tier_level = 3 THEN 1 ELSE 0 END) as tier3_count,
        COALESCE(AVG(r.overall_risk_score), 0) as avg_risk_score,
        COALESCE(AVG(r.geopolitical_risk_index), 0) as avg_geopolitical_risk,
        COALESCE(AVG(r.natural_disaster_risk_index), 0) as avg_natural_disaster_risk,
        COALESCE(AVG(r.water_scarcity_index), 0) as avg_water_scarcity,
        CASE 
          WHEN COUNT(*) > 20 THEN 'Critical'
          WHEN COUNT(*) > 10 THEN 'High'
          WHEN COUNT(*) > 5 THEN 'Medium'
          ELSE 'Low'
        END as concentration_level
      FROM suppliers s
      LEFT JOIN risk_monitoring r ON s.supplier_id = r.supplier_id
      GROUP BY s.site_location_country
      ORDER BY supplier_count DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching concentration:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Diversification recommendations
app.get('/api/analytics/recommendations', async (req, res) => {
  try {
    const taiwanRisk = await pool.query(`
      SELECT COUNT(*) as count, AVG(r.overall_risk_score) as avg_risk
      FROM suppliers s
      JOIN risk_monitoring r ON s.supplier_id = r.supplier_id
      WHERE s.site_location_country = 'Taiwan'
    `);

    const chinaRisk = await pool.query(`
      SELECT COUNT(*) as count, AVG(r.overall_risk_score) as avg_risk
      FROM suppliers s
      JOIN risk_monitoring r ON s.supplier_id = r.supplier_id
      WHERE s.site_location_country = 'China'
    `);

    const singleSource = await pool.query(`
      SELECT component_name, COUNT(DISTINCT supplier_id) as supplier_count
      FROM product_components
      WHERE criticality_flag = 'High'
      GROUP BY component_name
      HAVING COUNT(DISTINCT supplier_id) <= 2
    `);

    const lowEsg = await pool.query(`
      SELECT s.site_location_country, COUNT(*) as count, AVG(r.esg_audit_score) as avg_esg
      FROM suppliers s
      JOIN risk_monitoring r ON s.supplier_id = r.supplier_id
      WHERE r.esg_audit_score < 70
      GROUP BY s.site_location_country
      ORDER BY count DESC
    `);

    const recommendations = [];

    if (taiwanRisk.rows[0] && taiwanRisk.rows[0].count > 15) {
      recommendations.push({
        id: 1,
        priority: 'Critical',
        category: 'Geographic Diversification',
        title: 'Reduce Taiwan Concentration',
        description: 'Taiwan represents highest concentration with ' + taiwanRisk.rows[0].count + ' suppliers and critical geopolitical risk. Consider diversifying Tier 1 wafer fabrication to Japan, South Korea, or USA facilities.',
        impactedSuppliers: parseInt(taiwanRisk.rows[0].count),
        estimatedTimeframe: '12-18 months',
        riskReduction: 0.35
      });
    }

    if (chinaRisk.rows[0] && chinaRisk.rows[0].count > 10) {
      recommendations.push({
        id: 2,
        priority: 'High',
        category: 'Geographic Diversification',
        title: 'Reduce China Dependency',
        description: 'China suppliers (' + chinaRisk.rows[0].count + ' total) show high geopolitical risk. Develop secondary sources in Vietnam, Malaysia, or India.',
        impactedSuppliers: parseInt(chinaRisk.rows[0].count),
        estimatedTimeframe: '6-12 months',
        riskReduction: 0.25
      });
    }

    if (singleSource.rows.length > 0) {
      singleSource.rows.slice(0, 3).forEach(function(item, idx) {
        recommendations.push({
          id: 3 + idx,
          priority: 'High',
          category: 'Single Source Risk',
          title: item.component_name + ' Diversification',
          description: 'Critical component "' + item.component_name + '" sourced from only ' + item.supplier_count + ' supplier(s). Qualify additional suppliers for redundancy.',
          impactedSuppliers: parseInt(item.supplier_count),
          estimatedTimeframe: '9-12 months',
          riskReduction: 0.20
        });
      });
    }

    if (lowEsg.rows.length > 0) {
      recommendations.push({
        id: recommendations.length + 1,
        priority: 'Medium',
        category: 'ESG Compliance',
        title: 'Improve Supplier ESG Scores',
        description: lowEsg.rows.length + ' regions have suppliers below ESG target. Focus on ' + lowEsg.rows[0].site_location_country + ' with ' + lowEsg.rows[0].count + ' suppliers.',
        impactedSuppliers: lowEsg.rows.reduce(function(sum, r) { return sum + parseInt(r.count); }, 0),
        estimatedTimeframe: '6-9 months',
        riskReduction: 0.10
      });
    }

    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Supply chain network
app.get('/api/network', async (req, res) => {
  try {
    const suppliers = await pool.query(`
      SELECT s.*, r.overall_risk_score, r.geopolitical_risk_index
      FROM suppliers s
      LEFT JOIN risk_monitoring r ON s.supplier_id = r.supplier_id
      ORDER BY s.tier_level, s.supplier_id
    `);

    const nodes = [
      { id: 'DIODES_CORP', name: 'Diodes Inc.', tier: 0, type: 'root' }
    ];

    const links = [];

    suppliers.rows.forEach(function(supplier) {
      nodes.push({
        id: supplier.supplier_id,
        name: supplier.supplier_name,
        tier: supplier.tier_level,
        country: supplier.site_location_country,
        function: supplier.site_function,
        riskScore: parseFloat(supplier.overall_risk_score) || 0
      });

      links.push({
        source: supplier.supplies_id,
        target: supplier.supplier_id,
        tier: supplier.tier_level
      });
    });

    res.json({ success: true, data: { nodes, links } });
  } catch (error) {
    console.error('Error fetching network:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Tier distribution
app.get('/api/analytics/tiers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        tier_level,
        COUNT(*) as count,
        COUNT(DISTINCT site_location_country) as countries,
        ARRAY_AGG(DISTINCT site_function) as functions
      FROM suppliers
      GROUP BY tier_level
      ORDER BY tier_level
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching tier stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Risk alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.supplier_id,
        s.supplier_name,
        s.tier_level,
        s.site_location_country,
        s.site_function,
        r.overall_risk_score,
        r.geopolitical_risk_index,
        r.natural_disaster_risk_index,
        r.water_scarcity_index,
        r.esg_audit_score,
        r.alternative_source_count,
        CASE 
          WHEN r.overall_risk_score >= 0.9 THEN 'Critical'
          WHEN r.overall_risk_score >= 0.7 THEN 'High'
          WHEN r.overall_risk_score >= 0.5 THEN 'Medium'
          ELSE 'Low'
        END as alert_level
      FROM suppliers s
      JOIN risk_monitoring r ON s.supplier_id = r.supplier_id
      WHERE r.overall_risk_score >= 0.6 OR r.alternative_source_count = 0
      ORDER BY r.overall_risk_score DESC
      LIMIT 50
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', function() {
  console.log('Backend server running on port ' + PORT);
});
