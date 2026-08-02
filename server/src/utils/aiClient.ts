import axios from 'axios';
import fs from 'fs';
import path from 'path';
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
 * Reads the file as a Buffer and sends via native FormData (Node 18+).
 * Does NOT manually set Content-Type so axios auto-generates the boundary.
 */
export const generateEmbedding = async (
  filePath: string
): Promise<EmbeddingResult> => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const blob = new Blob([fileBuffer], { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append('file', blob, fileName);

    // Let axios set Content-Type automatically (includes multipart boundary)
    const response = await aiClient.post('/generate-embedding', formData);

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
