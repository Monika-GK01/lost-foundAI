import { userRepository, collegeRepository } from '../repositories';
import { ApiError } from '../utils/ApiError';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/token';
import { JwtPayload } from '../types';
import { IUser } from '../models';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  college: string;
  role?: string;
  department?: string;
  year?: number;
  rollNumber?: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(
    input: RegisterInput
  ): Promise<{ user: IUser; tokens: AuthTokens }> {
    const emailExists = await userRepository.emailExists(input.email);

    if (emailExists) {
      throw ApiError.conflict('Email already registered');
    }

    // Find college using college code entered by user (MBU, VIT, etc.)
    const college = await collegeRepository.findByCode(input.college);

    if (!college) {
      throw ApiError.badRequest(
        `College '${input.college}' not found. Please contact administrator.`
      );
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      college: college._id,
      role: input.role || 'STUDENT',
      department: input.department,
      year: input.year,
      rollNumber: input.rollNumber,
      phone: input.phone,
    });

    const tokens = await this.generateTokens(user);

    await userRepository.updateRefreshToken(
      user._id.toString(),
      tokens.refreshToken
    );

    return {
      user,
      tokens,
    };
  }

  async login(
    input: LoginInput
  ): Promise<{ user: IUser; tokens: AuthTokens }> {
    const user = await userRepository.findByEmail(input.email);

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated');
    }

    const validPassword = await comparePassword(
      input.password,
      user.password
    );

    if (!validPassword) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);

    await userRepository.updateRefreshToken(
      user._id.toString(),
      tokens.refreshToken
    );

    await userRepository.updateLastLogin(user._id.toString());

    return {
      user,
      tokens,
    };
  }

  async logout(userId: string): Promise<void> {
    await userRepository.updateRefreshToken(userId, '');
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await userRepository.findByIdWithPassword(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const validPassword = await comparePassword(oldPassword, user.password);
    if (!validPassword) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    const hashedPassword = await hashPassword(newPassword);
    await userRepository.update(userId, { password: hashedPassword });
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: JwtPayload;

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const user = await userRepository.findByIdWithPassword(payload.userId);

    if (!user || user.refreshToken !== refreshToken) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated');
    }

    const tokens = await this.generateTokens(user);

    await userRepository.updateRefreshToken(
      user._id.toString(),
      tokens.refreshToken
    );

    return tokens;
  }

  private async generateTokens(user: IUser): Promise<AuthTokens> {
    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role as JwtPayload['role'],
      college: user.college.toString(),
    };

    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }
}

export const authService = new AuthService();