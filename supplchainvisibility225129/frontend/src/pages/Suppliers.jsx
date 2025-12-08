import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronLeft, ChevronRight, ExternalLink, Building2 } from 'lucide-react';
import { api } from '../services/api';
import useStore from '../store/useStore';
import { getRiskBadgeClass, getRiskLabel, getTierColor, debounce } from '../utils/helpers';

export default function Suppliers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { suppliers, setSuppliers, suppliersPagination, setSuppliersLoading, suppliersLoading, countries, setCountries } = useStore();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    tier: searchParams.get('tier') || '',
    country: searchParams.get('country') || '',
    riskLevel: searchParams.get('risk_level') || ''
  });
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

  useEffect(() => {
    async function fetchCountries() {
      try {
        const data = await api.getCountries();
        setCountries(data);
      } catch (error) {
        console.error('Failed to fetch countries:', error);
      }
    }
    fetchCountries();
  }, [setCountries]);

  useEffect(() => {
    async function fetchSuppliers() {
      setSuppliersLoading(true);
      try {
        const params = { page, limit: 25 };
        if (filters.tier) params.tier = filters.tier;
        if (filters.country) params.country = filters.country;
        if (filters.riskLevel) params.risk_level = filters.riskLevel;
        if (searchTerm) params.search = searchTerm;

        const data = await api.getSuppliers(params);
        setSuppliers(data.data, data.pagination);
      } catch (error) {
        console.error('Failed to fetch suppliers:', error);
      } finally {
        setSuppliersLoading(false);
      }
    }
    fetchSuppliers();
  }, [filters, searchTerm, page, setSuppliers, setSuppliersLoading]);

  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
    setPage(1);
  }, 300);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key === 'riskLevel' ? 'risk_level' : key, value);
    } else {
      newParams.delete(key === 'riskLevel' ? 'risk_level' : key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({ tier: '', country: '', riskLevel: '' });
    setSearchTerm('');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Suppliers</h1>
          <p className="text-gray-400 mt-1">
            {suppliersPagination?.total || 0} suppliers across {countries.length} countries
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search suppliers..."
                defaultValue={searchTerm}
                onChange={(e) => debouncedSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Tier Filter */}
          <select
            value={filters.tier}
            onChange={(e) => handleFilterChange('tier', e.target.value)}
            className="select w-36"
          >
            <option value="">All Tiers</option>
            <option value="1">Tier 1</option>
            <option value="2">Tier 2</option>
            <option value="3">Tier 3</option>
          </select>

          {/* Country Filter */}
          <select
            value={filters.country}
            onChange={(e) => handleFilterChange('country', e.target.value)}
            className="select w-44"
          >
            <option value="">All Countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>

          {/* Risk Filter */}
          <select
            value={filters.riskLevel}
            onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
            className="select w-40"
          >
            <option value="">All Risk Levels</option>
            <option value="critical">Critical Risk</option>
            <option value="high">High Risk</option>
          </select>

          {/* Clear Filters */}
          {(filters.tier || filters.country || filters.riskLevel || searchTerm) && (
            <button onClick={clearFilters} className="btn btn-secondary">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card overflow-hidden"
      >
        {suppliersLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="spinner"></div>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400">
            <Building2 className="w-12 h-12 mb-4" />
            <p>No suppliers found</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Tier</th>
                  <th>Location</th>
                  <th>Function</th>
                  <th>Risk Score</th>
                  <th>ESG Score</th>
                  <th>Alternatives</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>
                      <div>
                        <Link
                          to={`/suppliers/${supplier.id}`}
                          className="font-medium text-white hover:text-blue-400"
                        >
                          {supplier.name}
                        </Link>
                        <p className="text-sm text-gray-500">{supplier.id}</p>
                      </div>
                    </td>
                    <td>
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${getTierColor(supplier.tier_level)}20`,
                          color: getTierColor(supplier.tier_level)
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getTierColor(supplier.tier_level) }}
                        ></span>
                        Tier {supplier.tier_level}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p className="text-white">{supplier.city}</p>
                        <p className="text-sm text-gray-500">{supplier.country}</p>
                      </div>
                    </td>
                    <td className="max-w-[200px]">
                      <p className="text-gray-300 truncate">{supplier.site_function}</p>
                    </td>
                    <td>
                      {supplier.overall_risk_score ? (
                        <span className={`badge ${getRiskBadgeClass(supplier.overall_risk_score)}`}>
                          {supplier.overall_risk_score.toFixed(2)} - {getRiskLabel(supplier.overall_risk_score)}
                        </span>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>
                    <td>
                      {supplier.esg_audit_score ? (
                        <span className={`font-medium ${
                          supplier.esg_audit_score >= 80 ? 'text-green-400' :
                          supplier.esg_audit_score >= 70 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {supplier.esg_audit_score}
                        </span>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>
                    <td>
                      <span className={`font-medium ${
                        supplier.alternative_source_count === 0 ? 'text-red-400' :
                        supplier.alternative_source_count < 2 ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {supplier.alternative_source_count ?? 'N/A'}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/suppliers/${supplier.id}`}
                        className="p-2 hover:bg-gray-700 rounded-lg inline-flex text-gray-400 hover:text-white"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {suppliersPagination && suppliersPagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Showing {((page - 1) * 25) + 1} to {Math.min(page * 25, suppliersPagination.total)} of {suppliersPagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-400">
                Page {page} of {suppliersPagination.pages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= suppliersPagination.pages}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
