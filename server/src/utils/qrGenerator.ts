import QRCode from 'qrcode';
import { logger } from './logger';

export interface RecoveryReceiptData {
  recoveryId: string;
  itemId: string;
  studentName: string;
  recoveryDate: string;
  adminName: string;
  status: string;
}

/**
 * Generates a QR code as a base64-encoded PNG data URL.
 */
export async function generateRecoveryQR(data: RecoveryReceiptData): Promise<string> {
  const payload = JSON.stringify({
    type: 'RECOVERY_RECEIPT',
    recoveryId: data.recoveryId,
    itemId: data.itemId,
    studentName: data.studentName,
    recoveryDate: data.recoveryDate,
    adminName: data.adminName,
    status: data.status,
  });

  try {
    const dataUrl = await QRCode.toDataURL(payload, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
    });
    logger.info(`QR code generated for recovery: ${data.recoveryId}`);
    return dataUrl;
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to generate QR code: ${msg}`);
    throw new Error('Failed to generate QR code');
  }
}
