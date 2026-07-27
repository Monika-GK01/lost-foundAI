import { Response } from 'express';
import { reportService, ReportType } from '../services/report.service';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { sendOk } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { ROLES } from '../constants';

const VALID_TYPES: ReportType[] = ['lost', 'found', 'recovered', 'claims'];

/**
 * GET /api/admin/reports?type=&from=&to=&format=
 * Returns report data as JSON (preview) or a CSV download.
 */
export const getReport = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const type = req.query.type as string;
    const format = (req.query.format as string) || 'json';
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;

    if (!VALID_TYPES.includes(type as ReportType)) {
      throw ApiError.badRequest(`Invalid report type. Must be one of: ${VALID_TYPES.join(', ')}`);
    }

    // Super admin can report across all colleges; others are scoped to their college.
    const collegeId = req.user!.role === ROLES.SUPER_ADMIN ? null : req.user!.college;

    const result = await reportService.buildReport(type as ReportType, { collegeId, from, to });

    if (format === 'csv') {
      const csv = reportService.toCsv(result);
      const filename = `${type}-report-${new Date().toISOString().slice(0, 10)}.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(csv);
      return;
    }

    sendOk(res, 'Report generated successfully', {
      type,
      count: result.rows.length,
      headers: result.headers,
      rows: result.rows,
    });
  }
);
