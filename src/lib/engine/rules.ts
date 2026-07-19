import { DECK_SIZE, MAX_COPIES_PER_CARD_IN_DECK } from "./cards";

export type DeckEntry = { cardDefinitionId: string; quantity: number };

export type DeckValidation = { valid: boolean; errors: string[] };

// Structural deck validation shared by the deck builder UI and the API
// route — ownership limits (can't include more copies than owned) are
// checked separately at the API layer since that requires DB access.
export function validateDeckStructure(entries: DeckEntry[]): DeckValidation {
  const errors: string[] = [];
  const total = entries.reduce((sum, e) => sum + e.quantity, 0);

  if (total !== DECK_SIZE) {
    errors.push(`O deck precisa ter exatamente ${DECK_SIZE} cartas (tem ${total}).`);
  }

  for (const entry of entries) {
    if (entry.quantity > MAX_COPIES_PER_CARD_IN_DECK) {
      errors.push(
        `No máximo ${MAX_COPIES_PER_CARD_IN_DECK} cópias por carta (${entry.cardDefinitionId} tem ${entry.quantity}).`
      );
    }
    if (entry.quantity <= 0) {
      errors.push(`Quantidade inválida para ${entry.cardDefinitionId}.`);
    }
  }

  return { valid: errors.length === 0, errors };
}
