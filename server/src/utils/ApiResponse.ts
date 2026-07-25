import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  error?: string
): void => {
  const response: ApiResponse = {
    success: false,
    message,
    error,
  };
  res.status(statusCode).json(response);
};

export const sendCreated = <T>(
  res: Response,
  message: string,
  data?: T
): void => {
  sendSuccess(res, 201, message, data);
};

export const sendOk = <T>(
  res: Response,
  message: string,
  data?: T
): void => {
  sendSuccess(res, 200, message, data);
};

export const sendNoContent = (res: Response, message: string): void => {
  const response: ApiResponse = {
    success: true,
    message,
  };
  res.status(200).json(response);
};
