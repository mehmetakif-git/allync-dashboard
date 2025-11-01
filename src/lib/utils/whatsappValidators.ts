// =====================================================
// WhatsApp Validators - Utility Functions
// =====================================================

/**
 * Validate phone number (basic international format)
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone) return false;

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Should be at least 10 digits, max 15
  return cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Validate WhatsApp instance ID
 */
export function validateInstanceId(id: string): boolean {
  if (!id) return false;

  // Instance ID should be alphanumeric with hyphens/underscores
  // Example: "instance-123", "my_bot_1"
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

/**
 * Validate API key format
 */
export function validateAPIKey(key: string): boolean {
  if (!key) return false;

  // API key should be at least 20 characters
  // and contain alphanumeric characters
  return key.length >= 20 && /^[a-zA-Z0-9_-]+$/.test(key);
}

/**
 * Validate webhook URL
 */
export function validateWebhookURL(url: string): boolean {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    // Must be https
    return urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate Evolution API URL
 */
export function validateEvolutionAPIURL(url: string): boolean {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    // Must be http or https
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate instance name
 */
export function validateInstanceName(name: string): boolean {
  if (!name) return false;

  // Should be 3-50 characters
  return name.length >= 3 && name.length <= 50;
}

/**
 * Validate AI system prompt
 */
export function validateSystemPrompt(prompt: string): boolean {
  if (!prompt) return false;

  // Should be at least 10 characters
  return prompt.length >= 10;
}

/**
 * Validate JSON string
 */
export function validateJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate date string (ISO 8601)
 */
export function validateDateString(date: string): boolean {
  if (!date) return false;

  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}

/**
 * Validate customer status
 */
export function validateCustomerStatus(status: string): boolean {
  const validStatuses = ['new', 'active', 'inactive', 'blocked'];
  return validStatuses.includes(status);
}

/**
 * Validate session status
 */
export function validateSessionStatus(status: string): boolean {
  const validStatuses = ['active', 'closed', 'archived'];
  return validStatuses.includes(status);
}

/**
 * Validate instance type
 */
export function validateInstanceType(type: string): boolean {
  const validTypes = ['sales', 'support', 'general', 'info', 'marketing'];
  return validTypes.includes(type);
}

/**
 * Validate message type
 */
export function validateMessageType(type: string): boolean {
  const validTypes = ['text', 'image', 'audio', 'video', 'document', 'location'];
  return validTypes.includes(type);
}

/**
 * Validate tag (alphanumeric, spaces, hyphens, underscores)
 */
export function validateTag(tag: string): boolean {
  if (!tag) return false;

  // 2-30 characters, alphanumeric with spaces, hyphens, underscores
  return /^[a-zA-Z0-9\s_-]{2,30}$/.test(tag);
}

/**
 * Validate UUID format
 */
export function validateUUID(uuid: string): boolean {
  if (!uuid) return false;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
