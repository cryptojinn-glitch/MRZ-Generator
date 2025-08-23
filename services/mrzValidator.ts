import { MrzAnalysisResult, MrzFieldAnalysis } from '../types';
import { calculateCheckDigit } from './mrzUtils';
import { auditTd3 } from './mrzAudit';

/**
 * A generic analysis function for a single MRZ field without a check digit.
 */
const analyzeSimpleField = (
    fieldName: string,
    position: string,
    rawValue: string
): MrzFieldAnalysis => ({
    fieldName,
    rawValue,
    position,
    isValid: true,
    hasCheckDigit: false,
});


/**
 * Analyzes a 2-line, 44-character TD3 (passport) MRZ using the auditTd3 utility.
 * @param lines The two lines of the MRZ.
 * @returns A detailed analysis result.
 */
const analyzeTd3 = (lines: string[]): MrzAnalysisResult => {
    const [line1, line2] = lines;

    try {
        const audit = auditTd3(line2);

        const fields: MrzFieldAnalysis[] = [
            // Line 1 fields are simple
            analyzeSimpleField("Document Code", "L1, 1-2", line1.substring(0, 2)),
            analyzeSimpleField("Issuing Country", "L1, 3-5", line1.substring(2, 5)),
            analyzeSimpleField("Name", "L1, 6-44", line1.substring(5, 44)),

            // Line 2 fields from audit
            {
                fieldName: "Document Number",
                position: `L2, 1-${audit.docNum.pos + 1}`,
                rawValue: audit.docNum.raw,
                isValid: audit.docNum.actualCD === audit.docNum.expectedCD,
                hasCheckDigit: true,
                actualCheckDigit: audit.docNum.actualCD,
                expectedCheckDigit: audit.docNum.expectedCD,
            },
            analyzeSimpleField("Nationality", "L2, 11-13", line2.substring(10, 13)),
            {
                fieldName: "Date of Birth",
                position: `L2, 14-${audit.dob.pos + 1}`,
                rawValue: audit.dob.raw,
                isValid: audit.dob.actualCD === audit.dob.expectedCD,
                hasCheckDigit: true,
                actualCheckDigit: audit.dob.actualCD,
                expectedCheckDigit: audit.dob.expectedCD,
            },
            analyzeSimpleField("Gender", "L2, 21", line2.substring(20, 21)),
            {
                fieldName: "Expiry Date",
                position: `L2, 22-${audit.expiry.pos + 1}`,
                rawValue: audit.expiry.raw,
                isValid: audit.expiry.actualCD === audit.expiry.expectedCD,
                hasCheckDigit: true,
                actualCheckDigit: audit.expiry.actualCD,
                expectedCheckDigit: audit.expiry.expectedCD,
            },
            {
                fieldName: "Personal Number / Optional",
                position: `L2, 29-${audit.personalNum.pos + 1}`,
                rawValue: audit.personalNum.raw,
                isValid: audit.personalNum.actualCD === audit.personalNum.expectedCD,
                hasCheckDigit: true,
                actualCheckDigit: audit.personalNum.actualCD,
                expectedCheckDigit: audit.personalNum.expectedCD,
            },
            {
                fieldName: "Overall Check Digit",
                position: `L2, ${audit.composite.pos + 1}`,
                rawValue: audit.composite.actualCD,
                isValid: audit.composite.actualCD === audit.composite.expectedCD,
                hasCheckDigit: true,
                actualCheckDigit: audit.composite.actualCD,
                expectedCheckDigit: audit.composite.expectedCD,
            }
        ];

        const isFullyValid = fields.every(f => f.isValid);

        const correctedLine2 = [
            audit.docNum.raw,
            audit.docNum.expectedCD,
            line2.substring(10, 13), // nationality
            audit.dob.raw,
            audit.dob.expectedCD,
            line2.substring(20, 21), // gender
            audit.expiry.raw,
            audit.expiry.expectedCD,
            audit.personalNum.raw,
            audit.personalNum.expectedCD,
            audit.composite.expectedCD,
        ].join('');

        return {
            originalMrz: lines,
            correctedMrz: [line1, correctedLine2],
            isFullyValid,
            documentType: 'TD3',
            fields,
        };

    } catch (e: any) {
        return {
            originalMrz: lines,
            correctedMrz: lines,
            isFullyValid: false,
            documentType: 'TD3',
            fields: [],
            error: e.message || 'Error auditing TD3 line. Ensure it is exactly 44 characters long.',
        };
    }
};

/**
 * A generic analysis function for a single MRZ field.
 * It checks the validity of a field's check digit if one is provided.
 * @param fieldName The name of the field (e.g., "Document Number").
 * @param position A string indicating the location (e.g., "L2, 1-10").
 * @param rawValue The full, unparsed value of the field from the MRZ.
 * @param valueForCheck The portion of the rawValue that the check digit is calculated on.
 * @param actualCheckDigit The check digit character from the MRZ.
 * @returns An MrzFieldAnalysis object with validity information.
 */
