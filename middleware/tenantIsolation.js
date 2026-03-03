/**
 * tenantIsolation.js — Multi-tenant scope middleware.
 *
 * Attaches helpers to the request object so controllers never
 * forget to filter by orgId.  Zero DB calls — runs AFTER protect.
 *
 * Usage in controllers:
 *   const sessions = await AttendanceSession.find(
 *     req.scopeQuery({ userId: req.user.userId })
 *   );
 */

/**
 * Express middleware — adds req.orgFilter and req.scopeQuery.
 * Must be mounted AFTER the protect (auth) middleware.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const enforceTenant = (req, _res, next) => {
  /** @type {{ orgId: import('mongoose').Types.ObjectId }} */
  req.orgFilter = { orgId: req.user.orgId };

  /**
   * Merge any filter with the tenant's orgId.
   * @param {Object} [filter={}] — Additional query conditions.
   * @returns {Object} Filter that always includes orgId.
   */
  req.scopeQuery = (filter = {}) => ({ ...filter, orgId: req.user.orgId });

  return next();
};

module.exports = enforceTenant;
