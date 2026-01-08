// Mock product data for development
// Will be replaced with database queries once NeonDB is set up

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  images: string[]
  category: string
  tags: string[]
  sizes: string[]
  inStock: boolean
  featured: boolean
  variant: 1 | 2 | 3
}

export const products: Product[] = [
  {
    id: '1',
    slug: 'porsche-911-classic-cap',
    name: 'Porsche 911 Classic',
    description: 'Premium structured cap featuring the iconic Porsche 911 silhouette. Crafted with premium cotton twill and an adjustable strap for the perfect fit. The embroidered 911 outline captures the timeless beauty of this legendary sports car.',
    price: 12500,
    compareAtPrice: 15000,
    images: ['/products/porsche-911-1.jpg', '/products/porsche-911-2.jpg'],
    category: 'German Classics',
    tags: ['porsche', '911', 'classic', 'german'],
    sizes: ['S/M', 'L/XL'],
    inStock: true,
    featured: true,
    variant: 1,
  },
  {
    id: '2',
    slug: 'ferrari-f40-legend-cap',
    name: 'Ferrari F40 Legend',
    description: 'Bold snapback celebrating the Ferrari F40. Features a striking red accent stitch and premium embroidery of the F40 profile. Made with breathable performance fabric for all-day comfort.',
    price: 13500,
    images: ['/products/ferrari-f40-1.jpg', '/products/ferrari-f40-2.jpg'],
    category: 'Italian Icons',
    tags: ['ferrari', 'f40', 'supercar', 'italian'],
    sizes: ['One Size'],
    inStock: true,
    featured: true,
    variant: 2,
  },
  {
    id: '3',
    slug: 'lamborghini-countach-cap',
    name: 'Lamborghini Countach',
    description: 'Wedge-shaped perfection captured in premium headwear. This cap features the angular Countach silhouette with gold accent stitching. A tribute to the poster car of the 80s.',
    price: 13500,
    images: ['/products/lambo-countach-1.jpg', '/products/lambo-countach-2.jpg'],
    category: 'Italian Icons',
    tags: ['lamborghini', 'countach', 'supercar', 'italian'],
    sizes: ['S/M', 'L/XL'],
    inStock: true,
    featured: false,
    variant: 3,
  },
  {
    id: '4',
    slug: 'bmw-e30-m3-cap',
    name: 'BMW E30 M3',
    description: 'The ultimate driving machine deserves the ultimate cap. Clean lines and M-stripe detailing pay homage to the legendary E30 M3. Premium fitted construction for a sleek look.',
    price: 11500,
    images: ['/products/bmw-e30-1.jpg', '/products/bmw-e30-2.jpg'],
    category: 'German Classics',
    tags: ['bmw', 'e30', 'm3', 'german'],
    sizes: ['S/M', 'L/XL'],
    inStock: true,
    featured: true,
    variant: 1,
  },
  {
    id: '5',
    slug: 'mercedes-300sl-gullwing-cap',
    name: 'Mercedes 300SL Gullwing',
    description: 'Elegance meets performance in this tribute to the Mercedes 300SL. The gullwing doors are immortalized in detailed embroidery. Silver thread accents on black premium cotton.',
    price: 14500,
    images: ['/products/mercedes-300sl-1.jpg', '/products/mercedes-300sl-2.jpg'],
    category: 'German Classics',
    tags: ['mercedes', '300sl', 'gullwing', 'german', 'vintage'],
    sizes: ['One Size'],
    inStock: true,
    featured: false,
    variant: 2,
  },
  {
    id: '6',
    slug: 'nissan-skyline-gtr-r34-cap',
    name: 'Nissan Skyline GT-R R34',
    description: 'JDM legend status. The R34 GT-R silhouette in premium embroidery with blue accent stitching. A must-have for any Japanese car enthusiast.',
    price: 12500,
    images: ['/products/nissan-r34-1.jpg', '/products/nissan-r34-2.jpg'],
    category: 'JDM Legends',
    tags: ['nissan', 'skyline', 'gtr', 'r34', 'jdm'],
    sizes: ['S/M', 'L/XL'],
    inStock: true,
    featured: true,
    variant: 3,
  },
  {
    id: '7',
    slug: 'toyota-supra-mk4-cap',
    name: 'Toyota Supra MK4',
    description: 'The icon of 90s tuner culture. This cap celebrates the A80 Supra with its unmistakable curves rendered in premium embroidery. Orange accent stitching adds a pop of color.',
    price: 12500,
    images: ['/products/toyota-supra-1.jpg', '/products/toyota-supra-2.jpg'],
    category: 'JDM Legends',
    tags: ['toyota', 'supra', 'mk4', 'jdm', '2jz'],
    sizes: ['S/M', 'L/XL'],
    inStock: false,
    featured: false,
    variant: 1,
  },
  {
    id: '8',
    slug: 'ford-mustang-shelby-gt500-cap',
    name: 'Shelby GT500',
    description: 'American muscle at its finest. The Shelby GT500 cobra emblem and racing stripes bring classic muscle car heritage to your headwear collection.',
    price: 11500,
    images: ['/products/shelby-gt500-1.jpg', '/products/shelby-gt500-2.jpg'],
    category: 'American Muscle',
    tags: ['ford', 'mustang', 'shelby', 'gt500', 'american'],
    sizes: ['One Size'],
    inStock: true,
    featured: false,
    variant: 2,
  },
]

export const categories = [
  { name: 'All', slug: 'all' },
  { name: 'German Classics', slug: 'german-classics' },
  { name: 'Italian Icons', slug: 'italian-icons' },
  { name: 'JDM Legends', slug: 'jdm-legends' },
  { name: 'American Muscle', slug: 'american-muscle' },
]

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getProductsByCategory(category: string): Product[] {
  if (category === 'all') return products
  return products.filter(
    (p) => p.category.toLowerCase().replace(/\s+/g, '-') === category
  )
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured)
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(price)
}