const analyzeField = (
    fieldName: string,
    position: string,
    rawValue: string,
    valueForCheck?: string,
    actualCheckDigit?: string,
): MrzFieldAnalysis => {
    const field: MrzFieldAnalysis = {
        fieldName,
        rawValue,
        position,
        isValid: true,
        hasCheckDigit: false,
    };

    if (valueForCheck !== undefined && actualCheckDigit !== undefined) {
        const expectedCheckDigit = calculateCheckDigit(valueForCheck);
        field.hasCheckDigit = true;
        field.actualCheckDigit = actualCheckDigit;
        field.expectedCheckDigit = expectedCheckDigit;
        field.isValid = expectedCheckDigit === actualCheckDigit;

        if (!field.isValid) {
            field.error = `Invalid check digit. Expected ${expectedCheckDigit}, found ${actualCheckDigit}.`;
        }
    }
    return field;
};


/**
 * Analyzes a 3-line, 30-character TD1 (ID card) MRZ.
 * @param lines The three lines of the MRZ.
 * @returns A detailed analysis result.
 */
const analyzeTd1 = (lines: string[]): MrzAnalysisResult => {
    const [line1, line2, line3] = lines;
    const fields: MrzFieldAnalysis[] = [];
    
    // --- Field Extraction ---
    const docNumVal = line1.substring(5, 14);
    const docNumCD = line1.substring(14, 15);
    const optional1Val = line1.substring(15, 30);
    const dobVal = line2.substring(0, 6);
    const dobCD = line2.substring(6, 7);
    const expiryVal = line2.substring(8, 14);
    const expiryCD = line2.substring(14, 15);
    const optional2Val = line2.substring(18, 29);
    const overallCD = line2.substring(29, 30);

    // --- Line 1 Analysis ---
    fields.push(analyzeField("Document Code", "L1, 1-2", line1.substring(0, 2)));
    fields.push(analyzeField("Issuing Country", "L1, 3-5", line1.substring(2, 5)));
    const docNumAnalysis = analyzeField("Document Number", "L1, 6-15", line1.substring(5, 15), docNumVal, docNumCD);
    fields.push(docNumAnalysis);
    fields.push(analyzeField("Optional Data 1", "L1, 16-30", optional1Val));
    
    // --- Line 2 Analysis ---
    const dobAnalysis = analyzeField("Date of Birth", "L2, 1-7", line2.substring(0, 7), dobVal, dobCD);
    fields.push(dobAnalysis);
    fields.push(analyzeField("Gender", "L2, 8", line2.substring(7, 8)));
    const expiryAnalysis = analyzeField("Expiry Date", "L2, 9-15", line2.substring(8, 15), expiryVal, expiryCD);
    fields.push(expiryAnalysis);
    fields.push(analyzeField("Nationality", "L2, 16-18", line2.substring(15, 18)));
    fields.push(analyzeField("Optional Data 2", "L2, 19-29", optional2Val));
    
    // --- Composite Check Digit Analysis (Corrected to ICAO spec) ---
    const compositeData =
        docNumVal + docNumAnalysis.expectedCheckDigit + optional1Val +
        dobVal + dobAnalysis.expectedCheckDigit +
        expiryVal + expiryAnalysis.expectedCheckDigit +
        optional2Val;
    
    const overallAnalysis = analyzeField("Overall Check Digit", "L2, 30", overallCD, compositeData, overallCD);
    fields.push(overallAnalysis);
    
    // --- Line 3 Analysis ---
    fields.push(analyzeField("Name", "L3, 1-30", line3));

    // --- Correction and Final Result ---
    const correctedLine1 =
        line1.substring(0, 5) +
        docNumVal + docNumAnalysis.expectedCheckDigit +
        optional1Val;
    const correctedLine2 =
        dobVal + dobAnalysis.expectedCheckDigit +
        line2.substring(7, 8) + // Gender
        expiryVal + expiryAnalysis.expectedCheckDigit +
        line2.substring(15, 18) + // Nationality
        optional2Val +
        overallAnalysis.expectedCheckDigit;
        
    return {
        originalMrz: lines,
        correctedMrz: [correctedLine1, correctedLine2, line3],
        isFullyValid: fields.every(f => f.isValid),
        documentType: 'TD1',
        fields,
    };
};

/**
 * Main entry point for MRZ analysis. Detects format and routes to the correct analyzer.
 * @param mrzText The full MRZ text, with lines separated by newlines.
 * @returns A detailed analysis result.
 */
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
