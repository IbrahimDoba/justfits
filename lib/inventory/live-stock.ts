// Live physical stock recount (2026-07). Prices are selling prices (NGN).
// Shirts are stored one row per size; caps are one-size (size = null).

export type LiveStockItem = {
  name: string;
  brand: string | null;
  size: string | null;
  quantity: number;
  sellingPrice: number;
};

type ShirtSpec = {
  name: string;
  brand: string | null;
  price: number;
  sizes: Record<string, number>;
};

const shirts: ShirtSpec[] = [
  { name: "White Oracle Red Bull Shirt", brand: "Red Bull", price: 32000, sizes: { L: 1, XL: 2, XXL: 1, "3XL": 1 } },
  { name: "Blue Red Bull Racing Polo", brand: "Red Bull", price: 35000, sizes: { XL: 1, "2XL": 1, "3XL": 1 } },
  { name: "Black Benz Shirt", brand: "Mercedes Benz", price: 32000, sizes: { L: 1, XL: 2, XXL: 1 } },
  { name: "Black Benz Team Shirt", brand: "Mercedes Benz", price: 32000, sizes: { L: 3, XL: 2, XXL: 1 } },
  { name: "White Benz Shirt", brand: "Mercedes Benz", price: 32000, sizes: { L: 3, XL: 2, "3XL": 1 } },
  { name: "Black BMW Shirt", brand: "BMW", price: 32000, sizes: { L: 3, XL: 2, XXL: 1, "3XL": 1 } },
  { name: "Black BMW Motorsport Shirt", brand: "BMW", price: 32000, sizes: { L: 3, XL: 2, XXL: 1, "3XL": 1 } },
  { name: "Black Ferrari Shirt", brand: "Ferrari", price: 32000, sizes: { L: 3, XL: 2, XXL: 1 } },
];

const caps: LiveStockItem[] = [
  { name: "Light Blue Benz Cap", brand: "Mercedes Benz", size: null, quantity: 1, sellingPrice: 27000 },
  { name: "Red/White Ferrari Cap", brand: "Ferrari", size: null, quantity: 4, sellingPrice: 30000 },
  { name: "Black Hugo Boss Cap", brand: "Hugo Boss", size: null, quantity: 4, sellingPrice: 35000 },
  { name: "Green/White Benz Cap", brand: "Mercedes Benz", size: null, quantity: 6, sellingPrice: 25000 },
  { name: "Black Motorsport BMW Cap", brand: "BMW", size: null, quantity: 5, sellingPrice: 30000 },
  { name: "White Motorsport BMW Cap", brand: "BMW", size: null, quantity: 5, sellingPrice: 30000 },
  { name: "Beige/Brown Benz Cap", brand: "Mercedes Benz", size: null, quantity: 7, sellingPrice: 25000 },
  { name: "Cream Hugo Boss Cap", brand: "Hugo Boss", size: null, quantity: 6, sellingPrice: 35000 },
  { name: "Navy Blue Benz Cap", brand: "Mercedes Benz", size: null, quantity: 4, sellingPrice: 30000 },
  { name: "Black BMW Cap", brand: "BMW", size: null, quantity: 6, sellingPrice: 30000 },
  { name: "Red Bull Cap", brand: "Red Bull", size: null, quantity: 3, sellingPrice: 27000 },
  { name: "Porsche Cap", brand: "Porsche", size: null, quantity: 3, sellingPrice: 30000 },
  { name: "Black/Blue Benz Cap", brand: "Mercedes Benz", size: null, quantity: 1, sellingPrice: 32000 },
  { name: "Black/White Benz Cap", brand: "Mercedes Benz", size: null, quantity: 1, sellingPrice: 32000 },
  { name: "F1 Black Cap", brand: "F1", size: null, quantity: 4, sellingPrice: 30000 },
  { name: "Full Black Benz Cap", brand: "Mercedes Benz", size: null, quantity: 2, sellingPrice: 30000 },
  { name: "McLaren Face Cap", brand: "McLaren", size: null, quantity: 4, sellingPrice: 27000 },
  { name: "Honda Cap", brand: "Honda", size: null, quantity: 7, sellingPrice: 23000 },
  { name: "Toyota Cap", brand: "Toyota", size: null, quantity: 4, sellingPrice: 23000 },
  { name: "White Ferrari Cap", brand: "Ferrari", size: null, quantity: 7, sellingPrice: 20000 },
  { name: "Full Red Ferrari Cap", brand: "Ferrari", size: null, quantity: 2, sellingPrice: 35000 },
  { name: "Black/Red Ferrari Cap", brand: "Ferrari", size: null, quantity: 1, sellingPrice: 32000 },
];

export const liveStock: LiveStockItem[] = [
  ...shirts.flatMap((s) =>
    Object.entries(s.sizes).map(([size, quantity]) => ({
      name: s.name,
      brand: s.brand,
      size,
      quantity,
      sellingPrice: s.price,
    }))
  ),
  ...caps,
];
