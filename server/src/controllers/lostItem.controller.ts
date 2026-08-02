import { Response } from 'express';
import { lostItemService } from '../services';
import { checkLostItemDuplicates } from '../services/duplicateDetection.service';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { sendCreated, sendOk, sendNoContent } from '../utils/ApiResponse';
import { ROLES } from '../constants';

export const createLostItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const imagePaths = files.map((f) => f.path);
    const input = {
      ...req.body,
      owner: req.user!.userId,
      college: req.user!.college,
    };

    const { item, uploadWarnings } = await lostItemService.createLostItem(input, imagePaths);
    sendCreated(res, 'Lost item reported successfully', { ...item.toObject(), uploadWarnings });
  }
);

export const getAllLostItems = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { page, limit, sortBy, sortOrder, category, brand, color, status, keyword, dateFrom, dateTo } = req.query;

    const filter = {
      college: req.user!.role === ROLES.SUPER_ADMIN
        ? (req.query.college as string) || undefined
        : req.user!.college,
      category: category as string,
      brand: brand as string,
      color: color as string,
      status: status as string,
      keyword: keyword as string,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
    };

    const result = await lostItemService.getAllLostItems(
      filter,
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined,
      sortBy as string,
      sortOrder as 'asc' | 'desc'
    );

    sendOk(res, 'Lost items retrieved successfully', result);
  }
);

export const getLostItemById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const item = await lostItemService.getLostItemById(req.params.id);
    sendOk(res, 'Lost item retrieved successfully', item);
  }
);

export const updateLostItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const item = await lostItemService.updateLostItem(
      req.params.id,
      req.body,
      req.user!.userId,
      req.user!.role
    );
    sendOk(res, 'Lost item updated successfully', item);
  }
);

export const deleteLostItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    await lostItemService.deleteLostItem(
      req.params.id,
      req.user!.userId,
      req.user!.role
    );
    sendNoContent(res, 'Lost item deleted successfully');
  }
);

export const getLostItemMatches = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const matches = await lostItemService.findMatches(req.params.id);
    sendOk(res, 'Matches retrieved successfully', {
      lostItemId: req.params.id,
      matchesCount: matches.length,
      matches: matches.map((m) => ({
        foundItem: m.foundItem,
        scores: m.scores,
      })),
    });
  }
);

export const checkDuplicates = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { title, category, brand, color, dateLost } = req.body;
    const duplicates = await checkLostItemDuplicates({
      title,
      category,
      brand,
      color,
      date: dateLost,
      collegeId: req.user!.college,
    });
    sendOk(res, 'Duplicate check complete', { duplicates, hasDuplicates: duplicates.length > 0 });
  }
);

export const matchAction = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { foundItemId, action } = req.body;
    if (!foundItemId || !['accept', 'ignore'].includes(action)) {
      res.status(400).json({ success: false, message: 'foundItemId and action (accept|ignore) are required' });
      return;
    }
    const updated = await lostItemService.matchAction(
      req.params.id,
      req.user!.userId,
      foundItemId,
      action
    );
    sendOk(res, `Match ${action}ed successfully`, updated);
  }
);
