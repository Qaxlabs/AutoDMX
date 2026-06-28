import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY is not defined in environment variables');
}

// Derive a 32-byte key from the ENCRYPTION_KEY env var using SHA-256
const getKey = () => {
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
};

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12); // 96-bit IV is standard for GCM
  const key = getKey();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Format: iv:encrypted:authTag
  return `${iv.toString('hex')}:${encrypted}:${authTag}`;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, encryptedHex, authTagHex] = encryptedText.split(':');
  if (!ivHex || !encryptedHex || !authTagHex) {
    throw new Error('Invalid encrypted text format');
  }
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = getKey();
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
