import { Response } from 'express';
import { collegeService } from '../services';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { sendCreated, sendOk, sendNoContent } from '../utils/ApiResponse';

export const createCollege = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const college = await collegeService.createCollege(req.body);
    sendCreated(res, 'College created successfully', college);
  }
);

export const getAllColleges = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || undefined;
    const limit = parseInt(req.query.limit as string) || undefined;

    const result = await collegeService.getAllColleges(page, limit);
    sendOk(res, 'Colleges retrieved successfully', result);
  }
);

export const getCollegeById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const college = await collegeService.getCollegeById(req.params.id);
    sendOk(res, 'College retrieved successfully', college);
  }
);

export const updateCollege = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const college = await collegeService.updateCollege(req.params.id, req.body);
    sendOk(res, 'College updated successfully', college);
  }
);

export const deleteCollege = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    await collegeService.deleteCollege(req.params.id);
    sendNoContent(res, 'College deleted successfully');
  }
);
