export type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  imageUrl: string
  featured: boolean
  active: boolean
  material?: string
  size?: string
  length?: string
  width?: string
  thickness?: string
  weight?: string
  colour?: string
  packingType?: string
}
export const categories = ['Transparent Packing Rolls','Plastic Packing Sheets','LDPE Plastic Covers','PP Packaging Material','Shrink Film','Stretch Film','Plastic Bags','Custom Size Packing','Other Packaging Material']
