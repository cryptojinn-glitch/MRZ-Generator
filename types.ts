export enum DocumentType {
    PASSPORT = 'TD3',
    ID_CARD = 'TD1',
}

export enum Gender {
    MALE = 'M',
    FEMALE = 'F',
    OTHER = '<'
}

export interface IdData {
    documentType: DocumentType;
    issuingCountry: string; // 3-letter code
    documentNumber: string;
    firstName: string;
    lastName: string;
    nationality: string; // 3-letter code
    dateOfBirth: string; // YYYY-MM-DD
    gender: Gender;
    expiryDate: string; // YYYY-MM-DD
    personalNumber: string;
    includePersonalNumberInMrz?: boolean;
}

// Types for MRZ Validator
export interface MrzFieldAnalysis {
    fieldName: string;
    rawValue: string;
    isValid: boolean;
    hasCheckDigit: boolean;
    expectedCheckDigit?: string;
    actualCheckDigit?: string;
    position: string; // e.g. "L2, 1-9"
    error?: string;
}

export interface MrzAnalysisResult {
    originalMrz: string[];
    correctedMrz: string[];
    isFullyValid: boolean;
    documentType: 'TD1' | 'TD3' | 'Unknown';
    fields: MrzFieldAnalysis[];
    error?: string; // For overall parsing errors
}
