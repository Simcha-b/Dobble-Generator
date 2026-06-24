export type DobbleDeck = number[][]

export const VALID_SYMBOL_COUNTS = [3, 4, 5, 6, 8] as const
export type SymbolCount = typeof VALID_SYMBOL_COUNTS[number]

const VALID_ORDERS = [2, 3, 4, 5, 7] as const

function isValidOrder(q: number): q is typeof VALID_ORDERS[number] {
  return VALID_ORDERS.includes(q as typeof VALID_ORDERS[number])
}

function createFullDobbleDeck(q: number): DobbleDeck {
  const n = q + 1
  const m = q
  const deck: DobbleDeck = []

  for (let i = 0; i < n; i++) {
    const card: number[] = [i]
    for (let j = 0; j < m; j++) {
      card.push(n + i * m + j)
    }
    deck.push(card)
  }

  for (let a = 0; a < m; a++) {
    for (let b = 0; b < m; b++) {
      const card: number[] = [n + m * a + b]
      for (let k = 0; k < m; k++) {
        card.push(n + m * k + ((a * k + b) % m))
      }
      deck.push(card)
    }
  }

  return deck
}

export function getMaxSymbolsForCard(symbolsPerCard: SymbolCount) {
  const q = symbolsPerCard - 1
  return q * q + q + 1
}

export function createDobbleDeck(imageCount: number, symbolsPerCard: SymbolCount): DobbleDeck {
  const q = symbolsPerCard - 1

  if (!isValidOrder(q)) {
    throw new Error('Invalid symbol count for Dobble generation')
  }
  if (imageCount < symbolsPerCard) {
    throw new Error(`יש להעלות לפחות ${symbolsPerCard} תמונות עבור ${symbolsPerCard} סמלים בכל קלף.`)
  }
  if (imageCount > getMaxSymbolsForCard(symbolsPerCard)) {
    throw new Error(`לא ניתן להשתמש ביותר מ-${getMaxSymbolsForCard(symbolsPerCard)} תמונות עבור ${symbolsPerCard} סמלים בכל קלף.`)
  }

  const deck = createFullDobbleDeck(q)
  const filteredDeck = deck
    .map((card) => card.filter((symbol) => symbol < imageCount))
    .filter((card) => card.length === symbolsPerCard)

  if (!isValidDobbleDeck(filteredDeck)) {
    throw new Error('Generated deck is invalid')
  }
  return filteredDeck
}

export function isValidDobbleDeck(deck: DobbleDeck): boolean {
  if (deck.length === 0) return false
  const expectedLength = deck[0].length
  for (let i = 0; i < deck.length; i++) {
    if (deck[i].length !== expectedLength) return false
    const set = new Set(deck[i])
    if (set.size !== deck[i].length) return false
  }
  for (let i = 0; i < deck.length; i++) {
    for (let j = i + 1; j < deck.length; j++) {
      const intersection = deck[i].filter((symbol) => deck[j].includes(symbol))
      if (intersection.length !== 1) return false
    }
  }
  return true
}
