import { IdData } from '../types';

const getCharValue = (char: string): number => {
    if (char >= '0' && char <= '9') {
        return parseInt(char, 10);
    }
    if (char >= 'A' && char <= 'Z') {
        return char.charCodeAt(0) - 55;
    }
    return 0; // for '<'
};

const calculateCheckDigit = (data: string): string => {
    if (!data || data.replace(/</g, '').length === 0) {
        return '<';
    }
    const weights = [7, 3, 1];
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        sum += getCharValue(data[i]) * weights[i % 3];
    }
    return String(sum % 10);
};

const formatDate = (date: string): string => {
    return date.replace(/-/g, '').substring(2);
};

// For document numbers and personal numbers. Strips non-alphanumeric chars.
const formatAlphaNumeric = (data: string, length: number): string => {
    return data.toUpperCase().replace(/[^A-Z0-9]/g, '').padEnd(length, '<').substring(0, length);
};

// For country codes.
const formatCode = (data: string, length: number): string => {
    return data.toUpperCase().replace(/[^A-Z0-9]/g, '<').padEnd(length, '<').substring(0, length);
};

// For names. Replaces all non-alphabetic separators with a single '<'.
const formatName = (lastName: string, firstName: string, length: number): string => {
    const clean = (name: string) => name.toUpperCase().split(/[^A-Z]+/).filter(Boolean).join('<');
    const formattedName = `${clean(lastName)}<<${clean(firstName)}`;
    return formattedName.padEnd(length, '<').substring(0, length);
};

// TD1 Format (3 lines of 30 chars) - ICAO 9303 Part 5
export const generateTd1 = (data: IdData): string[] => {
    // Line 1
    const docNum = formatAlphaNumeric(data.documentNumber, 9);
    const docNumCheck = calculateCheckDigit(docNum);
    
    const optionalData1 = formatAlphaNumeric(data.personalNumber, 15);

    const line1 = [
        'I<', // Document code for ID card
        formatCode(data.issuingCountry, 3),
        docNum,
        docNumCheck,
        optionalData1,
    ].join('');

    // Line 2
    const dob = formatDate(data.dateOfBirth);
    const dobCheck = calculateCheckDigit(dob);
    
    const expiry = formatDate(data.expiryDate);
    const expiryCheck = calculateCheckDigit(expiry);
    
    const optionalData2 = formatAlphaNumeric('', 11);

    const compositeForOverallCheck =
        docNum + docNumCheck +
        optionalData1 +
        dob + dobCheck +
        expiry + expiryCheck +
        optionalData2;
        
    const overallCheck = calculateCheckDigit(compositeForOverallCheck.replace(/<+$/, '')); // Trailing '<' should not be included

    const line2 = [
        dob,
        dobCheck,
        data.gender,
        expiry,
        expiryCheck,
        formatCode(data.nationality, 3),
        optionalData2,
        overallCheck
    ].join('');

    // Line 3
    const line3 = formatName(data.lastName, data.firstName, 30);

    return [line1.substring(0, 30), line2.substring(0, 30), line3];
};


// TD3 Format (2 lines of 44 chars) - ICAO 9303 Part 4
export const generateTd3 = (data: IdData): string[] => {
    const line1 = `P<${formatCode(data.issuingCountry, 3)}${formatName(data.lastName, data.firstName, 39)}`;

    const docNum = formatAlphaNumeric(data.documentNumber, 9);
    const docNumCheck = calculateCheckDigit(docNum);

    const dob = formatDate(data.dateOfBirth);
    const dobCheck = calculateCheckDigit(dob);

    const expiry = formatDate(data.expiryDate);
    const expiryCheck = calculateCheckDigit(expiry);

    const personalNum = formatAlphaNumeric(data.personalNumber, 14);
    const personalNumCheck = calculateCheckDigit(personalNum);

    const compositeData = docNum + docNumCheck + dob + dobCheck + expiry + expiryCheck + personalNum + personalNumCheck;
    const overallCheck = calculateCheckDigit(compositeData);

    const line2 = [
        docNum,
        docNumCheck,
        formatCode(data.nationality, 3),
        dob,
        dobCheck,
        data.gender,
        expiry,
        expiryCheck,
        personalNum,
        personalNumCheck,
        overallCheck
    ].join('');

    return [line1.substring(0, 44), line2.substring(0, 44)];
};
