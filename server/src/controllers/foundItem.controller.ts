import { Response } from 'express';
import { foundItemService } from '../services';
import { checkFoundItemDuplicates } from '../services/duplicateDetection.service';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { sendCreated, sendOk, sendNoContent } from '../utils/ApiResponse';
import { ROLES } from '../constants';

export const createFoundItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const imagePaths = files.map((f) => f.path);
    const input = {
      ...req.body,
      finder: req.user!.userId,
      college: req.user!.college,
    };

    const item = await foundItemService.createFoundItem(input, imagePaths);
    sendCreated(res, 'Found item reported successfully', item);
  }
);

export const getAllFoundItems = asyncHandler(
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

    const result = await foundItemService.getAllFoundItems(
      filter,
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined,
      sortBy as string,
      sortOrder as 'asc' | 'desc'
    );

    sendOk(res, 'Found items retrieved successfully', result);
  }
);

export const getFoundItemById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const item = await foundItemService.getFoundItemById(req.params.id);
    sendOk(res, 'Found item retrieved successfully', item);
  }
);

export const updateFoundItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const item = await foundItemService.updateFoundItem(
      req.params.id,
      req.body,
      req.user!.userId,
      req.user!.role
    );
    sendOk(res, 'Found item updated successfully', item);
  }
);

export const deleteFoundItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    await foundItemService.deleteFoundItem(
      req.params.id,
      req.user!.userId,
      req.user!.role
    );
    sendNoContent(res, 'Found item deleted successfully');
  }
);

export const checkDuplicates = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { title, category, brand, color, dateFound } = req.body;
    const duplicates = await checkFoundItemDuplicates({
      title,
      category,
      brand,
      color,
      date: dateFound,
      collegeId: req.user!.college,
    });
    sendOk(res, 'Duplicate check complete', { duplicates, hasDuplicates: duplicates.length > 0 });
  }
);
