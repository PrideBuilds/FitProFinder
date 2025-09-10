/**
 * Query Optimizer
 * Utilities for optimizing database queries and performance
 */

import { logger } from './logger.js';

class QueryOptimizer {
  constructor() {
    this.queryCache = new Map();
    this.queryMetrics = new Map();
  }

  /**
   * Optimize a query by adding proper indexes and constraints
   * @param {Object} query - Knex query builder
   * @param {Object} options - Optimization options
   * @returns {Object} Optimized query
   */
  optimizeQuery(query, options = {}) {
    const {
      useIndex = true,
      addConstraints = true,
      limitResults = true,
      maxLimit = 1000,
    } = options;

    // Add result limiting
    if (limitResults && !query._statements.find(s => s.grouping === 'limit')) {
      query.limit(maxLimit);
    }

    // Add ordering for consistent results
    if (!query._statements.find(s => s.grouping === 'order')) {
      query.orderBy('id', 'desc');
    }

    return query;
  }

  /**
   * Create optimized pagination query
   * @param {Object} baseQuery - Base query builder
   * @param {Object} pagination - Pagination options
   * @returns {Object} Paginated query with count
   */
  async createPaginatedQuery(baseQuery, pagination = {}) {
    const { page = 1, limit = 10, maxLimit = 100 } = pagination;
    const safeLimit = Math.min(limit, maxLimit);
    const offset = (page - 1) * safeLimit;

    // Clone query for count
    const countQuery = baseQuery.clone();

    // Execute count and data queries in parallel
    const [countResult, dataResult] = await Promise.all([
      countQuery.count('* as count').first(),
      baseQuery.clone().offset(offset).limit(safeLimit).orderBy('id', 'desc'),
    ]);

    const totalCount = countResult.count;
    const totalPages = Math.ceil(totalCount / safeLimit);

    return {
      data: dataResult,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: safeLimit,
        offset,
      },
    };
  }

  /**
   * Create optimized search query with full-text search
   * @param {Object} query - Base query builder
   * @param {string} searchTerm - Search term
   * @param {Array} searchFields - Fields to search in
   * @returns {Object} Optimized search query
   */
  createSearchQuery(query, searchTerm, searchFields = []) {
    if (!searchTerm || searchFields.length === 0) {
      return query;
    }

    const searchPattern = `%${searchTerm}%`;

    return query.where(function () {
      searchFields.forEach((field, index) => {
        if (index === 0) {
          this.where(field, 'like', searchPattern);
        } else {
          this.orWhere(field, 'like', searchPattern);
        }
      });
    });
  }

  /**
   * Create optimized filter query
   * @param {Object} query - Base query builder
   * @param {Object} filters - Filter options
   * @returns {Object} Filtered query
   */
  createFilterQuery(query, filters = {}) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return;
      }

      if (Array.isArray(value)) {
        if (value.length > 0) {
          query.whereIn(key, value);
        }
      } else if (typeof value === 'object' && value.min !== undefined) {
        // Range filter
        if (value.min !== undefined) {
          query.where(key, '>=', value.min);
        }
        if (value.max !== undefined) {
          query.where(key, '<=', value.max);
        }
      } else {
        // Exact match
        query.where(key, value);
      }
    });

    return query;
  }

  /**
   * Create optimized join query
   * @param {Object} query - Base query builder
   * @param {Array} joins - Join configurations
   * @returns {Object} Query with joins
   */
  createJoinQuery(query, joins = []) {
    joins.forEach(join => {
      const { table, on, type = 'inner', select = [], alias = null } = join;

      const joinMethod = type === 'left' ? 'leftJoin' : 'innerJoin';
      const tableName = alias ? `${table} as ${alias}` : table;

      query[joinMethod](tableName, on);

      if (select.length > 0) {
        query.select(select);
      }
    });

    return query;
  }

  /**
   * Create optimized aggregation query
   * @param {Object} query - Base query builder
   * @param {Array} aggregations - Aggregation configurations
   * @returns {Object} Aggregated query
   */
  createAggregationQuery(query, aggregations = []) {
    const selectFields = [];

    aggregations.forEach(agg => {
      const { field, function: func, alias } = agg;
      const selectField = `${func}(${field}) as ${alias || `${func}_${field}`}`;
      selectFields.push(selectField);
    });

    if (selectFields.length > 0) {
      query.select(selectFields);
    }

    return query;
  }

  /**
   * Create optimized subquery
   * @param {Function} subqueryFn - Function that returns a subquery
   * @param {string} alias - Alias for the subquery
   * @returns {Object} Subquery builder
   */
  createSubquery(subqueryFn, alias) {
    return function () {
      this.select('*').from(subqueryFn().as(alias));
    };
  }

  /**
   * Optimize query with proper indexing hints
   * @param {Object} query - Query builder
   * @param {Array} indexes - Index hints
   * @returns {Object} Query with index hints
   */
  addIndexHints(query, indexes = []) {
    // This would be database-specific
    // For now, we'll just log the recommended indexes
    if (indexes.length > 0) {
      logger.debug('Recommended indexes for query:', indexes);
    }

    return query;
  }

  /**
   * Create optimized batch insert query
   * @param {Object} db - Database connection
   * @param {string} table - Table name
   * @param {Array} data - Data to insert
   * @param {Object} options - Batch options
   * @returns {Promise} Batch insert result
   */
  async batchInsert(db, table, data, options = {}) {
    const { batchSize = 1000, chunkSize = 100 } = options;

    if (data.length <= batchSize) {
      return db(table).insert(data);
    }

    // Process in chunks
    const results = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const result = await db(table).insert(chunk);
      results.push(result);
    }

    return results;
  }

  /**
   * Create optimized upsert query
   * @param {Object} db - Database connection
   * @param {string} table - Table name
   * @param {Object} data - Data to upsert
   * @param {Array} conflictColumns - Columns to check for conflicts
   * @returns {Promise} Upsert result
   */
  async upsert(db, table, data, conflictColumns = ['id']) {
    const conflictClause = conflictColumns.join(', ');

    // This is PostgreSQL specific - adjust for your database
    return db.raw(
      `
      INSERT INTO ${table} (${Object.keys(data).join(', ')})
      VALUES (${Object.values(data)
        .map(() => '?')
        .join(', ')})
      ON CONFLICT (${conflictClause})
      DO UPDATE SET
      ${Object.keys(data)
        .filter(key => !conflictColumns.includes(key))
        .map(key => `${key} = EXCLUDED.${key}`)
        .join(', ')}
    `,
      Object.values(data)
    );
  }

  /**
   * Analyze query performance
   * @param {string} queryName - Name of the query
   * @param {Function} queryFn - Query function
   * @returns {Promise} Query result with performance metrics
   */
  async analyzeQuery(queryName, queryFn) {
    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage();

    try {
      const result = await queryFn();

      const endTime = process.hrtime.bigint();
      const endMemory = process.memoryUsage();

      const executionTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

      const metrics = {
        queryName,
        executionTime,
        memoryDelta,
        resultCount: Array.isArray(result) ? result.length : 1,
        timestamp: new Date().toISOString(),
      };

      this.queryMetrics.set(queryName, metrics);
      logger.debug(`Query analysis for ${queryName}:`, metrics);

      return {
        result,
        metrics,
      };
    } catch (error) {
      const endTime = process.hrtime.bigint();
      const executionTime = Number(endTime - startTime) / 1000000;

      logger.error(`Query failed: ${queryName} (${executionTime}ms)`, error);
      throw error;
    }
  }

  /**
   * Get query performance metrics
   * @returns {Object} Query metrics
   */
  getQueryMetrics() {
    return Object.fromEntries(this.queryMetrics);
  }

  /**
   * Clear query metrics
   */
  clearQueryMetrics() {
    this.queryMetrics.clear();
  }

  /**
   * Generate query optimization recommendations
   * @param {string} queryName - Query name
   * @returns {Array} Optimization recommendations
   */
  getOptimizationRecommendations(queryName) {
    const metrics = this.queryMetrics.get(queryName);
    if (!metrics) return [];

    const recommendations = [];

    if (metrics.executionTime > 1000) {
      recommendations.push({
        type: 'performance',
        message:
          'Query execution time is high. Consider adding indexes or optimizing the query.',
        severity: 'high',
      });
    }

    if (metrics.memoryDelta > 10 * 1024 * 1024) {
      // 10MB
      recommendations.push({
        type: 'memory',
        message:
          'Query uses significant memory. Consider limiting result set or using streaming.',
        severity: 'medium',
      });
    }

    if (metrics.resultCount > 10000) {
      recommendations.push({
        type: 'pagination',
        message: 'Large result set returned. Consider implementing pagination.',
        severity: 'medium',
      });
    }

    return recommendations;
  }

  /**
   * Create database indexes for common queries
   * @param {Object} db - Database connection
   * @returns {Promise} Index creation results
   */
  async createOptimizedIndexes(db) {
    const indexes = [
      // Users table indexes
      { table: 'users', columns: ['email'], unique: true },
      { table: 'users', columns: ['role'] },
      { table: 'users', columns: ['is_active'] },
      { table: 'users', columns: ['is_verified'] },
      { table: 'users', columns: ['created_at'] },

      // Trainer profiles indexes
      { table: 'trainer_profiles', columns: ['user_id'], unique: true },
      { table: 'trainer_profiles', columns: ['is_accepting_clients'] },
      { table: 'trainer_profiles', columns: ['is_featured'] },
      { table: 'trainer_profiles', columns: ['rating'] },
      { table: 'trainer_profiles', columns: ['city', 'state'] },
      { table: 'trainer_profiles', columns: ['hourly_rate'] },

      // Bookings indexes
      { table: 'bookings', columns: ['client_id'] },
      { table: 'bookings', columns: ['trainer_id'] },
      { table: 'bookings', columns: ['status'] },
      { table: 'bookings', columns: ['scheduled_date'] },
      { table: 'bookings', columns: ['client_id', 'status'] },
      { table: 'bookings', columns: ['trainer_id', 'status'] },

      // Messages indexes
      { table: 'messages', columns: ['conversation_id'] },
      { table: 'messages', columns: ['sender_id'] },
      { table: 'messages', columns: ['created_at'] },
      { table: 'messages', columns: ['conversation_id', 'created_at'] },

      // Conversations indexes
      { table: 'conversations', columns: ['client_id'] },
      { table: 'conversations', columns: ['trainer_id'] },
      { table: 'conversations', columns: ['updated_at'] },
    ];

    const results = [];

    for (const index of indexes) {
      try {
        const indexName = `${index.table}_${index.columns.join('_')}_idx`;
        const columns = index.columns.join(', ');
        const unique = index.unique ? 'UNIQUE' : '';

        await db.raw(
          `CREATE ${unique} INDEX IF NOT EXISTS ${indexName} ON ${index.table} (${columns})`
        );

        results.push({
          table: index.table,
          columns: index.columns,
          status: 'created',
        });

        logger.debug(`Created index: ${indexName}`);
      } catch (error) {
        results.push({
          table: index.table,
          columns: index.columns,
          status: 'error',
          error: error.message,
        });

        logger.error(`Failed to create index for ${index.table}:`, error);
      }
    }

    return results;
  }
}

export default new QueryOptimizer();
