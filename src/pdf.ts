import { PDFDocument, rgb } from 'pdf-lib'
import type { CardStyleOptions, UploadedImage } from './types'
import { createCardPreviewSvg } from './card-layout'

const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297
const MM_TO_PT = 2.8346456693

function mmToPt(mm: number) {
  return mm * MM_TO_PT
}

async function svgToPngBytes(svg: string, size: number) {
  return new Promise<Uint8Array>((resolve, reject) => {
    const img = new Image()
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          throw new Error('Unable to create canvas context')
        }
        ctx.clearRect(0, 0, size, size)
        ctx.drawImage(img, 0, 0, size, size)
        URL.revokeObjectURL(url)

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Unable to convert SVG to PNG'))
            return
          }
          const reader = new FileReader()
          reader.onloadend = () => {
            const buffer = reader.result
            if (buffer instanceof ArrayBuffer) {
              resolve(new Uint8Array(buffer))
            } else {
              reject(new Error('Could not read PNG blob'))
            }
          }
          reader.onerror = () => reject(reader.error)
          reader.readAsArrayBuffer(blob)
        }, 'image/png')
      } catch (error) {
        URL.revokeObjectURL(url)
        reject(error)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load SVG image for PDF export'))
    }
    img.src = url
  })
}

export async function downloadPdf(
  deck: number[][],
  images: UploadedImage[],
  options: CardStyleOptions,
) {
  const cardSizePt = mmToPt(options.cardSize)
  const pageWidth = mmToPt(A4_WIDTH_MM)
  const pageHeight = mmToPt(A4_HEIGHT_MM)
  const pdfDoc = await PDFDocument.create()
  const cardsPerRow = 2
  const cardsPerColumn = 3
  const margin = mmToPt(15)
  const xSpacing = (pageWidth - margin * 2 - cardSizePt * cardsPerRow) / (cardsPerRow - 1)
  const ySpacing = (pageHeight - margin * 2 - cardSizePt * cardsPerColumn) / (cardsPerColumn - 1)

  let page = pdfDoc.addPage([pageWidth, pageHeight])
  let cardIndex = 0

  for (const card of deck) {
    if (cardIndex > 0 && cardIndex % (cardsPerRow * cardsPerColumn) === 0) {
      page = pdfDoc.addPage([pageWidth, pageHeight])
    }
    const row = Math.floor((cardIndex % (cardsPerRow * cardsPerColumn)) / cardsPerRow)
    const col = cardIndex % cardsPerRow
    const x = margin + col * (cardSizePt + xSpacing)
    const y = pageHeight - margin - (row + 1) * cardSizePt - row * ySpacing

    const svg = createCardPreviewSvg(card, images, options)
    const pngBytes = await svgToPngBytes(svg, Math.round(cardSizePt))
    const cardImage = await pdfDoc.embedPng(pngBytes)
    page.drawImage(cardImage, { x, y, width: cardSizePt, height: cardSizePt })

    page.drawRectangle({
      x: x - 5,
      y: y - 5,
      width: cardSizePt + 10,
      height: cardSizePt + 10,
      borderColor: rgb(0.7, 0.7, 0.7),
      borderWidth: 0.5,
      opacity: 0.25,
    })

    cardIndex += 1
  }

  const pdfBytes = await pdfDoc.save()
  const normalizedBytes = Uint8Array.from(pdfBytes)
  const blob = new Blob([normalizedBytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'dobble-deck.pdf'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
