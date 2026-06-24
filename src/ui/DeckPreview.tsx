import { getCroppedElementFrame } from '../card-layout'
import type { CardStyleOptions, UploadedImage } from '../types'

type Props = {
  layouts: ReturnType<typeof import('../card-layout').calculateCardLayouts>
  title?: string
}

export function DeckPreview({ layouts, title = 'תצוגת קלפים' }: Props) {
  if (!layouts.length) {
    return <section className="preview-section">אין תצוגת קלפים עדיין.</section>
  }

  return (
    <section className="preview-section">
      <h2>{title}</h2>
      <div className="preview-grid">
        {layouts.map((layout, index) => {
          const scale = 1.8
          const displaySize = layout.cardSize * scale
          return (
            <div key={index} className="card-preview" style={{ width: displaySize, height: displaySize }}>
              <div
                className="card-inner"
                style={{
                  border: layout.showBorder ? '2px solid #333' : 'none',
                  width: displaySize,
                  height: displaySize,
                  position: 'relative',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: layout.backgroundColor,
                }}
              >
                {layout.elements.map((element, idx) => {
                  const frame = getCroppedElementFrame(element)
                  return (
                    <div
                      key={idx}
                      className="card-element"
                      style={{
                        position: 'absolute',
                        left: frame.x * scale,
                        top: frame.y * scale,
                        width: frame.width * scale,
                        height: frame.height * scale,
                        transform: `rotate(${element.rotate}deg)`,
                        transformOrigin: 'center center',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={element.src}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: `${50 + element.crop.offsetX * 50}% ${50 + element.crop.offsetY * 50}%`,
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
