export type ImageCrop = {
  scale: number
  offsetX: number
  offsetY: number
}

export type UploadedImage = {
  id: string
  name: string
  src: string
  crop: ImageCrop
}

export type CardStyleOptions = {
  cardSize: number
  symbolsPerCard: number
  backgroundColor: string
  showBorder: boolean
  centerTitle: string
}
