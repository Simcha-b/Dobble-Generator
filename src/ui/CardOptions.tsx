import type { CardStyleOptions } from '../types'

type Props = CardStyleOptions & {
  symbolOptions: number[]
  onChange: {
    setCardSize: (value: number) => void
    setSymbolsPerCard: (value: number) => void
    setBackgroundColor: (value: string) => void
    setShowBorder: (value: boolean) => void
    setCenterTitle: (value: string) => void
  }
}

export function CardOptions({ cardSize, symbolsPerCard, symbolOptions, backgroundColor, showBorder, centerTitle, onChange }: Props) {
  return (
    <section className="options-section">
      <div className="field">
        <label>גודל קלף</label>
        <select value={cardSize} onChange={(event) => onChange.setCardSize(Number(event.target.value))}>
          <option value={70}>7 ס"מ</option>
          <option value={80}>8 ס"מ</option>
          <option value={90}>9 ס"מ</option>
        </select>
      </div>
      <div className="field">
        <label>תמונות בכל קלף</label>
        <select value={symbolsPerCard} onChange={(event) => onChange.setSymbolsPerCard(Number(event.target.value))}>
          {symbolOptions.map((count) => (
            <option key={count} value={count}>
              {count} תמונות בקלף
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>צבע רקע</label>
        <input type="color" value={backgroundColor} onChange={(event) => onChange.setBackgroundColor(event.target.value)} />
      </div>
      <div className="field checkbox-field">
        <label>
          <input type="checkbox" checked={showBorder} onChange={(event) => onChange.setShowBorder(event.target.checked)} />
          מסגרת
        </label>
      </div>
      <div className="field">
        <label>כותרת מרכזית</label>
        <input type="text" value={centerTitle} onChange={(event) => onChange.setCenterTitle(event.target.value)} />
      </div>
    </section>
  )
}
