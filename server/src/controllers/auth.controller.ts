import { Response } from 'express';
import { authService } from '../services';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { sendCreated, sendOk, sendNoContent } from '../utils/ApiResponse';
import { env } from '../config/env';
import { COOKIE_NAMES } from '../constants';

const cookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAMESITE,
  path: '/',
};

export const register = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { user, tokens } = await authService.register(req.body);

    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password, refreshToken, ...userWithoutSensitive } = user.toObject();

    sendCreated(res, 'Registration successful', {
      user: userWithoutSensitive,
      accessToken: tokens.accessToken,
    });
  }
);

export const login = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { user, tokens } = await authService.login(req.body);

    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password, refreshToken, ...userWithoutSensitive } = user.toObject();

    sendOk(res, 'Login successful', {
      user: userWithoutSensitive,
      accessToken: tokens.accessToken,
    });
  }
);

export const logout = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    await authService.logout(userId);

    res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, cookieOptions);
    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, cookieOptions);

    sendNoContent(res, 'Logged out successfully');
  }
);

export const changePassword = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { oldPassword, newPassword } = req.body;
    await authService.changePassword(req.user!.userId, oldPassword, newPassword);
    sendOk(res, 'Password changed successfully');
  }
);

export const refresh = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const refreshToken = req.cookies[COOKIE_NAMES.REFRESH_TOKEN];

    const tokens = await authService.refresh(refreshToken);

    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendOk(res, 'Token refreshed successfully', {
      accessToken: tokens.accessToken,
    });
  }
);
