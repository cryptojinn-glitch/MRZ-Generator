import { DocumentType } from '../types';

// Note: The formats generated here are for illustrative purposes to mimic real-world ID numbers.
// They are not guaranteed to be officially valid, but are structured to be plausible and MRZ-compliant.
// The MRZ generator will correctly strip hyphens and spaces.

const randNum = (n: number): string => {
    let s = '';
    for (let i = 0; i < n; i++) {
        s += Math.floor(Math.random() * 10);
    }
    return s;
};

const randAlpha = (n: number): string => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let s = '';
    for (let i = 0; i < n; i++) {
        s += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return s;
};

export const generatePersonalNumber = (countryCode: string, docType: DocumentType): string => {
    // For TD3 (Passports), personal number field is up to 14 chars, often numeric or unused.
    if (docType === DocumentType.PASSPORT) {
        return randNum(14);
    }

    // For TD1 (ID Cards), we can use more specific formats. Max length is 15 chars in MRZ.
    switch (countryCode) {
        case 'USA': // United States (example Social Security Number format)
            return `${randNum(3)}-${randNum(2)}-${randNum(4)}`;
        case 'DEU': // Germany (example for Personalausweis Seriennummer)
            return `${randAlpha(1)}${randNum(4)}-${randNum(4)}`;
        case 'CAN': // Canada (example format, e.g., for PR Card)
            return `${randAlpha(2)}${randNum(3)}-${randNum(4)}`;
        case 'GBR': // United Kingdom (example National Insurance Number format)
            return `${randAlpha(2)} ${randNum(6)} ${randAlpha(1)}`;
        case 'FRA': // France (example for CNI)
            return `${randNum(6)}-${randNum(6)}`;
        case 'AUS': // Australia (example format)
            return `${randNum(9)}${randAlpha(1)}`;
        case 'PAK': // Pakistan (CNIC format)
            return `${randNum(5)}-${randNum(7)}-${randNum(1)}`;
        case 'ARE': // UAE (Emirates ID format)
            return `${randNum(3)}-${randNum(4)}-${randNum(7)}-${randNum(1)}`;
        default:
            // Generic fallback for other countries' ID cards, up to 15 chars.
            return `${randAlpha(2)}${randNum(5)}-${randNum(5)}`;
    }
};
