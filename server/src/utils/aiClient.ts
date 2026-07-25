import axios from 'axios';
import fs from 'fs';
import { env } from '../config/env';
import { logger } from './logger';

const aiClient = axios.create({
  baseURL: env.AI_SERVICE_URL,
  timeout: 30000,
});

export interface EmbeddingResult {
  embedding: number[];
  dimension: number;
}

export interface MatchCandidate {
  id: string;
  embedding: number[];
}

export interface MatchResultItem {
  id: string;
  similarity: number;
}

/**
 * Call AI service to generate an embedding from an image file.
 */
export const generateEmbedding = async (
  filePath: string
): Promise<EmbeddingResult> => {
  try {
    const fileStream = fs.createReadStream(filePath);
    const formData = new FormData();
    formData.append('file', fileStream);

    const response = await aiClient.post('/generate-embedding', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    logger.info('Embedding generated via AI service');
    return {
      embedding: response.data.embedding,
      dimension: response.data.dimension,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'AI service call failed';
    logger.error(`Embedding generation failed: ${message}`);
    throw new Error(`AI service unavailable: ${message}`);
  }
};

/**
 * Call AI service to find top-K matches.
 */
export const findMatches = async (
  queryEmbedding: number[],
  candidates: MatchCandidate[],
  topK: number = 10,
  threshold: number = 0.3
): Promise<MatchResultItem[]> => {
  try {
    const response = await aiClient.post('/match', {
      query_embedding: queryEmbedding,
      candidates,
      top_k: topK,
      threshold,
    });

    logger.info(
      `AI match complete: ${response.data.matches_found}/${response.data.total_candidates} matched`
    );
    return response.data.matches;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'AI match call failed';
    logger.error(`AI matching failed: ${message}`);
    throw new Error(`AI service unavailable: ${message}`);
  }
};

/**
 * Check AI service health.
 */
export const checkAIHealth = async (): Promise<boolean> => {
  try {
    const response = await aiClient.get('/health');
    return response.data.status === 'healthy';
  } catch {
    return false;
  }
};
