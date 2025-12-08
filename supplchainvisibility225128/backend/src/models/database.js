const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/supply_chain.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  -- Suppliers table with tier hierarchy
  CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tier_level INTEGER NOT NULL CHECK (tier_level BETWEEN 1 AND 3),
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    site_function TEXT NOT NULL,
    supplies_id TEXT,
    latitude REAL,
    longitude REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplies_id) REFERENCES suppliers(id)
  );

  -- Risk monitoring data
  CREATE TABLE IF NOT EXISTS risk_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id TEXT NOT NULL UNIQUE,
    geopolitical_risk REAL NOT NULL,
    natural_disaster_risk REAL NOT NULL,
    water_scarcity_index REAL NOT NULL,
    overall_risk_score REAL NOT NULL,
    esg_audit_score INTEGER NOT NULL,
    alternative_source_count INTEGER NOT NULL DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
  );

  -- Product components mapping
  CREATE TABLE IF NOT EXISTS product_components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT NOT NULL,
    component_name TEXT NOT NULL,
    supplier_id TEXT NOT NULL,
    annual_volume INTEGER NOT NULL,
    criticality TEXT NOT NULL CHECK (criticality IN ('High', 'Medium', 'Low')),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
  );

  -- Geographic concentration tracking
  CREATE TABLE IF NOT EXISTS country_concentration (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    country TEXT NOT NULL UNIQUE,
    supplier_count INTEGER NOT NULL DEFAULT 0,
    tier1_count INTEGER NOT NULL DEFAULT 0,
    tier2_count INTEGER NOT NULL DEFAULT 0,
    tier3_count INTEGER NOT NULL DEFAULT 0,
    avg_risk_score REAL,
    total_volume INTEGER DEFAULT 0,
    concentration_percentage REAL,
    risk_category TEXT CHECK (risk_category IN ('Critical', 'High', 'Medium', 'Low'))
  );

  -- Diversification recommendations
  CREATE TABLE IF NOT EXISTS diversification_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    affected_suppliers TEXT,
    estimated_impact TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Supply chain alerts
  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    supplier_id TEXT,
    country TEXT,
    is_resolved INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
  );

  -- Indexes for performance
  CREATE INDEX IF NOT EXISTS idx_suppliers_tier ON suppliers(tier_level);
  CREATE INDEX IF NOT EXISTS idx_suppliers_country ON suppliers(country);
  CREATE INDEX IF NOT EXISTS idx_suppliers_supplies ON suppliers(supplies_id);
  CREATE INDEX IF NOT EXISTS idx_risk_supplier ON risk_metrics(supplier_id);
  CREATE INDEX IF NOT EXISTS idx_risk_score ON risk_metrics(overall_risk_score);
  CREATE INDEX IF NOT EXISTS idx_components_sku ON product_components(sku);
  CREATE INDEX IF NOT EXISTS idx_components_supplier ON product_components(supplier_id);
  CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(alert_type, is_resolved);
`);

module.exports = db;
