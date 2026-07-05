import CryptoJS from 'crypto-js';
import { supabase } from './supabaseClient';

/**
 * Fetches the latest treatment log signature for a specific animal.
 * Returns a baseline 'genesis' string if no records exist yet.
 */
export async function getLatestBlockHash(animalId) {
  const { data, error } = await supabase
    .from('treatments')
    .select('block_hash')
    .eq('animal_id', animalId)
    .order('administered_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error fetching trailing block hash:", error);
    return "0000000000000000000000000000000000000000000000000000000000000000";
  }

  return data && data.length > 0 ? data[0].block_hash : "0000000000000000000000000000000000000000000000000000000000000000";
}

/**
 * Generates a SHA-256 hash string by combining the log inputs with the previous signature.
 */
export function calculateBlockHash(animalId, drugName, dosage, prevHash) {
  const dataString = `${animalId}-${drugName}-${dosage}-${prevHash}`;
  return CryptoJS.SHA256(dataString).toString(CryptoJS.enc.Hex);
}