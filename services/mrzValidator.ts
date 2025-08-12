import { MrzAnalysisResult, MrzFieldAnalysis } from '../types';
import { calculateCheckDigit } from './mrzUtils';

const createField = (fieldName: string, rawValue: string, position: string, dataToVerify?: string, isCheckDigitOnlyField = false): MrzFieldAnalysis => {
    const field: MrzFieldAnalysis = {
        fieldName,
        rawValue,
        position,
        isValid: true,
        hasCheckDigit: false,
    };

    if (dataToVerify !== undefined) {
        const data = isCheckDigitOnlyField ? dataToVerify.slice(0, -1) : dataToVerify.slice(0, -1);
        const actualCheckDigit = dataToVerify.slice(-1);
        
        // The composite data for the overall check digit uses the *corrected* individual check digits.
        const expectedCheckDigit = isCheckDigitOnlyField ? actualCheckDigit : calculateCheckDigit(data);

        field.hasCheckDigit = true;
        field.actualCheckDigit = dataToVerify.slice(-1); // The original check digit from input
        field.expectedCheckDigit = expectedCheckDigit;
        field.isValid = field.actualCheckDigit === field.expectedCheckDigit;

        if (!field.isValid) {
            field.error = `Invalid check digit. Expected ${expectedCheckDigit}, found ${field.actualCheckDigit}.`;
        }
    }
    return field;
};

const analyzeTd3 = (lines: string[]): MrzAnalysisResult => {
    const [line1, line2] = lines;
    const fields: MrzFieldAnalysis[] = [];
    
    // Line 1 Analysis
    fields.push(createField("Document Code", line1.substring(0, 2), "L1, 1-2"));
    fields.push(createField("Issuing Country", line1.substring(2, 5), "L1, 3-5"));
    fields.push(createField("Name", line1.substring(5, 44), "L1, 6-44"));
    
    // Line 2 Parsing
    const docNumRaw = line2.substring(0, 10);
    const docNumVal = docNumRaw.substring(0, 9);
    const nationality = line2.substring(10, 13);
    const dobRaw = line2.substring(13, 20);
    const dobVal = dobRaw.substring(0, 6);
    const gender = line2.substring(20, 21);
    const expiryRaw = line2.substring(21, 28);
    const expiryVal = expiryRaw.substring(0, 6);
    const personalNumRaw = line2.substring(28, 43);
    const personalNumVal = personalNumRaw.substring(0, 14);
    const overallCD = line2.substring(43, 44);

    // Line 2 Analysis & Correction
    const docNumAnalysis = createField("Document Number", docNumVal, "L2, 1-9", docNumRaw);
    fields.push(docNumAnalysis);
    
    fields.push(createField("Nationality", nationality, "L2, 11-13"));

    const dobAnalysis = createField("Date of Birth", dobVal, "L2, 14-19", dobRaw);
    fields.push(dobAnalysis);

    fields.push(createField("Gender", gender, "L2, 21"));

    const expiryAnalysis = createField("Expiry Date", expiryVal, "L2, 22-27", expiryRaw);
    fields.push(expiryAnalysis);

    const personalNumAnalysis = createField("Personal Number / Optional", personalNumVal, "L2, 29-42", personalNumRaw);
    fields.push(personalNumAnalysis);

    // Composite Check Digit Calculation
    const compositeData = 
        docNumVal + docNumAnalysis.expectedCheckDigit + 
        dobVal + dobAnalysis.expectedCheckDigit + 
        expiryVal + expiryAnalysis.expectedCheckDigit + 
        personalNumVal + personalNumAnalysis.expectedCheckDigit;
        
    const expectedOverallCD = calculateCheckDigit(compositeData);
    const overallAnalysis = createField("Overall Check Digit", "N/A", "L2, 44", compositeData + overallCD, true);
    overallAnalysis.actualCheckDigit = overallCD;
    overallAnalysis.isValid = overallCD === expectedOverallCD;
    fields.push(overallAnalysis);
    
    const correctedLine2 = 
        docNumVal + docNumAnalysis.expectedCheckDigit +
        nationality +
        dobVal + dobAnalysis.expectedCheckDigit +
        gender +
        expiryVal + expiryAnalysis.expectedCheckDigit +
        personalNumVal + personalNumAnalysis.expectedCheckDigit +
        expectedOverallCD;

    return {
        originalMrz: [line1, line2],
        correctedMrz: [line1, correctedLine2],
        isFullyValid: fields.every(f => f.isValid),
        documentType: 'TD3',
        fields,
    };
};

const analyzeTd1 = (lines: string[]): MrzAnalysisResult => {
     return {
        originalMrz: lines,
        correctedMrz: lines,
        isFullyValid: false,
        documentType: 'TD1',
        fields: [],
        error: "TD1 validation is not fully implemented in this version. Please check back later."
    };
}


export const analyzeMrz = (mrzText: string): MrzAnalysisResult => {
    const lines = mrzText.trim().toUpperCase().split('\n').filter(line => line.trim().length > 0);

    if (lines.length === 2 && lines.every(l => l.length === 44)) {
        return analyzeTd3(lines);
    }
    if (lines.length === 3 && lines.every(l => l.length === 30)) {
        return analyzeTd1(lines);
    }

    return {
        originalMrz: lines,
        correctedMrz: lines,
        isFullyValid: false,
        documentType: 'Unknown',
        fields: [],
        error: `Invalid MRZ format. Expected 2 lines of 44 characters (TD3) or 3 lines of 30 characters (TD1). Found ${lines.length} line(s) with lengths: ${lines.map(l => l.length).join(', ')}.`,
    };
};
