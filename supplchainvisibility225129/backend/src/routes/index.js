const express = require('express');
const router = express.Router();
const db = require('../models/database');

// Dashboard summary endpoint
router.get('/dashboard/summary', (req, res) => {
  try {
    const totalSuppliers = db.prepare('SELECT COUNT(*) as count FROM suppliers').get().count;
    const tier1Count = db.prepare('SELECT COUNT(*) as count FROM suppliers WHERE tier_level = 1').get().count;
    const tier2Count = db.prepare('SELECT COUNT(*) as count FROM suppliers WHERE tier_level = 2').get().count;
    const tier3Count = db.prepare('SELECT COUNT(*) as count FROM suppliers WHERE tier_level = 3').get().count;

    const avgRisk = db.prepare('SELECT AVG(overall_risk_score) as avg FROM risk_metrics').get().avg;
    const highRiskCount = db.prepare('SELECT COUNT(*) as count FROM risk_metrics WHERE overall_risk_score > 0.7').get().count;
    const criticalRiskCount = db.prepare('SELECT COUNT(*) as count FROM risk_metrics WHERE overall_risk_score > 0.9').get().count;

    const countryCount = db.prepare('SELECT COUNT(DISTINCT country) as count FROM suppliers').get().count;
    const productCount = db.prepare('SELECT COUNT(DISTINCT sku) as count FROM product_components').get().count;

    const activeAlerts = db.prepare('SELECT COUNT(*) as count FROM alerts WHERE is_resolved = 0').get().count;
    const criticalAlerts = db.prepare("SELECT COUNT(*) as count FROM alerts WHERE is_resolved = 0 AND severity = 'Critical'").get().count;

    const noAlternatives = db.prepare('SELECT COUNT(*) as count FROM risk_metrics WHERE alternative_source_count = 0').get().count;
    const avgESG = db.prepare('SELECT AVG(esg_audit_score) as avg FROM risk_metrics').get().avg;

    res.json({
      suppliers: {
        total: totalSuppliers,
        tier1: tier1Count,
        tier2: tier2Count,
        tier3: tier3Count
      },
      risk: {
        averageScore: Math.round(avgRisk * 100) / 100,
        highRiskCount,
        criticalRiskCount,
        noAlternativesCount: noAlternatives
      },
      geographic: {
        countryCount,
        productCount
      },
      alerts: {
        active: activeAlerts,
        critical: criticalAlerts
      },
      esg: {
        averageScore: Math.round(avgESG)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all suppliers with risk data
router.get('/suppliers', (req, res) => {
  try {
    const { tier, country, risk_level, search, page = 1, limit = 50 } = req.query;

    let query = `
      SELECT s.*, r.geopolitical_risk, r.natural_disaster_risk, r.water_scarcity_index,
             r.overall_risk_score, r.esg_audit_score, r.alternative_source_count
      FROM suppliers s
      LEFT JOIN risk_metrics r ON s.id = r.supplier_id
      WHERE 1=1
    `;
    const params = [];

    if (tier) {
      query += ' AND s.tier_level = ?';
      params.push(parseInt(tier));
    }
    if (country) {
      query += ' AND s.country = ?';
      params.push(country);
    }
    if (risk_level === 'high') {
      query += ' AND r.overall_risk_score > 0.7';
    } else if (risk_level === 'critical') {
      query += ' AND r.overall_risk_score > 0.9';
    }
    if (search) {
      query += ' AND (s.id LIKE ? OR s.name LIKE ? OR s.city LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY r.overall_risk_score DESC NULLS LAST';

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const suppliers = db.prepare(query).all(...params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as count
      FROM suppliers s
      LEFT JOIN risk_metrics r ON s.id = r.supplier_id
      WHERE 1=1
    `;
    const countParams = [];
    if (tier) {
      countQuery += ' AND s.tier_level = ?';
      countParams.push(parseInt(tier));
    }
    if (country) {
      countQuery += ' AND s.country = ?';
      countParams.push(country);
    }
    if (risk_level === 'high') {
      countQuery += ' AND r.overall_risk_score > 0.7';
    } else if (risk_level === 'critical') {
      countQuery += ' AND r.overall_risk_score > 0.9';
    }
    if (search) {
      countQuery += ' AND (s.id LIKE ? OR s.name LIKE ? OR s.city LIKE ?)';
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern);
    }

    const totalCount = db.prepare(countQuery).get(...countParams).count;

    res.json({
      data: suppliers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single supplier with full details
router.get('/suppliers/:id', (req, res) => {
  try {
    const supplier = db.prepare(`
      SELECT s.*, r.geopolitical_risk, r.natural_disaster_risk, r.water_scarcity_index,
             r.overall_risk_score, r.esg_audit_score, r.alternative_source_count
      FROM suppliers s
      LEFT JOIN risk_metrics r ON s.id = r.supplier_id
      WHERE s.id = ?
    `).get(req.params.id);

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Get upstream supplier (who this supplier supplies to)
    const suppliesTo = db.prepare(`
      SELECT s.*, r.overall_risk_score
      FROM suppliers s
      LEFT JOIN risk_metrics r ON s.id = r.supplier_id
      WHERE s.supplies_id = ?
    `).all(req.params.id);

    // Get downstream supplier (who supplies this supplier)
    const suppliedBy = supplier.supplies_id ? db.prepare(`
      SELECT s.*, r.overall_risk_score
      FROM suppliers s
      LEFT JOIN risk_metrics r ON s.id = r.supplier_id
      WHERE s.id = ?
    `).get(supplier.supplies_id) : null;

    // Get components this supplier provides
    const components = db.prepare(`
      SELECT * FROM product_components WHERE supplier_id = ?
    `).all(req.params.id);

    res.json({
      ...supplier,
      supplyChain: {
        suppliesTo,
        suppliedBy
      },
      components
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get supply chain tree for a supplier
router.get('/suppliers/:id/tree', (req, res) => {
  try {
    const { direction = 'both', depth = 3 } = req.query;

    const buildTree = (supplierId, currentDepth, dir) => {
      if (currentDepth >= parseInt(depth)) return null;

      const supplier = db.prepare(`
        SELECT s.*, r.overall_risk_score, r.esg_audit_score
        FROM suppliers s
        LEFT JOIN risk_metrics r ON s.id = r.supplier_id
        WHERE s.id = ?
      `).get(supplierId);

      if (!supplier) return null;

      const node = { ...supplier, children: [], parent: null };

      if (dir === 'up' || dir === 'both') {
        // Get who supplies this supplier
        if (supplier.supplies_id) {
          node.parent = buildTree(supplier.supplies_id, currentDepth + 1, 'up');
        }
      }

      if (dir === 'down' || dir === 'both') {
        // Get who this supplier supplies
        const children = db.prepare(`
          SELECT id FROM suppliers WHERE supplies_id = ?
        `).all(supplierId);

        node.children = children
          .map(c => buildTree(c.id, currentDepth + 1, 'down'))
          .filter(Boolean);
      }

      return node;
    };

    const tree = buildTree(req.params.id, 0, direction);
    res.json(tree);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get geographic concentration analysis
router.get('/concentration', (req, res) => {
  try {
    const concentration = db.prepare(`
      SELECT * FROM country_concentration ORDER BY concentration_percentage DESC
    `).all();

    // Get tier breakdown by country
    const tierBreakdown = db.prepare(`
      SELECT
        country,
        tier_level,
        COUNT(*) as count,
        AVG(r.overall_risk_score) as avg_risk
      FROM suppliers s
      LEFT JOIN risk_metrics r ON s.id = r.supplier_id
      GROUP BY country, tier_level
      ORDER BY country, tier_level
    `).all();

    res.json({
      countries: concentration,
      tierBreakdown
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get risk heatmap data
router.get('/risk/heatmap', (req, res) => {
  try {
    const riskByCountry = db.prepare(`
      SELECT
        s.country,
        AVG(r.geopolitical_risk) as avg_geopolitical,
        AVG(r.natural_disaster_risk) as avg_natural_disaster,
        AVG(r.water_scarcity_index) as avg_water_scarcity,
        AVG(r.overall_risk_score) as avg_overall,
        COUNT(*) as supplier_count
      FROM suppliers s
      JOIN risk_metrics r ON s.id = r.supplier_id
      GROUP BY s.country
      ORDER BY avg_overall DESC
    `).all();

    res.json(riskByCountry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get risk distribution by tier
router.get('/risk/by-tier', (req, res) => {
  try {
    const riskByTier = db.prepare(`
      SELECT
        s.tier_level,
        AVG(r.overall_risk_score) as avg_risk,
        MIN(r.overall_risk_score) as min_risk,
        MAX(r.overall_risk_score) as max_risk,
        COUNT(*) as supplier_count,
        SUM(CASE WHEN r.overall_risk_score > 0.9 THEN 1 ELSE 0 END) as critical_count,
        SUM(CASE WHEN r.overall_risk_score > 0.7 AND r.overall_risk_score <= 0.9 THEN 1 ELSE 0 END) as high_count
      FROM suppliers s
      JOIN risk_metrics r ON s.id = r.supplier_id
      GROUP BY s.tier_level
      ORDER BY s.tier_level
    `).all();

    res.json(riskByTier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get products with component details
router.get('/products', (req, res) => {
  try {
    const { sku, criticality, search } = req.query;

    let query = `
      SELECT
        pc.sku,
        pc.component_name,
        pc.annual_volume,
        pc.criticality,
        s.id as supplier_id,
        s.name as supplier_name,
        s.country,
        s.tier_level,
        r.overall_risk_score
      FROM product_components pc
      JOIN suppliers s ON pc.supplier_id = s.id
      LEFT JOIN risk_metrics r ON s.id = r.supplier_id
      WHERE 1=1
    `;
    const params = [];

    if (sku) {
      query += ' AND pc.sku = ?';
      params.push(sku);
    }
    if (criticality) {
      query += ' AND pc.criticality = ?';
      params.push(criticality);
    }
    if (search) {
      query += ' AND (pc.sku LIKE ? OR pc.component_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY pc.sku, pc.component_name';

    const products = db.prepare(query).all(...params);

    // Group by SKU
    const grouped = products.reduce((acc, item) => {
      if (!acc[item.sku]) {
        acc[item.sku] = {
          sku: item.sku,
          components: [],
          maxRisk: 0,
          criticality: item.criticality
        };
      }
      acc[item.sku].components.push(item);
      if (item.overall_risk_score > acc[item.sku].maxRisk) {
        acc[item.sku].maxRisk = item.overall_risk_score;
      }
      return acc;
    }, {});

    res.json(Object.values(grouped));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product details with full supply chain
router.get('/products/:sku', (req, res) => {
  try {
    const components = db.prepare(`
      SELECT
        pc.*,
        s.name as supplier_name,
        s.country,
        s.city,
        s.tier_level,
        s.site_function,
        s.latitude,
        s.longitude,
        r.overall_risk_score,
        r.geopolitical_risk,
        r.natural_disaster_risk,
        r.esg_audit_score,
        r.alternative_source_count
      FROM product_components pc
      JOIN suppliers s ON pc.supplier_id = s.id
      LEFT JOIN risk_metrics r ON s.id = r.supplier_id
      WHERE pc.sku = ?
      ORDER BY pc.criticality DESC, r.overall_risk_score DESC
    `).all(req.params.sku);

    if (components.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Calculate product-level risk metrics
    const maxRisk = Math.max(...components.map(c => c.overall_risk_score || 0));
    const avgRisk = components.reduce((sum, c) => sum + (c.overall_risk_score || 0), 0) / components.length;
    const totalVolume = components.reduce((sum, c) => sum + c.annual_volume, 0);
    const uniqueCountries = [...new Set(components.map(c => c.country))];

    res.json({
      sku: req.params.sku,
      criticality: components[0].criticality,
      components,
      riskSummary: {
        maxRisk: Math.round(maxRisk * 100) / 100,
        avgRisk: Math.round(avgRisk * 100) / 100,
        totalVolume,
        uniqueCountries,
        countryCount: uniqueCountries.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get diversification recommendations
router.get('/recommendations', (req, res) => {
  try {
    const { priority, category } = req.query;

    let query = 'SELECT * FROM diversification_recommendations WHERE 1=1';
    const params = [];

    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += " ORDER BY CASE priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END";

    const recommendations = db.prepare(query).all(...params);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get alerts
router.get('/alerts', (req, res) => {
  try {
    const { severity, type, resolved } = req.query;

    let query = 'SELECT * FROM alerts WHERE 1=1';
    const params = [];

    if (severity) {
      query += ' AND severity = ?';
      params.push(severity);
    }
    if (type) {
      query += ' AND alert_type = ?';
      params.push(type);
    }
    if (resolved !== undefined) {
      query += ' AND is_resolved = ?';
      params.push(resolved === 'true' ? 1 : 0);
    }

    query += " ORDER BY CASE severity WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END, created_at DESC";

    const alerts = db.prepare(query).all(...params);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve an alert
router.patch('/alerts/:id/resolve', (req, res) => {
  try {
    const result = db.prepare('UPDATE alerts SET is_resolved = 1 WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get map data for visualization
router.get('/map/suppliers', (req, res) => {
  try {
    const { tier, risk_level } = req.query;

    let query = `
      SELECT
        s.id, s.name, s.tier_level, s.country, s.city, s.site_function,
        s.latitude, s.longitude, s.supplies_id,
        r.overall_risk_score, r.geopolitical_risk, r.natural_disaster_risk,
        r.water_scarcity_index, r.esg_audit_score
      FROM suppliers s
      LEFT JOIN risk_metrics r ON s.id = r.supplier_id
      WHERE 1=1
    `;
    const params = [];

    if (tier) {
      query += ' AND s.tier_level = ?';
      params.push(parseInt(tier));
    }
    if (risk_level === 'high') {
      query += ' AND r.overall_risk_score > 0.7';
    } else if (risk_level === 'critical') {
      query += ' AND r.overall_risk_score > 0.9';
    }

    const suppliers = db.prepare(query).all(...params);

    // Get connections for supply chain visualization
    const connections = db.prepare(`
      SELECT
        s1.id as from_id, s1.latitude as from_lat, s1.longitude as from_lng,
        s2.id as to_id, s2.latitude as to_lat, s2.longitude as to_lng
      FROM suppliers s1
      JOIN suppliers s2 ON s1.supplies_id = s2.id
    `).all();

    res.json({
      suppliers,
      connections
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get site functions summary
router.get('/analytics/site-functions', (req, res) => {
  try {
    const functions = db.prepare(`
      SELECT
        site_function,
        tier_level,
        COUNT(*) as count,
        AVG(r.overall_risk_score) as avg_risk
      FROM suppliers s
      LEFT JOIN risk_metrics r ON s.id = r.supplier_id
      GROUP BY site_function, tier_level
      ORDER BY site_function, tier_level
    `).all();

    res.json(functions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get countries list
router.get('/countries', (req, res) => {
  try {
    const countries = db.prepare(`
      SELECT DISTINCT country FROM suppliers ORDER BY country
    `).all();
    res.json(countries.map(c => c.country));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get component types
router.get('/component-types', (req, res) => {
  try {
    const types = db.prepare(`
      SELECT DISTINCT component_name FROM product_components ORDER BY component_name
    `).all();
    res.json(types.map(t => t.component_name));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
