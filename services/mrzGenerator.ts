import { IdData } from '../types';
import { formatAlphaNumeric, calculateCheckDigit, formatDate, formatName, formatCode } from './mrzUtils';

// TD1 Format (3 lines of 30 chars) - ICAO 9303 Part 5
export const generateTd1 = (data: IdData): string[] => {
    // Line 1
    const docNum = formatAlphaNumeric(data.documentNumber, 9);
    const docNumCheck = calculateCheckDigit(docNum);
    
    const optionalData1 = data.includePersonalNumberInMrz 
        ? formatAlphaNumeric(data.personalNumber, 15)
        : '<'.repeat(15);

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
    
    const optionalData2 = '<'.repeat(11);

    const compositeForOverallCheck =
        docNum + docNumCheck +
        optionalData1 +
        dob + dobCheck +
        expiry + expiryCheck +
        optionalData2;
        
    const overallCheck = calculateCheckDigit(compositeForOverallCheck);

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

    let personalNum = '<'.repeat(14);
    if (data.includePersonalNumberInMrz && data.personalNumber) {
        personalNum = formatAlphaNumeric(data.personalNumber, 14);
    }
    // The optional data field is always present in a TD3 MRZ. If unused, it's all '<'s.
    // Its check digit is always calculated (resulting in '0' for an all-'<' field).
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