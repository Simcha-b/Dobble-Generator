import type { UploadedImage } from '../types'

type Props = {
  images: UploadedImage[]
  selectedId: string | null
  onSelect: (id: string) => void
  onEdit: (id: string) => void
}

export function ConfirmedImages({ images, selectedId, onSelect, onEdit }: Props) {
  return (
    <section className="confirmed-section">
      <div className="confirmed-header">
        <h2>תמונות מאושרות</h2>
        <span>{images.length} תמונות</span>
      </div>

      {images.length === 0 ? (
        <div className="confirmed-empty">אין תמונות מאושרות כרגע. אשר תמונות מהתצוגה שלמעלה.</div>
      ) : (
        <div className="confirmed-list">
          {images.map((image) => (
            <div key={image.id} className={image.id === selectedId ? 'confirmed-item selected' : 'confirmed-item'}>
              <button type="button" className="confirmed-thumb-button" onClick={() => onSelect(image.id)}>
                <div className="confirmed-thumb">
                  <img
                    key={image.id}
                    src={image.src}
                    alt={image.name}
                    style={{
                      transform: `scale(${image.crop.scale}) translate(${image.crop.offsetX * 100}%, ${image.crop.offsetY * 100}%)`,
                    }}
                  />
                </div>
              </button>
              <button type="button" className="confirmed-edit" onClick={() => onEdit(image.id)}>
                ערוך
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
