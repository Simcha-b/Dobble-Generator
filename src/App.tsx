import { useMemo, useState } from 'react'
import { createDobbleDeck, VALID_SYMBOL_COUNTS } from './dobble'
import { calculateCardLayouts } from './card-layout'
import { downloadPdf } from './pdf'
import { ImageUpload } from './ui/ImageUpload'
import { CardOptions } from './ui/CardOptions'
import { DeckPreview } from './ui/DeckPreview'
import { ConfirmedImages } from './ui/ConfirmedImages'
import type { UploadedImage } from './types'

const MAX_IMAGES = 57

function App() {
  const [pendingImages, setPendingImages] = useState<UploadedImage[]>([])
  const [confirmedImages, setConfirmedImages] = useState<UploadedImage[]>([])
  const [selectedConfirmed, setSelectedConfirmed] = useState<string | null>(null)
  const [editingConfirmedId, setEditingConfirmedId] = useState<string | null>(null)
  const [cardSize, setCardSize] = useState(80)
  const [symbolsPerCard, setSymbolsPerCard] = useState(8)
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [showBorder, setShowBorder] = useState(true)
  const [centerTitle, setCenterTitle] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deck, setDeck] = useState<number[][] | null>(null)

  const imageCount = confirmedImages.length
  const canGenerate = imageCount >= symbolsPerCard

  const cardLayouts = useMemo(() => {
    if (!deck) return []
    return calculateCardLayouts(deck, confirmedImages, { cardSize, symbolsPerCard, backgroundColor, showBorder, centerTitle })
  }, [deck, confirmedImages, cardSize, symbolsPerCard, backgroundColor, showBorder, centerTitle])

  const sampleCardLayout = useMemo(() => {
    if (confirmedImages.length < symbolsPerCard) return null
    const sampleCard = Array.from({ length: symbolsPerCard }, (_, index) => index)
    return calculateCardLayouts([sampleCard], confirmedImages, { cardSize, symbolsPerCard, backgroundColor, showBorder, centerTitle })[0]
  }, [confirmedImages, symbolsPerCard, cardSize, backgroundColor, showBorder, centerTitle])

  const handleCreateDeck = async () => {
    setError(null)
    if (imageCount < symbolsPerCard) {
      setError(`יש לבחור לפחות ${symbolsPerCard} תמונות מאושרות כדי ליצור קלפים.`)
      return
    }
    try {
      setIsGenerating(true)
      const cards = createDobbleDeck(imageCount, symbolsPerCard)
      setDeck(cards)
    } catch (err) {
      setError('שגיאה ביצירת הקלפים. נסה שוב עם קבוצה שונה של תמונות.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!deck) return
    setError(null)
    setIsGenerating(true)
    try {
      await downloadPdf(deck, confirmedImages, { cardSize, symbolsPerCard, backgroundColor, showBorder, centerTitle })
    } catch (err) {
      setError('שגיאה ביצירת ה-PDF. נסה שוב.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEditConfirmedImage = (id: string) => {
    const imageToEdit = confirmedImages.find((image) => image.id === id)
    if (!imageToEdit) return

    setEditingConfirmedId(id)
    setPendingImages([imageToEdit])
    setConfirmedImages(confirmedImages.filter((image) => image.id !== id))
    setSelectedConfirmed(null)
    setDeck(null)
  }

  const handleConfirmUpload = () => {
    setError(null)
    if (pendingImages.length === 0) {
      setError('אין תמונות לאישור. העלה תמונות תחילה.')
      return
    }

    const nextConfirmed = [...confirmedImages, ...pendingImages]
    setConfirmedImages(nextConfirmed)
    setSelectedConfirmed(pendingImages[0]?.id ?? selectedConfirmed ?? nextConfirmed[0]?.id ?? null)
    setPendingImages([])
    setEditingConfirmedId(null)
    setDeck(null)
  }

  return (
    <div className="app rtl">
      <header>
        <h1>יצרן Dobble מותאם אישית</h1>
        <p>העלה תמונות, בחר עיצוב, וצור קלפי משחק מוכנים להדפסה.</p>
      </header>

      <main>
        <ImageUpload
          images={pendingImages}
          maxImages={MAX_IMAGES}
          existingCount={confirmedImages.length}
          onChange={setPendingImages}
          onError={setError}
        />

        <div className="actions">
          <button type="button" disabled={pendingImages.length === 0} onClick={handleConfirmUpload}>
            אשר תמונות
          </button>
        </div>

        <ConfirmedImages
          images={confirmedImages}
          selectedId={selectedConfirmed}
          onSelect={setSelectedConfirmed}
          onEdit={handleEditConfirmedImage}
        />

        <CardOptions
          cardSize={cardSize}
          symbolsPerCard={symbolsPerCard}
          symbolOptions={[3, 4, 5, 6, 8]}
          backgroundColor={backgroundColor}
          showBorder={showBorder}
          centerTitle={centerTitle}
          onChange={{ setCardSize, setSymbolsPerCard, setBackgroundColor, setShowBorder, setCenterTitle }}
        />

        {sampleCardLayout && !deck && (
          <DeckPreview title="תצוגה מקדימה של קלף אחד" layouts={[sampleCardLayout]} />
        )}

        <div className="actions">
          <button disabled={!canGenerate || isGenerating} onClick={handleCreateDeck}>
            צור משחק
          </button>
          <button disabled={!deck || isGenerating} onClick={handleDownloadPdf}>
            הורד PDF
          </button>
        </div>

        {isGenerating && <div className="status">יוצר... בבקשה המתן.</div>}
        {error && <div className="error">{error}</div>}

        <DeckPreview layouts={cardLayouts} />
      </main>
    </div>
  )
}

export default App
