
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
}
