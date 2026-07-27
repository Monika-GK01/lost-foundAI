import { LostItem } from '../models/LostItem';
import { FoundItem } from '../models/FoundItem';
import { Claim } from '../models/Claim';
import { ITEM_STATUS } from '../constants';

export type ReportType = 'lost' | 'found' | 'recovered' | 'claims';

export interface ReportQuery {
  collegeId: string | null;
  from?: Date;
  to?: Date;
}

export interface ReportResult {
  headers: string[];
  rows: (string | number)[][];
}

const ITEM_LIMIT = 5000;

/**
 * Builds tabular report data for CSV / PDF export.
 */
export class ReportService {
  async buildReport(type: ReportType, query: ReportQuery): Promise<ReportResult> {
    switch (type) {
      case 'lost':
        return this.buildItemReport('lost', query);
      case 'found':
        return this.buildItemReport('found', query);
      case 'recovered':
        return this.buildRecoveredReport(query);
      case 'claims':
        return this.buildClaimsReport(query);
      default:
        return { headers: [], rows: [] };
    }
  }

  private collegeFilter(collegeId: string | null): Record<string, unknown> {
    return collegeId ? { college: collegeId } : {};
  }

  private dateRange(field: string, from?: Date, to?: Date): Record<string, unknown> {
    if (!from && !to) return {};
    const range: Record<string, unknown> = {};
    if (from) range.$gte = from;
    if (to) range.$lte = to;
    return { [field]: range };
  }

  private async buildItemReport(kind: 'lost' | 'found', query: ReportQuery): Promise<ReportResult> {
    const headers = ['Title', 'Category', 'Brand', 'Color', 'Location', kind === 'lost' ? 'Date Lost' : 'Date Found', 'Status', 'Reported On'];

    if (kind === 'lost') {
      const filter: Record<string, unknown> = {
        isDeleted: false,
        ...this.collegeFilter(query.collegeId),
        ...this.dateRange('dateLost', query.from, query.to),
      };
      const items = await LostItem.find(filter).sort({ createdAt: -1 }).limit(ITEM_LIMIT).exec();
      const rows = items.map((item) => [
        item.title,
        item.category,
        item.brand || '',
        item.color || '',
        item.location || '',
        item.dateLost ? item.dateLost.toISOString().slice(0, 10) : '',
        item.status,
        item.createdAt.toISOString().slice(0, 10),
      ]);
      return { headers, rows };
    }

    const filter: Record<string, unknown> = {
      isDeleted: false,
      ...this.collegeFilter(query.collegeId),
      ...this.dateRange('dateFound', query.from, query.to),
    };
    const items = await FoundItem.find(filter).sort({ createdAt: -1 }).limit(ITEM_LIMIT).exec();
    const rows = items.map((item) => [
      item.title,
      item.category,
      item.brand || '',
      item.color || '',
      item.location || '',
      item.dateFound ? item.dateFound.toISOString().slice(0, 10) : '',
      item.status,
      item.createdAt.toISOString().slice(0, 10),
    ]);
    return { headers, rows };
  }

  private async buildRecoveredReport(query: ReportQuery): Promise<ReportResult> {
    const filter: Record<string, unknown> = {
      isDeleted: false,
      status: ITEM_STATUS.LOST.RETURNED,
      ...this.collegeFilter(query.collegeId),
      ...this.dateRange('updatedAt', query.from, query.to),
    };

    const items = await LostItem.find(filter).sort({ updatedAt: -1 }).limit(ITEM_LIMIT).exec();

    const headers = ['Title', 'Category', 'Brand', 'Color', 'Location', 'Date Lost', 'Recovered On'];
    const rows = items.map((item) => [
      item.title,
      item.category,
      item.brand || '',
      item.color || '',
      item.location || '',
      item.dateLost ? item.dateLost.toISOString().slice(0, 10) : '',
      item.updatedAt.toISOString().slice(0, 10),
    ]);

    return { headers, rows };
  }

  private async buildClaimsReport(query: ReportQuery): Promise<ReportResult> {
    const filter: Record<string, unknown> = {
      ...this.collegeFilter(query.collegeId),
      ...this.dateRange('createdAt', query.from, query.to),
    };

    const claims = await Claim.find(filter)
      .populate('student', 'name email')
      .populate('lostItem', 'title')
      .populate('foundItem', 'title')
      .sort({ createdAt: -1 })
      .limit(ITEM_LIMIT)
      .exec();

    const headers = ['Claim ID', 'Student', 'Email', 'Lost Item', 'Found Item', 'Match Score', 'Status', 'Submitted On'];
    const rows = claims.map((claim) => {
      const student = claim.student as unknown as { name?: string; email?: string } | null;
      const lostItem = claim.lostItem as unknown as { title?: string } | null;
      const foundItem = claim.foundItem as unknown as { title?: string } | null;
      return [
        claim._id.toString().slice(-6).toUpperCase(),
        student?.name || 'Unknown',
        student?.email || '',
        lostItem?.title || 'Unknown',
        foundItem?.title || 'Unknown',
        `${Math.round((claim.aiMatchScore || 0) * 100)}%`,
        claim.status,
        claim.createdAt.toISOString().slice(0, 10),
      ];
    });

    return { headers, rows };
  }

  toCsv({ headers, rows }: ReportResult): string {
    const escape = (value: string | number): string => {
      const str = String(value ?? '');
      if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const lines = [headers.map(escape).join(','), ...rows.map((row) => row.map(escape).join(','))];
    return lines.join('\n');
  }
}

export const reportService = new ReportService();

