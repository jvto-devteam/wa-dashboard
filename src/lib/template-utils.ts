/**
 * Extract variables from template content
 * Example: "Hello {name}! Welcome to {company}." → ["name", "company"]
 */
export function extractVariables(content: string): string[] {
  const regex = /\{([^}]+)\}/g;
  const matches = content.match(regex) || [];
  return [...new Set(matches.map(match => match.slice(1, -1).trim()))];
}

/**
 * Validate if all required variables are provided
 */
export function validateVariables(
  templateVariables: Array<{ name: string; isRequired: boolean }>,
  providedValues: Record<string, string>
): { isValid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const variable of templateVariables) {
    if (variable.isRequired && (!providedValues[variable.name] || providedValues[variable.name].trim() === "")) {
      missing.push(variable.name);
    }
  }

  return {
    isValid: missing.length === 0,
    missing
  };
}

/**
 * Replace variables in template content with provided values
 * Example: "Hello {name}!" with {name: "John"} → "Hello John!"
 */
export function replaceVariables(
  content: string,
  values: Record<string, string>
): string {
  return content.replace(/\{([^}]+)\}/g, (match, variableName) => {
    const trimmedName = variableName.trim();
    return values[trimmedName] !== undefined ? values[trimmedName] : match;
  });
}

/**
 * Format WhatsApp message with supported formatting
 * - Bold: *text*
 * - Italic: _text_
 * - Strikethrough: ~text~
 * - Monospace: ```text```
 */
export function formatWhatsAppMessage(content: string): string {
  // WhatsApp automatically handles these formatting markers
  return content;
}

/**
 * Parse template content and return final message with variables replaced
 */
export function parseTemplate(
  templateContent: string,
  variables: Record<string, string> = {}
): string {
  const replaced = replaceVariables(templateContent, variables);
  return formatWhatsAppMessage(replaced);
}