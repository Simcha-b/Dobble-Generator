import type { CardStyleOptions, ImageCrop, UploadedImage } from './types'

type LayoutElement = {
  src: string
  x: number
  y: number
  width: number
  height: number
  rotate: number
  crop: ImageCrop
}

type CardLayout = {
  cardSize: number
  backgroundColor: string
  showBorder: boolean
  centerTitle: string
  elements: LayoutElement[]
}

export function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function pointInsideCircle(x: number, y: number, radius: number, centerX: number, centerY: number) {
  const dx = x - centerX
  const dy = y - centerY
  return dx * dx + dy * dy <= radius * radius
}

export function getCroppedElementFrame(element: LayoutElement) {
  const width = element.width * element.crop.scale
  const height = element.height * element.crop.scale
  const x = element.x + (element.width - width) / 2 + element.crop.offsetX * element.width
  const y = element.y + (element.height - height) / 2 + element.crop.offsetY * element.height
  return { x, y, width, height }
}

export function calculateCardLayouts(
  deck: number[][],
  images: UploadedImage[],
  options: CardStyleOptions,
): CardLayout[] {
  const layouts: CardLayout[] = []
  const radius = options.cardSize / 2
  const center = radius

  function getRingPlacement(index: number, count: number, size: number) {
    const innerCount = count > 8 ? Math.max(3, Math.floor(count * 0.4)) : 0
    const outerCount = count - innerCount
    const outerRadius = options.cardSize * 0.34
    const innerRadius = options.cardSize * 0.16

    if (innerCount > 0 && index >= outerCount) {
      const innerIndex = index - outerCount
      const innerAngle = (Math.PI * 2 * innerIndex) / innerCount
      return {
        x: center + Math.cos(innerAngle) * innerRadius - size / 2,
        y: center + Math.sin(innerAngle) * innerRadius - size / 2,
      }
    }

    const ringIndex = index % outerCount
    const ringAngle = (Math.PI * 2 * ringIndex) / outerCount
    return {
      x: center + Math.cos(ringAngle) * outerRadius - size / 2,
      y: center + Math.sin(ringAngle) * outerRadius - size / 2,
    }
  }

  for (const card of deck) {
    const elements: LayoutElement[] = []
    const symbolCount = card.length
    const sizeBase = symbolCount <= 6 ? options.cardSize * 0.24 : options.cardSize * 0.18
    const sizeSpread = symbolCount <= 6 ? 0.15 : 0.18
    const hasCenter = symbolCount > 4
    const outerCount = hasCenter ? symbolCount - 1 : symbolCount
    const centerSize = hasCenter
      ? clamp(
          randomBetween(sizeBase * 0.88, sizeBase * 1.12),
          options.cardSize * 0.16,
          options.cardSize * 0.36,
        )
      : 0

    card.forEach((symbolIndex, symbolPosition) => {
      const isCenter = hasCenter && symbolPosition === 0
      const size = isCenter
        ? centerSize
        : clamp(
            randomBetween(sizeBase * (1 - sizeSpread), sizeBase * (1 + sizeSpread)),
            options.cardSize * 0.14,
            options.cardSize * 0.34,
          )
      const rotate = isCenter ? randomBetween(-10, 10) : randomBetween(-18, 18)
      const position = isCenter
        ? { x: center - size / 2, y: center - size / 2 }
        : getRingPlacement(symbolPosition - (hasCenter ? 1 : 0), outerCount, size)
      const image = images[symbolIndex]

      const element = {
        src: image.src,
        x: clamp(position.x, 0, options.cardSize - size),
        y: clamp(position.y, 0, options.cardSize - size),
        width: size,
        height: size,
        rotate,
        crop: image.crop,
      }
      elements.push(element)
    })

    layouts.push({
      cardSize: options.cardSize,
      backgroundColor: options.backgroundColor,
      showBorder: options.showBorder,
      centerTitle: options.centerTitle,
      elements,
    })
  }

  return layouts
}

export function createCardPreviewSvg(card: number[], images: UploadedImage[], options: CardStyleOptions) {
  const layout = calculateCardLayouts([card], images, options)[0]
  const svgParts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${options.cardSize}" height="${options.cardSize}" viewBox="0 0 ${options.cardSize} ${options.cardSize}">`,
    `<defs><clipPath id="circleClip"><circle cx="${options.cardSize / 2}" cy="${options.cardSize / 2}" r="${options.cardSize / 2 - 2}"/></clipPath></defs>`,
    `<rect width="100%" height="100%" fill="${options.backgroundColor}" clip-path="url(#circleClip)" />`,
    ...(options.showBorder
      ? [`<circle cx="${options.cardSize / 2}" cy="${options.cardSize / 2}" r="${options.cardSize / 2 - 2}" fill="none" stroke="#333" stroke-width="2"/>`]
      : []),
    ...layout.elements.map((element) => {
      const frame = getCroppedElementFrame(element)
      const centerX = frame.x + frame.width / 2
      const centerY = frame.y + frame.height / 2
      return `<image href="${element.src}" x="${frame.x}" y="${frame.y}" width="${frame.width}" height="${frame.height}" transform="rotate(${element.rotate}, ${centerX}, ${centerY})" preserveAspectRatio="xMidYMid meet" />`
    }),
    `<circle cx="${options.cardSize / 2}" cy="${options.cardSize / 2}" r="${options.cardSize / 2 - 4}" fill="none" stroke="#666" stroke-width="1" stroke-dasharray="4 4" opacity="0.7" />`,
    options.centerTitle
      ? `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#111" font-size="12">${options.centerTitle}</text>`
      : '',
    '</svg>',
  ]
  return svgParts.join('')
}
