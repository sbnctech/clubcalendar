/**
 * ClubCalendar Configuration Validator
 * =====================================
 *
 * Pure JavaScript validation function for inline widget configuration.
 * No external dependencies. Safe to inline in Wild Apricot.
 *
 * Usage:
 *   const result = validateConfig(window.CLUBCALENDAR_CONFIG);
 *   if (!result.valid) {
 *       showConfigError(result.errors);
 *   }
 */

/**
 * Validates a ClubCalendar configuration object.
 *
 * @param {Object} config - The configuration object to validate
 * @returns {Object} - { valid: boolean, errors: string[], warnings: string[] }
 */
function validateClubCalendarConfig(config) {
    const errors = [];
    const warnings = [];

    // Helper: check if value is a valid hex color
    function isHexColor(value) {
        if (typeof value !== 'string') return false;
        return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);
    }

    // Helper: check if value is one of allowed options
    function isOneOf(value, options) {
        return options.includes(value);
    }

    // Helper: check if value is a boolean
    function isBoolean(value) {
        return typeof value === 'boolean';
    }

    // Helper: check if value is a non-empty string
    function isNonEmptyString(value) {
        return typeof value === 'string' && value.trim().length > 0;
    }

    // Helper: check if value is a valid tag format (category:value)
    function isValidTag(value) {
        if (typeof value !== 'string') return false;
        return /^[a-zA-Z0-9-]+:[a-zA-Z0-9-]+$/.test(value);
    }

    // ─────────────────────────────────────────────────────────────────
    // REQUIRED FIELDS
    // ─────────────────────────────────────────────────────────────────

    if (!config) {
        errors.push('Configuration object is missing. Define window.CLUBCALENDAR_CONFIG before the widget script.');
        return { valid: false, errors, warnings };
    }

    if (!config.waAccountId) {
        errors.push('waAccountId is required. Find it in WA Admin → Settings → Account.');
    } else if (typeof config.waAccountId !== 'string') {
        errors.push('waAccountId must be a string (in quotes).');
    } else if (!/^\d+$/.test(config.waAccountId)) {
        errors.push('waAccountId must contain only numbers. Example: "176353"');
    }

    // ─────────────────────────────────────────────────────────────────
    // DISPLAY SETTINGS
    // ─────────────────────────────────────────────────────────────────

    if (config.headerTitle !== undefined) {
        if (typeof config.headerTitle !== 'string') {
            errors.push('headerTitle must be a string (in quotes).');
        } else if (config.headerTitle.length > 100) {
            errors.push('headerTitle must be 100 characters or less.');
        }
    }

    if (config.showHeader !== undefined && !isBoolean(config.showHeader)) {
        errors.push('showHeader must be true or false (no quotes).');
    }

    if (config.showFilters !== undefined && !isBoolean(config.showFilters)) {
        errors.push('showFilters must be true or false (no quotes).');
    }

    if (config.showMyEvents !== undefined && !isBoolean(config.showMyEvents)) {
        errors.push('showMyEvents must be true or false (no quotes).');
    }

    if (config.defaultView !== undefined) {
        const validViews = ['dayGridMonth', 'timeGridWeek', 'listMonth'];
        if (!isOneOf(config.defaultView, validViews)) {
            errors.push(`defaultView must be one of: ${validViews.join(', ')}`);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // AUDIENCE MODE
    // ─────────────────────────────────────────────────────────────────

    if (config.audienceMode !== undefined) {
        const validModes = ['public', 'member'];
        if (!isOneOf(config.audienceMode, validModes)) {
            errors.push(`audienceMode must be one of: ${validModes.join(', ')}`);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // THEME SETTINGS
    // ─────────────────────────────────────────────────────────────────

    if (config.primaryColor !== undefined && !isHexColor(config.primaryColor)) {
        errors.push('primaryColor must be a hex color like "#2c5aa0" or "#fff"');
    }

    if (config.accentColor !== undefined && !isHexColor(config.accentColor)) {
        errors.push('accentColor must be a hex color like "#d4a800" or "#fff"');
    }

    if (config.stylePreset !== undefined) {
        const validPresets = ['default', 'compact', 'minimal'];
        if (!isOneOf(config.stylePreset, validPresets)) {
            errors.push(`stylePreset must be one of: ${validPresets.join(', ')}`);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // FILTER SETTINGS
    // ─────────────────────────────────────────────────────────────────

    if (config.quickFilters !== undefined) {
        if (typeof config.quickFilters !== 'object' || config.quickFilters === null) {
            errors.push('quickFilters must be an object with boolean values.');
        } else {
            const validQuickFilters = ['weekend', 'openings', 'afterhours', 'public', 'free'];
            for (const key of Object.keys(config.quickFilters)) {
                if (!validQuickFilters.includes(key)) {
                    warnings.push(`quickFilters.${key} is not a recognized filter and will be ignored.`);
                } else if (!isBoolean(config.quickFilters[key])) {
                    errors.push(`quickFilters.${key} must be true or false.`);
                }
            }
        }
    }

    if (config.dropdownFilters !== undefined) {
        if (typeof config.dropdownFilters !== 'object' || config.dropdownFilters === null) {
            errors.push('dropdownFilters must be an object with boolean values.');
        } else {
            const validDropdowns = ['committee', 'activity', 'price', 'eventType', 'recurring', 'venue', 'tags'];
            for (const key of Object.keys(config.dropdownFilters)) {
                if (!validDropdowns.includes(key)) {
                    warnings.push(`dropdownFilters.${key} is not a recognized filter and will be ignored.`);
                } else if (!isBoolean(config.dropdownFilters[key])) {
                    errors.push(`dropdownFilters.${key} must be true or false.`);
                }
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // TAG SETTINGS
    // ─────────────────────────────────────────────────────────────────

    if (config.showEventTags !== undefined && !isBoolean(config.showEventTags)) {
        errors.push('showEventTags must be true or false.');
    }

    if (config.hiddenTags !== undefined) {
        if (!Array.isArray(config.hiddenTags)) {
            errors.push('hiddenTags must be an array of strings.');
        } else {
            for (let i = 0; i < config.hiddenTags.length; i++) {
                if (typeof config.hiddenTags[i] !== 'string') {
                    errors.push(`hiddenTags[${i}] must be a string.`);
                }
            }
        }
    }

    if (config.allowedTags !== undefined && config.allowedTags !== null) {
        if (!Array.isArray(config.allowedTags)) {
            errors.push('allowedTags must be an array of strings or null.');
        } else {
            for (let i = 0; i < config.allowedTags.length; i++) {
                if (typeof config.allowedTags[i] !== 'string') {
                    errors.push(`allowedTags[${i}] must be a string.`);
                }
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // AUTO-TAGGING RULES
    // ─────────────────────────────────────────────────────────────────

    if (config.autoTagRules !== undefined) {
        if (!Array.isArray(config.autoTagRules)) {
            errors.push('autoTagRules must be an array of rule objects.');
        } else if (config.autoTagRules.length > 100) {
            errors.push('autoTagRules cannot have more than 100 rules.');
        } else {
            const validTypes = ['name-prefix', 'name-contains'];
            for (let i = 0; i < config.autoTagRules.length; i++) {
                const rule = config.autoTagRules[i];
                const prefix = `autoTagRules[${i}]`;

                if (typeof rule !== 'object' || rule === null) {
                    errors.push(`${prefix} must be an object with type, pattern, and tag.`);
                    continue;
                }

                if (!rule.type) {
                    errors.push(`${prefix}.type is required.`);
                } else if (!isOneOf(rule.type, validTypes)) {
                    errors.push(`${prefix}.type must be one of: ${validTypes.join(', ')}`);
                }

                if (!rule.pattern) {
                    errors.push(`${prefix}.pattern is required.`);
                } else if (typeof rule.pattern !== 'string') {
                    errors.push(`${prefix}.pattern must be a string.`);
                } else if (rule.pattern.length > 100) {
                    errors.push(`${prefix}.pattern must be 100 characters or less.`);
                }

                if (!rule.tag) {
                    errors.push(`${prefix}.tag is required.`);
                } else if (!isValidTag(rule.tag)) {
                    errors.push(`${prefix}.tag must be in format "category:value" (e.g., "committee:hiking").`);
                }
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // UI LABELS
    // ─────────────────────────────────────────────────────────────────

    if (config.labels !== undefined) {
        if (typeof config.labels !== 'object' || config.labels === null) {
            errors.push('labels must be an object with string values.');
        } else {
            const validLabels = ['noEvents', 'loading', 'error', 'myEvents', 'allEvents'];
            for (const key of Object.keys(config.labels)) {
                if (!validLabels.includes(key)) {
                    warnings.push(`labels.${key} is not a recognized label and will be ignored.`);
                } else if (typeof config.labels[key] !== 'string') {
                    errors.push(`labels.${key} must be a string.`);
                }
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // ADVANCED SETTINGS
    // ─────────────────────────────────────────────────────────────────

    if (config.pastEventsVisible !== undefined && !isBoolean(config.pastEventsVisible)) {
        errors.push('pastEventsVisible must be true or false.');
    }

    if (config.pastEventsDays !== undefined) {
        if (typeof config.pastEventsDays !== 'number') {
            errors.push('pastEventsDays must be a number.');
        } else if (config.pastEventsDays < 0 || config.pastEventsDays > 365) {
            errors.push('pastEventsDays must be between 0 and 365.');
        }
    }

    if (config.showEventDots !== undefined && !isBoolean(config.showEventDots)) {
        errors.push('showEventDots must be true or false.');
    }

    if (config.showWaitlistCount !== undefined && !isBoolean(config.showWaitlistCount)) {
        errors.push('showWaitlistCount must be true or false.');
    }

    // ─────────────────────────────────────────────────────────────────
    // SECURITY CHECK
    // ─────────────────────────────────────────────────────────────────

    const forbiddenKeys = ['apiKey', 'apiSecret', 'token', 'password', 'secret', 'credential'];
    for (const key of Object.keys(config)) {
        const lowerKey = key.toLowerCase();
        for (const forbidden of forbiddenKeys) {
            if (lowerKey.includes(forbidden)) {
                errors.push(`Security error: "${key}" looks like a credential. Remove it from config.`);
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Formats validation errors for display to admins.
 *
 * @param {Object} result - Result from validateClubCalendarConfig
 * @returns {string} - Formatted error message for display
 */
function formatConfigErrors(result) {
    if (result.valid && result.warnings.length === 0) {
        return '✓ Configuration is valid.';
    }

    let message = '';

    if (result.errors.length > 0) {
        message += '❌ Configuration Errors:\n\n';
        for (const error of result.errors) {
            message += `  • ${error}\n`;
        }
    }

    if (result.warnings.length > 0) {
        if (message) message += '\n';
        message += '⚠️ Warnings:\n\n';
        for (const warning of result.warnings) {
            message += `  • ${warning}\n`;
        }
    }

    message += '\n📖 See CONFIG_CONTRACT.md for documentation.';

    return message;
}

/**
 * Shows a user-friendly error message in the widget container.
 *
 * @param {Object} result - Result from validateClubCalendarConfig
 * @param {string} containerId - ID of the container element
 */
function showConfigError(result, containerId) {
    containerId = containerId || 'clubcalendar';
    const container = document.getElementById(containerId);
    if (!container) return;

    const errorHtml = `
        <div style="
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 8px;
            color: #856404;
            max-width: 600px;
            margin: 20px auto;
        ">
            <h3 style="margin: 0 0 15px 0; color: #856404;">
                ⚠️ Calendar Configuration Error
            </h3>
            <div style="background: white; padding: 15px; border-radius: 4px; font-size: 14px;">
                ${result.errors.map(e => `<p style="margin: 8px 0;">• ${escapeHtml(e)}</p>`).join('')}
            </div>
            <p style="margin: 15px 0 0 0; font-size: 13px; color: #666;">
                Edit the configuration in the Custom HTML gadget to fix these errors.
            </p>
        </div>
    `;

    container.innerHTML = errorHtml;
}

/**
 * Escapes HTML to prevent XSS.
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Export for use in widget
if (typeof window !== 'undefined') {
    window.validateClubCalendarConfig = validateClubCalendarConfig;
    window.formatConfigErrors = formatConfigErrors;
    window.showConfigError = showConfigError;
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateClubCalendarConfig,
        formatConfigErrors
    };
}
