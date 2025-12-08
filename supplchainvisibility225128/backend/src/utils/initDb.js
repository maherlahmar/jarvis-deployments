const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'supplychain',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

async function initDatabase() {
  console.log('Initializing database...');
  
  try {
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        supplier_id VARCHAR(20) PRIMARY KEY,
        supplier_name VARCHAR(255) NOT NULL,
        tier_level INTEGER NOT NULL,
        site_location_country VARCHAR(100),
        site_location_city VARCHAR(100),
        site_function VARCHAR(255),
        supplies_id VARCHAR(20),
        latitude DECIMAL(12, 8),
        longitude DECIMAL(12, 8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS risk_monitoring (
        supplier_id VARCHAR(20) PRIMARY KEY REFERENCES suppliers(supplier_id),
        site_location_country VARCHAR(100),
        geopolitical_risk_index DECIMAL(5, 3),
        natural_disaster_risk_index DECIMAL(5, 3),
        water_scarcity_index DECIMAL(5, 3),
        overall_risk_score DECIMAL(5, 3),
        esg_audit_score INTEGER,
        alternative_source_count INTEGER,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS product_components (
        id SERIAL PRIMARY KEY,
        diodes_sku VARCHAR(50) NOT NULL,
        component_name VARCHAR(255) NOT NULL,
        supplier_id VARCHAR(20) REFERENCES suppliers(supplier_id),
        annual_volume_units INTEGER,
        criticality_flag VARCHAR(20)
      );

      CREATE INDEX IF NOT EXISTS idx_suppliers_tier ON suppliers(tier_level);
      CREATE INDEX IF NOT EXISTS idx_suppliers_country ON suppliers(site_location_country);
      CREATE INDEX IF NOT EXISTS idx_risk_score ON risk_monitoring(overall_risk_score);
      CREATE INDEX IF NOT EXISTS idx_components_sku ON product_components(diodes_sku);
      CREATE INDEX IF NOT EXISTS idx_components_supplier ON product_components(supplier_id);
    `);

    console.log('Tables created successfully');
    
    // Check if data exists
    const supplierCount = await pool.query('SELECT COUNT(*) FROM suppliers');
    if (parseInt(supplierCount.rows[0].count) > 0) {
      console.log('Data already exists, skipping import');
      return;
    }

    // Import CSV data if files exist
    const dataDir = process.env.DATA_DIR || '/app/data';
    
    const suppliersFile = path.join(dataDir, 'synthetic_supplier_data.csv');
    const riskFile = path.join(dataDir, 'synthetic_risk_monitoring_data.csv');
    const componentsFile = path.join(dataDir, 'synthetic_product_component_data.csv');

    if (fs.existsSync(suppliersFile)) {
      console.log('Importing suppliers...');
      await importSuppliers(suppliersFile);
    } else {
      console.log('Suppliers file not found, inserting sample data...');
      await insertSampleData();
    }

    if (fs.existsSync(riskFile)) {
      console.log('Importing risk data...');
      await importRiskData(riskFile);
    }

    if (fs.existsSync(componentsFile)) {
      console.log('Importing product components...');
      await importComponents(componentsFile);
    }

    console.log('Database initialization complete');
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function importSuppliers(filePath) {
  return new Promise((resolve, reject) => {
    const suppliers = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        suppliers.push(row);
      })
      .on('end', async () => {
        for (const s of suppliers) {
          try {
            await pool.query(
              `INSERT INTO suppliers (supplier_id, supplier_name, tier_level, site_location_country, 
               site_location_city, site_function, supplies_id, latitude, longitude)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT DO NOTHING`,
              [s.Supplier_ID, s.Supplier_Name, parseInt(s.Tier_Level), s.Site_Location_Country,
               s.Site_Location_City, s.Site_Function, s.Supplies_ID, 
               parseFloat(s.Latitude), parseFloat(s.Longitude)]
            );
          } catch (err) {
            console.error('Error inserting supplier:', s.Supplier_ID, err.message);
          }
        }
        console.log('Imported ' + suppliers.length + ' suppliers');
        resolve();
      })
      .on('error', reject);
  });
}

async function importRiskData(filePath) {
  return new Promise((resolve, reject) => {
    const risks = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        risks.push(row);
      })
      .on('end', async () => {
        for (const r of risks) {
          try {
            await pool.query(
              `INSERT INTO risk_monitoring (supplier_id, site_location_country, geopolitical_risk_index,
               natural_disaster_risk_index, water_scarcity_index, overall_risk_score, 
               esg_audit_score, alternative_source_count)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
              [r.Supplier_ID, r.Site_Location_Country, parseFloat(r.Geopolitical_Risk_Index),
               parseFloat(r.Natural_Disaster_Risk_Index), parseFloat(r.Water_Scarcity_Index),
               parseFloat(r.Overall_Risk_Score), parseInt(r.ESG_Audit_Score), 
               parseInt(r.Alternative_Source_Count)]
            );
          } catch (err) {
            console.error('Error inserting risk:', r.Supplier_ID, err.message);
          }
        }
        console.log('Imported ' + risks.length + ' risk records');
        resolve();
      })
      .on('error', reject);
  });
}

async function importComponents(filePath) {
  return new Promise((resolve, reject) => {
    const components = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        components.push(row);
      })
      .on('end', async () => {
        for (const c of components) {
          try {
            await pool.query(
              `INSERT INTO product_components (diodes_sku, component_name, supplier_id, 
               annual_volume_units, criticality_flag)
               VALUES ($1, $2, $3, $4, $5)`,
              [c.Diodes_SKU, c.Component_Name, c.Supplier_ID,
               parseInt(c.Annual_Volume_Units), c.Criticality_Flag]
            );
          } catch (err) {
            console.error('Error inserting component:', c.Diodes_SKU, err.message);
          }
        }
        console.log('Imported ' + components.length + ' components');
        resolve();
      })
      .on('error', reject);
  });
}

async function insertSampleData() {
  // Insert sample suppliers if CSV not available
  const sampleSuppliers = [
    ['SUP-0160', 'Syn Chem 39', 1, 'China', 'Shanghai', 'Backend Final Test/Packaging', 'DIODES_CORP', 31.2, 121.5],
    ['SUP-0167', 'Core Fab 32', 1, 'Taiwan', 'Tainan', 'Backend Final Test/Packaging', 'DIODES_CORP', 22.9, 120.2],
    ['SUP-0168', 'Auto Semi 31', 1, 'Japan', 'Kumamoto', 'Advanced Wafer Fabrication (Logic/Power)', 'DIODES_CORP', 32.7, 130.7],
    ['SUP-0197', 'Advanced Materials 2', 1, 'Japan', 'Kumamoto', 'Backend Final Test/Packaging', 'DIODES_CORP', 32.8, 130.6]
  ];

  for (const s of sampleSuppliers) {
    await pool.query(
      `INSERT INTO suppliers (supplier_id, supplier_name, tier_level, site_location_country, 
       site_location_city, site_function, supplies_id, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT DO NOTHING`,
      s
    );
  }
  console.log('Inserted sample suppliers');
}

initDatabase();
