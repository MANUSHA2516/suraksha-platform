import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes, createHash, createHmac } from 'node:crypto';
import { required } from './env';
@Injectable()
export class CryptoService {
  private key(): Buffer {
    const key = Buffer.from(required('EVIDENCE_KEY'), 'hex');
    if (key.length !== 32) throw new Error('EVIDENCE_KEY must be 32 bytes');
    return key;
  }
  encrypt(bytes: Buffer): Buffer {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key(), iv);
    const data = Buffer.concat([cipher.update(bytes), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), data]);
  }
  decrypt(bytes: Buffer): Buffer {
    const decipher = createDecipheriv('aes-256-gcm', this.key(), bytes.subarray(0, 12));
    decipher.setAuthTag(bytes.subarray(12, 28));
    return Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]);
  }
  seal(text: string): string {
    return this.encrypt(Buffer.from(text, 'utf8')).toString('base64');
  }
  open(cipher: string): string {
    return this.decrypt(Buffer.from(cipher, 'base64')).toString('utf8');
  }
  hash(bytes: Buffer | string): string {
    return createHash('sha256').update(bytes).digest('hex');
  }
  identity(nic: string): string {
    return createHmac('sha256', required('IDENTITY_LOOKUP_KEY'))
      .update(nic.trim().toUpperCase())
      .digest('hex');
  }
}
