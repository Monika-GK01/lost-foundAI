import mongoose from 'mongoose';
import { foundItemRepository, FoundItemFilter } from '../repositories/foundItem.repository';
import { lostItemRepository } from '../repositories/lostItem.repository';
import { ApiError } from '../utils/ApiError';
import { uploadToCloudinary } from '../config/cloudinary';
import { generateEmbedding } from '../utils/aiClient';
import { IFoundItem } from '../models';
import { UPLOAD_FOLDER, PAGINATION, ITEM_STATUS } from '../constants';
import { logger } from '../utils/logger';
import { matchEngineService } from './matchEngine.service';
import { notificationService } from './notification.service';
import fs from 'fs';

export interface CreateFoundItemInput {
  title: string;
  description: string;
  category: string;
  brand?: string;
  color?: string;
  location?: string;
  dateFound: string;
  finder: string;
  college: string;
}

export interface UpdateFoundItemInput {
  title?: string;
  description?: string;
  category?: string;
  brand?: string;
  color?: string;
  location?: string;
  dateFound?: string;
  status?: string;
}

export class FoundItemService {
  async createFoundItem(
    input: CreateFoundItemInput,
    imagePaths: string[] = []
  ): Promise<IFoundItem> {
    const itemData: Partial<IFoundItem> = {
      title: input.title,
      description: input.description,
      category: input.category,
      brand: input.brand || '',
      color: input.color || '',
      location: input.location || '',
      dateFound: new Date(input.dateFound),
      finder: new mongoose.Types.ObjectId(input.finder),
      college: new mongoose.Types.ObjectId(input.college),
    };

    // Upload pipeline: Multer → Cloudinary → AI → DB (supports multiple images)
    if (imagePaths.length > 0) {
      // Generate embedding from the first image before temp files are cleaned up.
      try {
        const embeddingResult = await generateEmbedding(imagePaths[0]);
        itemData.embedding = embeddingResult.embedding;
        itemData.embeddingId = `emb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        logger.info(`Embedding generated for found item: ${input.title}`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Embedding error';
        logger.warn(`Embedding generation failed: ${msg}. Creating item without embedding.`);
      }

      const uploadedUrls: string[] = [];
      let firstPublicId = '';

      for (const imagePath of imagePaths) {
        try {
          const uploadResult = await uploadToCloudinary(imagePath, UPLOAD_FOLDER.ITEM_IMAGES);
          uploadedUrls.push(uploadResult.secureUrl);
          if (!firstPublicId) firstPublicId = uploadResult.publicId;
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Upload error';
          logger.warn(`Image upload failed for found item: ${msg}`);
        } finally {
          if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }
      }

      if (uploadedUrls.length > 0) {
        itemData.images = uploadedUrls;
        itemData.cloudinaryImageId = firstPublicId;
        itemData.optimizedImageUrl = uploadedUrls[0];
        itemData.thumbnailUrl = uploadedUrls[0].replace('/upload/', '/upload/w_200,h_200,c_thumb/');
      }
    }

    return foundItemRepository.create(itemData).then(async (created) => {
      await this.notifyMatchingLostOwners(created);
      return created;
    });
  }

  /**
   * After a found item is created, scan open lost items in the same college and
   * notify owners when the metadata-based match score crosses the threshold.
   * Wrapped so notification failures never break item creation.
   */
  private async notifyMatchingLostOwners(foundItem: IFoundItem): Promise<void> {
    const MATCH_NOTIFY_THRESHOLD = 0.5;
    try {
      const lostItems = await lostItemRepository.findAll(
        {
          college: foundItem.college.toString(),
          status: ITEM_STATUS.LOST.OPEN,
          category: foundItem.category,
        },
        1,
        25
      );

      for (const lost of lostItems.items) {
        const scores = matchEngineService.calculateMatchScore(
          {
            title: lost.title,
            description: lost.description,
            category: lost.category,
            brand: lost.brand,
            color: lost.color,
            location: lost.location,
            dateLost: lost.dateLost,
          },
          foundItem,
          0
        );

        if (scores.overallScore >= MATCH_NOTIFY_THRESHOLD) {
          await notificationService.notifyNewMatch(
            lost.owner.toString(),
            lost.title,
            foundItem.title,
            scores.overallScore
          );
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.warn(`Match notification pass failed for found item ${foundItem._id}: ${msg}`);
    }
  }

  async getAllFoundItems(
    filter: FoundItemFilter,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ) {
    const p = page || PAGINATION.DEFAULT_PAGE;
    const l = Math.min(limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

    const { items, total } = await foundItemRepository.findAll(
      filter, p, l, sortBy, sortOrder
    );

    return {
      data: items,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
  }

  async getFoundItemById(id: string): Promise<IFoundItem> {
    const item = await foundItemRepository.findById(id);
    if (!item) {
      throw ApiError.notFound('Found item not found');
    }
    return item;
  }

  async updateFoundItem(
    id: string,
    input: UpdateFoundItemInput,
    userId: string,
    userRole: string
  ): Promise<IFoundItem> {
    const item = await foundItemRepository.findById(id);
    if (!item) {
      throw ApiError.notFound('Found item not found');
    }

    // Ownership check: only finder or admin can update
    if (userRole === 'STUDENT' && item.finder.toString() !== userId) {
      throw ApiError.forbidden('You can only modify your own items');
    }

    const updateData: Partial<IFoundItem> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.brand !== undefined) updateData.brand = input.brand;
    if (input.color !== undefined) updateData.color = input.color;
    if (input.location !== undefined) updateData.location = input.location;
    if (input.dateFound !== undefined) updateData.dateFound = new Date(input.dateFound);
    if (input.status !== undefined) updateData.status = input.status;

    const updated = await foundItemRepository.update(id, updateData);
    if (!updated) {
      throw ApiError.internal('Failed to update found item');
    }
    return updated;
  }

  async deleteFoundItem(
    id: string,
    userId: string,
    userRole: string
  ): Promise<void> {
    const item = await foundItemRepository.findById(id);
    if (!item) {
      throw ApiError.notFound('Found item not found');
    }

    // Ownership check
    if (userRole === 'STUDENT' && item.finder.toString() !== userId) {
      throw ApiError.forbidden('You can only delete your own items');
    }

    await foundItemRepository.softDelete(id);
  }
}

export const foundItemService = new FoundItemService();
