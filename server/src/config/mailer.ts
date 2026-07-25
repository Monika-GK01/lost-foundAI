import nodemailer from 'nodemailer';
import { env } from './env';
import { logger } from '../utils/logger';

let transporter: nodemailer.Transporter | null = null;

/**
 * Returns a configured Nodemailer transporter.
 * Returns null if SMTP is not configured (emails will be skipped).
 */
export function getTransporter(): nodemailer.Transporter | null {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
    logger.info('SMTP transporter initialized');
  }

  return transporter;
}
