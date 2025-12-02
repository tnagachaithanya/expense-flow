/**
 * Date utility functions with timezone support
 * All functions accept a timezone parameter (IANA timezone string)
 * Default timezone is auto-detected from browser
 */

/**
 * Get the user's browser timezone
 */
export const getBrowserTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Get the effective timezone (resolve 'auto' to browser timezone)
 * @param {string} timezone - Timezone setting ('auto' or IANA timezone)
 */
export const getEffectiveTimezone = (timezone) => {
    return timezone === 'auto' || !timezone ? getBrowserTimezone() : timezone;
};

/**
 * Format a date for use in <input type="date"> (YYYY-MM-DD)
 * Returns the date as it appears in the target timezone
 * @param {Date|string} date - Date object or ISO string
 * @param {string} timezone - IANA timezone (e.g., 'America/New_York')
 */
export const formatDateForInput = (date, timezone = getBrowserTimezone()) => {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    // Get the date string in the target timezone
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(d);

    const year = parts.find(p => p.type === 'year').value;
    const month = parts.find(p => p.type === 'month').value;
    const day = parts.find(p => p.type === 'day').value;

    return `${year}-${month}-${day}`;
};

/**
 * Format a date for use in <input type="datetime-local">
 * @param {Date|string} date - Date object or ISO string
 * @param {string} timezone - IANA timezone
 */
export const formatDateTimeForInput = (date, timezone = getBrowserTimezone()) => {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    // Get parts in the specified timezone
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).formatToParts(d);

    const year = parts.find(p => p.type === 'year').value;
    const month = parts.find(p => p.type === 'month').value;
    const day = parts.find(p => p.type === 'day').value;
    const hour = parts.find(p => p.type === 'hour').value;
    const minute = parts.find(p => p.type === 'minute').value;

    return `${year}-${month}-${day}T${hour}:${minute}`;
};

/**
 * Parse a date string from input and return ISO string
 * Uses current time if only date is provided
 * @param {string} dateString - Date string from input (YYYY-MM-DD or YYYY-MM-DDTHH:mm)
 * @param {string} timezone - IANA timezone
 * @returns {string} ISO 8601 string
 */
export const parseInputDate = (dateString, timezone = getBrowserTimezone()) => {
    if (!dateString) return new Date().toISOString();

    // If it's just a date (YYYY-MM-DD), use current time
    if (dateString.length === 10) {
        // Get current time parts in the specified timezone
        const now = new Date();
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).formatToParts(now);

        const hour = parts.find(p => p.type === 'hour').value;
        const minute = parts.find(p => p.type === 'minute').value;
        const second = parts.find(p => p.type === 'second').value;

        dateString += `T${hour}:${minute}:${second}`;
    }

    // Create date and return ISO string
    const date = new Date(dateString);
    return date.toISOString();
};

/**
 * Format a date for display to the user
 * @param {Date|string} date - Date object or ISO string
 * @param {string} timezone - IANA timezone
 * @param {object} options - Intl.DateTimeFormat options
 */
export const formatDisplayDate = (date, timezone = getBrowserTimezone(), options = {}) => {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';

    const defaultOptions = {
        timeZone: timezone,
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };

    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(d);
};

/**
 * Get the start of day in the specified timezone
 * @param {Date|string} date - Date object or ISO string
 * @param {string} timezone - IANA timezone
 */
export const getStartOfDay = (date, timezone = getBrowserTimezone()) => {
    const d = new Date(date);

    // Get the date parts in the specified timezone
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(d);

    const year = parts.find(p => p.type === 'year').value;
    const month = parts.find(p => p.type === 'month').value;
    const day = parts.find(p => p.type === 'day').value;

    // Create a date string at midnight in that timezone
    const dateStr = `${year}-${month}-${day}T00:00:00`;

    // Parse it as if it's in that timezone
    // This is a workaround since JS doesn't have built-in timezone support
    const localDate = new Date(dateStr);
    const offset = getTimezoneOffset(timezone, localDate);

    return new Date(localDate.getTime() - offset);
};

/**
 * Get the end of day in the specified timezone
 * @param {Date|string} date - Date object or ISO string
 * @param {string} timezone - IANA timezone
 */
export const getEndOfDay = (date, timezone = getBrowserTimezone()) => {
    const d = new Date(date);

    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(d);

    const year = parts.find(p => p.type === 'year').value;
    const month = parts.find(p => p.type === 'month').value;
    const day = parts.find(p => p.type === 'day').value;

    const dateStr = `${year}-${month}-${day}T23:59:59`;
    const localDate = new Date(dateStr);
    const offset = getTimezoneOffset(timezone, localDate);

    return new Date(localDate.getTime() - offset);
};

/**
 * Get current date/time in the specified timezone
 * @param {string} timezone - IANA timezone
 */
export const getCurrentDateInTimezone = (timezone = getBrowserTimezone()) => {
    return new Date();
};

/**
 * Helper: Get timezone offset in milliseconds
 * @param {string} timezone - IANA timezone
 * @param {Date} date - Date to check offset for
 */
const getTimezoneOffset = (timezone, date) => {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    return utcDate.getTime() - tzDate.getTime();
};

/**
 * Common timezone list for dropdown
 */
export const COMMON_TIMEZONES = [
    { value: 'auto', label: 'Auto-detect' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Asia/Kolkata', label: 'India (IST)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
    { value: 'Pacific/Auckland', label: 'Auckland (NZDT/NZST)' }
];
