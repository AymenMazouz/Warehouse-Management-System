export type Product = {
  id: number;
  name: string;
  description: string;
  cost: number;
  quantity: number;
  height: number;
  length: number;
  weight: number;
  width: number;
  provider: ProductProvider;
};

type ProductProvider = {
  id: number;
  name: string;
  createdAt: Date;
};
