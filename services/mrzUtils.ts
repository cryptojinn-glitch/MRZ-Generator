export const getCharValue = (char: string): number => {
    if (!char) return 0;
    if (char >= '0' && char <= '9') {
        return parseInt(char, 10);
    }
    if (char >= 'A' && char <= 'Z') {
        return char.charCodeAt(0) - 55;
    }
    return 0; // for '<'
};

export const calculateCheckDigit = (data: string): string => {
    const weights = [7, 3, 1];
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        sum += getCharValue(data[i]) * weights[i % 3];
    }
    return String(sum % 10);
};

export const formatDate = (date: string): string => {
    if (!date) return '<<<<<<';
    return date.replace(/-/g, '').substring(2);
};

// For document numbers and personal numbers. Strips non-alphanumeric chars.
export const formatAlphaNumeric = (data: string, length: number): string => {
    if (!data) return '<'.repeat(length);
    return data.toUpperCase().replace(/[^A-Z0-9]/g, '').padEnd(length, '<').substring(0, length);
};

// For country codes.
export const formatCode = (data: string, length: number): string => {
     if (!data) return '<'.repeat(length);
    return data.toUpperCase().replace(/[^A-Z0-9<]/g, '<').padEnd(length, '<').substring(0, length);
};

// For names. Replaces all non-alphabetic separators with a single '<'.
export const formatName = (lastName: string, firstName: string, length: number): string => {
    const clean = (name: string) => name ? name.toUpperCase().split(/[^A-Z]+/).filter(Boolean).join('<') : '';
    const formattedName = `${clean(lastName)}<<${clean(firstName)}`;
    return formattedName.padEnd(length, '<').substring(0, length);
};