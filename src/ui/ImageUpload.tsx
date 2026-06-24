import { useCallback, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import type { UploadedImage } from '../types'

type Props = {
  images: UploadedImage[]
  maxImages: number
  existingCount?: number
  onChange: (images: UploadedImage[]) => void
  onError: (message: string | null) => void
}

type DragState = {
  id: string
  startX: number
  startY: number
  startOffsetX: number
  startOffsetY: number
}

const DEFAULT_CROP = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
}

export function ImageUpload({ images, maxImages, existingCount = 0, onChange, onError }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [dragState, setDragState] = useState<DragState | null>(null)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      const nextImages: UploadedImage[] = []
      const existing = [...images]

      for (const file of Array.from(files)) {
        if (existing.length + nextImages.length >= maxImages) {
          onError(`ניתן להעלות עד ${maxImages} תמונות.`)
          break
        }
        if (!file.type.startsWith('image/')) {
          onError('פורמט קובץ לא נתמך. יש להעלות PNG, JPG או SVG.')
          continue
        }
        const src = URL.createObjectURL(file)
        nextImages.push({ id: `${Date.now()}-${file.name}`, name: file.name, src, crop: { ...DEFAULT_CROP } })
      }

      onChange([...existing, ...nextImages])
    },
    [images, maxImages, onChange, onError],
  )

  const updateImage = (id: string, next: Partial<UploadedImage>) => {
    onChange(images.map((image) => (image.id === id ? { ...image, ...next } : image)))
  }

  const setImageCrop = (id: string, crop: { scale?: number; offsetX?: number; offsetY?: number }) => {
    onChange(
      images.map((image) =>
        image.id === id
          ? {
              ...image,
              crop: {
                scale: crop.scale ?? image.crop.scale,
                offsetX: crop.offsetX ?? image.crop.offsetX,
                offsetY: crop.offsetY ?? image.crop.offsetY,
              },
            }
          : image,
      ),
    )
  }

  const handleDelete = (id: string) => {
    onChange(images.filter((image) => image.id !== id))
  }

  const handleReplace = async (id: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/png,image/jpeg,image/svg+xml'
    input.onchange = () => {
      if (!input.files?.[0]) return
      const file = input.files[0]
      const src = URL.createObjectURL(file)
      updateImage(id, { name: file.name, src, crop: { ...DEFAULT_CROP } })
    }
    input.click()
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>, image: UploadedImage) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragState({
      id: image.id,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: image.crop.offsetX,
      startOffsetY: image.crop.offsetY,
    })
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState) return
    const target = event.currentTarget
    const rect = target.getBoundingClientRect()
    const deltaX = (event.clientX - dragState.startX) / rect.width
    const deltaY = (event.clientY - dragState.startY) / rect.height

    setImageCrop(dragState.id, {
      offsetX: Math.max(-0.5, Math.min(0.5, dragState.startOffsetX + deltaX)),
      offsetY: Math.max(-0.5, Math.min(0.5, dragState.startOffsetY + deltaY)),
    })
  }

  const handlePointerUp = () => {
    setDragState(null)
  }

  const resetCrop = (id: string) => {
    setImageCrop(id, { ...DEFAULT_CROP })
  }

  return (
    <section className="upload-section">
      <div className="upload-header">
        <span>העלאת תמונות ({images.length + existingCount}/{maxImages})</span>
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          בחר תמונות
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml"
        multiple
        onChange={(event) => handleFiles(event.target.files)}
        hidden
      />

      <div className="image-grid">
        {images.map((image) => (
          <div key={image.id} className="image-card">
            <div
              className="image-preview"
              aria-label="תצוגה מקדימה עגולה"
              onPointerDown={(event) => handlePointerDown(event, image)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <img
                src={image.src}
                alt={image.name}
                style={{
                  transform: `scale(${image.crop.scale}) translate(${image.crop.offsetX * 100}%, ${image.crop.offsetY * 100}%)`,
                }}
              />
            </div>
            <div className="image-actions">
              <button type="button" onClick={() => handleReplace(image.id)}>
                החלף
              </button>
              <button type="button" onClick={() => handleDelete(image.id)}>
                מחק
              </button>
              <button type="button" onClick={() => setImageCrop(image.id, { scale: image.crop.scale + 0.1 })}>
                זום +
              </button>
              <button type="button" onClick={() => setImageCrop(image.id, { scale: Math.max(1, image.crop.scale - 0.1) })}>
                זום -
              </button>
              <button type="button" onClick={() => resetCrop(image.id)}>
                איפוס
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
