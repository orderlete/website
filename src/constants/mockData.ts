import { Product } from "@/store/useCartStore";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "c1",
    name: "Red Velvet Bliss Cupcake",
    category: "confectionary",
    price: 499,
    image_url: "https://images.unsplash.com/photo-1614707267537-b85600e42ec1?w=800&q=80",
    description: "Cloud-like red velvet sponge topped with silky cream cheese frosting.",
    stock: 20,
    tags: ["Popular", "Fresh"]
  },
  {
    id: "c2",
    name: "Dark Chocolate Fondant",
    category: "confectionary",
    price: 1250,
    image_url: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&q=80",
    description: "Indulgent Belgian dark chocolate truffles with a gooey core.",
    stock: 15,
    tags: ["Best Seller"]
  },
  {
    id: "c3",
    name: "Signature Macarons Box",
    category: "confectionary",
    price: 1800,
    image_url: "https://images.unsplash.com/photo-1569864358642-9d16197022c4?w=800&q=80",
    description: "Assorted French macarons: Rose, Pistachio, and Salted Caramel.",
    stock: 10,
    tags: ["Fresh", "New"]
  },
  {
    id: "c4",
    name: "Berry Glazed Donut",
    category: "confectionary",
    price: 250,
    image_url: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80",
    description: "Soft donut glazed with real wild forest berry reduction.",
    stock: 30,
    tags: ["Popular"]
  },
  {
    id: "m1",
    name: "Paracetamol 500mg (10 tabs)",
    category: "medical",
    price: 250,
    image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
    description: "Effective pain reliever and fever reducer for adults.",
    stock: 100
  },
  {
    id: "m2",
    name: "Vitamin C Advanced Care",
    category: "medical",
    price: 1599,
    image_url: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800&q=80",
    description: "Immune system support capsules with Zinc and Vitamin D.",
    stock: 50
  },
  {
    id: "m3",
    name: "Pro First Aid Kit",
    category: "medical",
    price: 2500,
    image_url: "https://images.unsplash.com/photo-1603398938378-e54eab4063a8?w=800&q=80",
    description: "Essential first aid supplies for emergencies and minor injuries.",
    stock: 5
  },
  {
    id: "m4",
    name: "Antiseptic Solution 100ml",
    category: "medical",
    price: 120,
    image_url: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800&q=80",
    description: "Effective solution for cleaning wounds and skin disinfection.",
    stock: 40
  }
];
