// services/mrzAudit.ts
export const getCharValue = (c: string): number =>
  c === '<' ? 0
  : c >= '0' && c <= '9' ? +c
  : c.charCodeAt(0) - 55; // A=10 … Z=35

export const calcCD = (s: string): string => {
  const w = [7, 3, 1];
  let sum = 0;
  for (let i = 0; i < s.length; i++) sum += getCharValue(s[i]) * w[i % 3];
  return String(sum % 10);
};

interface AuditResult {
  docNum:      { raw: string; pos: number; actualCD: string; expectedCD: string };
  dob:         { raw: string; pos: number; actualCD: string; expectedCD: string };
  expiry:      { raw: string; pos: number; actualCD: string; expectedCD: string };
  personalNum: { raw: string; pos: number; actualCD: string; expectedCD: string };
  composite:   { raw: string; pos: number; actualCD: string; expectedCD: string };
}

/**
 * Audit a TD-3 line 2 string.
 * line2 must be exactly 44 chars (0-43 inclusive).
 */
export function auditTd3(line2: string): AuditResult {
  if (line2.length !== 44) throw new Error('TD-3 line 2 must be 44 chars');

  // 1. Document number check digit (pos 9)
  const docNumRaw   = line2.substring(0, 9);
  const docNumAct   = line2[9];
  const docNumExp   = calcCD(docNumRaw);

  // 2. DOB check digit (pos 19)
  const dobRaw      = line2.substring(13, 19);
  const dobAct      = line2[19];
  const dobExp      = calcCD(dobRaw);

  // 3. Expiry check digit (pos 27)
  const expiryRaw   = line2.substring(21, 27);
  const expiryAct   = line2[27];
  const expiryExp   = calcCD(expiryRaw);

  // 4. Personal number check digit (pos 42)
  const personalNumRaw = line2.substring(28, 42);
  const personalNumAct = line2[42];
  const personalNumExp = calcCD(personalNumRaw);
  
  // 5. Composite check digit (pos 43) is calculated over other fields AND their check digits.
  const compositeForCalc = docNumRaw + docNumExp + dobRaw + dobExp + expiryRaw + expiryExp + personalNumRaw + personalNumExp;
  const compositeAct = line2[43];
  const compositeExp = calcCD(compositeForCalc);

  return {
    docNum:    { raw: docNumRaw, pos: 9, actualCD: docNumAct, expectedCD: docNumExp },
    dob:       { raw: dobRaw,    pos: 19, actualCD: dobAct,    expectedCD: dobExp },
    expiry:    { raw: expiryRaw, pos: 27, actualCD: expiryAct, expectedCD: expiryExp },
    personalNum: { raw: personalNumRaw, pos: 42, actualCD: personalNumAct, expectedCD: personalNumExp },
    composite: { raw: compositeForCalc, pos: 43, actualCD: compositeAct, expectedCD: compositeExp },
  };
}
