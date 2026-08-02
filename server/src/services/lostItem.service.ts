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

export interface CreateItemResult {
  item: ILostItem;
  uploadWarnings: string[];
}

export class LostItemService {
  async createLostItem(
    input: CreateLostItemInput,
    imagePaths: string[] = []
  ): Promise<CreateItemResult> {
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

    // Upload pipeline: Multer → Cloudinary → AI → DB (supports multiple images)
    if (imagePaths.length > 0) {
      // Generate embedding from the first image before temp files are cleaned up.
      try {
        const embeddingResult = await generateEmbedding(imagePaths[0]);
        itemData.embedding = embeddingResult.embedding;
        itemData.embeddingId = `emb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        logger.info(`Embedding generated for lost item: ${input.title}`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Embedding error';
        logger.warn(`Embedding generation failed: ${msg}. Creating item without embedding.`);
      }

      const uploadedUrls: string[] = [];
      const uploadWarnings: string[] = [];
      let firstPublicId = '';

      for (const imagePath of imagePaths) {
        try {
          const uploadResult = await uploadToCloudinary(imagePath, UPLOAD_FOLDER.ITEM_IMAGES);
          uploadedUrls.push(uploadResult.secureUrl);
          if (!firstPublicId) firstPublicId = uploadResult.publicId;
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Upload error';
          logger.warn(`Image upload failed for lost item: ${msg}`);
          uploadWarnings.push(`Image upload failed: ${msg}`);
        } finally {
          if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }
      }

      // If all uploads failed, reject the creation entirely
      if (uploadedUrls.length === 0 && imagePaths.length > 0) {
        throw ApiError.internal('All image uploads failed. Please check your Cloudinary configuration and try again.');
      }

      if (uploadedUrls.length > 0) {
        itemData.images = uploadedUrls;
        itemData.cloudinaryImageId = firstPublicId;
        itemData.optimizedImageUrl = uploadedUrls[0];
        itemData.thumbnailUrl = uploadedUrls[0].replace('/upload/', '/upload/w_200,h_200,c_thumb/');
      }

      const item = await lostItemRepository.create(itemData);
      return { item, uploadWarnings };
    }

    const item = await lostItemRepository.create(itemData);
    return { item, uploadWarnings: [] };
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
   * Pipeline: load item → get candidates → AI image match (optional) → weighted metadata scoring.
   * Works with OR without image embeddings — falls back to metadata-only matching.
   */
  async findMatches(lostItemId: string): Promise<RankedMatch[]> {
    const lostItem = await lostItemRepository.findByIdWithEmbedding(lostItemId);
    if (!lostItem) {
      throw ApiError.notFound('Lost item not found');
    }

    const hasEmbedding = lostItem.embedding && lostItem.embedding.length > 0;

    // Get all open found items in the same college
    const foundItems = await foundItemRepository.findOpenWithEmbeddings(
      lostItem.college.toString()
    );

    logger.info(
      `[MATCH] Lost item ${lostItemId} ("${lostItem.title}") | embedding=${hasEmbedding} | found candidates=${foundItems.length}`
    );

    if (foundItems.length === 0) {
      return [];
    }

    // Attempt AI image similarity if both sides have embeddings
    let imageSimilarities = new Map<string, number>();
    if (hasEmbedding) {
      const candidates: MatchCandidate[] = foundItems
        .filter((fi) => fi.embedding && fi.embedding.length > 0)
        .map((fi) => ({
          id: fi._id.toString(),
          embedding: fi.embedding,
        }));

      if (candidates.length > 0) {
        try {
          const aiMatches = await findMatches(
            lostItem.embedding!,
            candidates,
            MATCH_CONFIG.DEFAULT_TOP_K,
            MATCH_CONFIG.SIMILARITY_THRESHOLD
          );
          imageSimilarities = new Map(aiMatches.map((m) => [m.id, m.similarity]));
          logger.info(`[MATCH] AI image matching returned ${aiMatches.length} similarities`);
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'unknown';
          logger.warn(`[MATCH] AI service unavailable (${msg}), using metadata-only scoring`);
        }
      }
    } else {
      logger.info('[MATCH] No embedding on lost item, using metadata-only matching');
    }

    // Apply weighted match engine (works with or without image similarities)
    const lostItemData: LostItemData = {
      title: lostItem.title,
      description: lostItem.description,
      category: lostItem.category,
      brand: lostItem.brand,
      color: lostItem.color,
      location: lostItem.location,
      dateLost: lostItem.dateLost,
      embedding: lostItem.embedding,
    };

    const results = matchEngineService.rankMatches(lostItemData, foundItems, imageSimilarities);

    // Filter out ignored matches
    const ignoredIds = new Set(
      (lostItem.ignoredMatchIds || []).map((id) => id.toString())
    );
    const filtered = results.filter(
      (r) => !ignoredIds.has(r.foundItem._id.toString())
    );

    logger.info(`[MATCH] Final ranked matches: ${filtered.length} (top score: ${filtered[0]?.scores.overallScore ?? 0})`);

    return filtered;
  }

  /**
   * Accept or ignore a match suggestion for a lost item.
   */
  async matchAction(
    lostItemId: string,
    userId: string,
    foundItemId: string,
    action: 'accept' | 'ignore'
  ): Promise<ILostItem> {
    const lostItem = await lostItemRepository.findById(lostItemId);
    if (!lostItem) {
      throw ApiError.notFound('Lost item not found');
    }
    if (lostItem.owner.toString() !== userId) {
      throw ApiError.forbidden('You can only manage matches for your own items');
    }

    const foundItem = await foundItemRepository.findById(foundItemId);
    if (!foundItem) {
      throw ApiError.notFound('Found item not found');
    }

    if (action === 'accept') {
      const updated = await lostItemRepository.update(lostItemId, {
        acceptedMatchId: new mongoose.Types.ObjectId(foundItemId),
      } as any);
      if (!updated) throw ApiError.internal('Failed to accept match');
      logger.info(`Match accepted: lost=${lostItemId} found=${foundItemId}`);
      return updated;
    } else {
      // Add to ignoredMatchIds if not already present
      const currentIgnored = lostItem.ignoredMatchIds || [];
      const alreadyIgnored = currentIgnored.some((id) => id.toString() === foundItemId);
      if (!alreadyIgnored) {
        currentIgnored.push(new mongoose.Types.ObjectId(foundItemId));
      }
      const updated = await lostItemRepository.update(lostItemId, {
        ignoredMatchIds: currentIgnored,
      } as any);
      if (!updated) throw ApiError.internal('Failed to ignore match');
      logger.info(`Match ignored: lost=${lostItemId} found=${foundItemId}`);
      return updated;
    }
  }
}

export const lostItemService = new LostItemService();
