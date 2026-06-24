import { createDobbleDeck, isValidDobbleDeck } from './dobble'

describe('createDobbleDeck', () => {
  it('creates a valid deck for 57 images', () => {
    const deck = createDobbleDeck(57)
    expect(deck.length).toBeGreaterThan(0)
    expect(isValidDobbleDeck(deck)).toBe(true)
  })

  it('creates a valid deck for 8 images when there are fewer than 57', () => {
    const deck = createDobbleDeck(8)
    expect(deck.length).toBeGreaterThan(0)
    expect(isValidDobbleDeck(deck)).toBe(true)
  })

  it('throws when too few images are provided', () => {
    expect(() => createDobbleDeck(2)).toThrow()
  })

  it('throws when too many images are provided', () => {
    expect(() => createDobbleDeck(58)).toThrow()
  })
})
