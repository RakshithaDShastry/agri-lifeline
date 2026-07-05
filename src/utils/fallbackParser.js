/**
 * Local fallback extraction engine.
 * Parses raw text transcripts using deterministic regular expressions.
 */
export function parseTranscriptWithRegex(text) {
  if (!text) return null;
  
  const cleanText = text.toLowerCase();

  // 1. Extract Batch tags (e.g., "batch 4", "batch b", "batch-a")
  const batchRegex = /batch\s*([a-z0-9]+)/i;
  const batchMatch = text.match(batchRegex);
  const batchTag = batchMatch ? `Batch ${batchMatch[1].toUpperCase()}` : '';

  // 2. Extract Dosage strings (e.g., "5ml", "10 ml", "250mg", "2.5 ml")
  const dosageRegex = /(\d+(\.\d+)?\s*(ml|mg|cc|g))/i;
  const dosageMatch = text.match(dosageRegex);
  const dosage = dosageMatch ? dosageMatch[1].replace(/\s+/g, '') : '';

  // 3. Match against known farm drug profiles to assign structured withdrawal profiles
  const drugProfiles = [
    { names: ['amoxicillin', 'amox'], fallbackMeatWithdrawal: 7, cleanName: 'Amoxicillin' },
    { names: ['penicillin', 'pen'], fallbackMeatWithdrawal: 3, cleanName: 'Penicillin' },
    { names: ['tylosin', 'tylo'], fallbackMeatWithdrawal: 14, cleanName: 'Tylosin' }
  ];

  let detectedDrug = '';
  let withdrawalDays = 0;

  for (const profile of drugProfiles) {
    const matched = profile.names.some(name => cleanText.includes(name));
    if (matched) {
      detectedDrug = profile.cleanName;
      withdrawalDays = profile.fallbackMeatWithdrawal;
      break;
    }
  }

  // If a drug was spoken but isn't part of our baseline catalog, capture the word following "of" or "given"
  if (!detectedDrug) {
    const genericDrugRegex = /(?:given|of|administered)\s+([a-z]{3,})/i;
    const genericMatch = text.match(genericDrugRegex);
    if (genericMatch && !['ml', 'mg', 'cc'].includes(genericMatch[1].toLowerCase())) {
      detectedDrug = genericMatch[1].charAt(0).toUpperCase() + genericMatch[1].slice(1);
    }
  }

  return {
    batchTag,
    drugName: detectedDrug || 'Unknown Drug',
    dosage: dosage || 'Not Specified',
    withdrawalDays: withdrawalDays || 0
  };
}