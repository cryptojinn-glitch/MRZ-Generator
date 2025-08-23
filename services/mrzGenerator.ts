// services/icaoMrz.ts  (drop-in replacement)
import { IdData } from '../types';
import { formatAlphaNumeric, calculateCheckDigit, formatDate, formatName, formatCode } from './mrzUtils';

// ---------- TD1 (30 × 3) ICAO 9303 Part 5 ----------
export const generateTd1 = (data: IdData): string[] => {
  // Line 1
  const docNum = formatAlphaNumeric(data.documentNumber, 9);
  const docNumCheck = calculateCheckDigit(docNum);

  const optionalData1 = data.includePersonalNumberInMrz
    ? formatAlphaNumeric(data.personalNumber, 15)
    : '<'.repeat(15);

  const line1 = [
    'I<',                               // document code
    formatCode(data.issuingCountry, 3),
    docNum,
    docNumCheck,
    optionalData1,
  ].join('').slice(0, 30);

  // Line 2
  const dob = formatDate(data.dateOfBirth);
  const dobCheck = calculateCheckDigit(dob);

  const expiry = formatDate(data.expiryDate);
  const expiryCheck = calculateCheckDigit(expiry);

  const optionalData2 = '<'.repeat(11);

  // ICAO TD1 composite: includes sub-field check digits
  const composite =
    docNum + docNumCheck + optionalData1 +
    dob + dobCheck +
    expiry + expiryCheck +
    optionalData2;
  const overallCheck = calculateCheckDigit(composite);

  const line2 = [
    dob,
    dobCheck,
    data.gender,
    expiry,
    expiryCheck,
    formatCode(data.nationality, 3),
    optionalData2,
    overallCheck,
  ].join('').slice(0, 30);

  // Line 3
  const line3 = formatName(data.lastName, data.firstName, 30);

  return [line1, line2, line3];
};

// ---------- TD3 (44 × 2) ICAO 9303 Part 4 ----------
export const generateTd3 = (data: IdData): string[] => {
  // Line 1
  const line1 = `P<${formatCode(data.issuingCountry, 3)}${formatName(data.lastName, data.firstName, 39)}`.slice(0, 44);

  // Line 2 - Individual Fields & Check Digits
  const docNum = formatAlphaNumeric(data.documentNumber, 9);
  const docNumCheck = calculateCheckDigit(docNum);

  const dob = formatDate(data.dateOfBirth);
  const dobCheck = calculateCheckDigit(dob);

  const expiry = formatDate(data.expiryDate);
  const expiryCheck = calculateCheckDigit(expiry);

  const personalNum = data.includePersonalNumberInMrz && data.personalNumber
    ? formatAlphaNumeric(data.personalNumber, 14)
    : '<'.repeat(14);
  const personalNumCheck = calculateCheckDigit(personalNum);

  // ICAO TD3 composite: includes sub-field check digits
  const composite = docNum + docNumCheck + dob + dobCheck + expiry + expiryCheck + personalNum + personalNumCheck;
  const overallCheck = calculateCheckDigit(composite);

  // Assemble the final 44-character line
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
    personalNumCheck, // Position 43 (0-indexed 42)
    overallCheck,     // Position 44 (0-indexed 43)
  ].join('').slice(0, 44);

  return [line1, line2];
};
