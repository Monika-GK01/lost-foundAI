import mongoose from 'mongoose';
import { foundItemRepository, FoundItemFilter } from '../repositories/foundItem.repository';
import { ApiError } from '../utils/ApiError';
import { uploadToCloudinary } from '../config/cloudinary';
import { generateEmbedding } from '../utils/aiClient';
import { IFoundItem } from '../models';
import { UPLOAD_FOLDER, PAGINATION } from '../constants';
import { logger } from '../utils/logger';
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
    imagePath?: string
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

    // Upload pipeline: Multer → Cloudinary → AI → DB
    if (imagePath) {
      try {
        // Step 1: Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(
          imagePath,
          UPLOAD_FOLDER.ITEM_IMAGES
        );
        itemData.images = [uploadResult.secureUrl];
        itemData.cloudinaryImageId = uploadResult.publicId;
        itemData.optimizedImageUrl = uploadResult.secureUrl;
        itemData.thumbnailUrl = uploadResult.secureUrl.replace(
          '/upload/',
          '/upload/w_200,h_200,c_thumb/'
        );

        // Step 2: Generate embedding via AI service
        const embeddingResult = await generateEmbedding(imagePath);
        itemData.embedding = embeddingResult.embedding;
        itemData.embeddingId = `emb_${Date.now()}_${Math.random().toString(36).slice(2)}`;

        logger.info(`Embedding generated for found item: ${input.title}`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Upload pipeline error';
        logger.warn(`Upload pipeline partial failure: ${msg}. Creating item without embedding.`);
      } finally {
        // Cleanup temp file
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }

    return foundItemRepository.create(itemData);
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
