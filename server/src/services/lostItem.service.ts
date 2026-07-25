import mongoose from 'mongoose';
import { lostItemRepository, LostItemFilter } from '../repositories/lostItem.repository';
import { foundItemRepository } from '../repositories/foundItem.repository';
import { matchEngineService, RankedMatch, LostItemData } from './matchEngine.service';
import { ApiError } from '../utils/ApiError';
import { uploadToCloudinary } from '../config/cloudinary';
import { generateEmbedding, findMatches, MatchCandidate } from '../utils/aiClient';
import { ILostItem } from '../models';
import { UPLOAD_FOLDER, PAGINATION, MATCH_CONFIG } from '../constants';
import { logger } from '../utils/logger';
import fs from 'fs';

export interface CreateLostItemInput {
  title: string;
  description: string;
  category: string;
  brand?: string;
  color?: string;
  location?: string;
  dateLost: string;
  reward?: string;
  owner: string;
  college: string;
}

export interface UpdateLostItemInput {
  title?: string;
  description?: string;
  category?: string;
  brand?: string;
  color?: string;
  location?: string;
  dateLost?: string;
  reward?: string;
  status?: string;
}

export class LostItemService {
  async createLostItem(
    input: CreateLostItemInput,
    imagePath?: string
  ): Promise<ILostItem> {
    const itemData: Partial<ILostItem> = {
      title: input.title,
      description: input.description,
      category: input.category,
      brand: input.brand || '',
      color: input.color || '',
      location: input.location || '',
      dateLost: new Date(input.dateLost),
      reward: input.reward || '',
      owner: new mongoose.Types.ObjectId(input.owner),
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

        logger.info(`Embedding generated for lost item: ${input.title}`);
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

    return lostItemRepository.create(itemData);
  }

  async getAllLostItems(
    filter: LostItemFilter,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ) {
    const p = page || PAGINATION.DEFAULT_PAGE;
    const l = Math.min(limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

    const { items, total } = await lostItemRepository.findAll(
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

  async getLostItemById(id: string): Promise<ILostItem> {
    const item = await lostItemRepository.findById(id);
    if (!item) {
      throw ApiError.notFound('Lost item not found');
    }
    return item;
  }

  async updateLostItem(
    id: string,
    input: UpdateLostItemInput,
    userId: string,
    userRole: string
  ): Promise<ILostItem> {
    const item = await lostItemRepository.findById(id);
    if (!item) {
      throw ApiError.notFound('Lost item not found');
    }

    // Ownership check: only owner or admin can update
    if (userRole === 'STUDENT' && item.owner.toString() !== userId) {
      throw ApiError.forbidden('You can only modify your own items');
    }

    const updateData: Partial<ILostItem> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.brand !== undefined) updateData.brand = input.brand;
    if (input.color !== undefined) updateData.color = input.color;
    if (input.location !== undefined) updateData.location = input.location;
    if (input.dateLost !== undefined) updateData.dateLost = new Date(input.dateLost);
    if (input.reward !== undefined) updateData.reward = input.reward;
    if (input.status !== undefined) updateData.status = input.status;

    const updated = await lostItemRepository.update(id, updateData);
    if (!updated) {
      throw ApiError.internal('Failed to update lost item');
    }
    return updated;
  }

  async deleteLostItem(
    id: string,
    userId: string,
    userRole: string
  ): Promise<void> {
    const item = await lostItemRepository.findById(id);
    if (!item) {
      throw ApiError.notFound('Lost item not found');
    }

    // Ownership check
    if (userRole === 'STUDENT' && item.owner.toString() !== userId) {
      throw ApiError.forbidden('You can only delete your own items');
    }

    await lostItemRepository.softDelete(id);
  }

  /**
   * Find matching found items for a lost item.
   * Full pipeline: load embedding → get candidates → AI match → weighted scoring.
   */
  async findMatches(lostItemId: string): Promise<RankedMatch[]> {
    const lostItem = await lostItemRepository.findByIdWithEmbedding(lostItemId);
    if (!lostItem) {
      throw ApiError.notFound('Lost item not found');
    }

    if (!lostItem.embedding || lostItem.embedding.length === 0) {
      throw ApiError.badRequest('This item has no embedding. Upload an image first.');
    }

    // Get open found items in the same college with embeddings
    const foundItems = await foundItemRepository.findOpenWithEmbeddings(
      lostItem.college.toString()
    );

    if (foundItems.length === 0) {
      return [];
    }

    // Build candidates for AI matching
    const candidates: MatchCandidate[] = foundItems
      .filter((fi) => fi.embedding && fi.embedding.length > 0)
      .map((fi) => ({
        id: fi._id.toString(),
        embedding: fi.embedding,
      }));

    if (candidates.length === 0) {
      return [];
    }

    // Call AI service for image similarity
    let imageSimilarities = new Map<string, number>();
    try {
      const aiMatches = await findMatches(
        lostItem.embedding,
        candidates,
        MATCH_CONFIG.DEFAULT_TOP_K,
        MATCH_CONFIG.SIMILARITY_THRESHOLD
      );
      imageSimilarities = new Map(aiMatches.map((m) => [m.id, m.similarity]));
    } catch (error) {
      logger.warn('AI matching unavailable, using metadata-only scoring');
    }

    // Apply weighted match engine
    const lostItemData: LostItemData = {
      category: lostItem.category,
      brand: lostItem.brand,
      color: lostItem.color,
      location: lostItem.location,
      dateLost: lostItem.dateLost,
      embedding: lostItem.embedding,
    };

    return matchEngineService.rankMatches(lostItemData, foundItems, imageSimilarities);
  }
}

export const lostItemService = new LostItemService();
