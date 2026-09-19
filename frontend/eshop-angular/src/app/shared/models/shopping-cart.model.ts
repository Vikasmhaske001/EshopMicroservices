export interface ShoppingCartItem {
  quantity: number;
  color: string;
  price: number;
  discountAmount: number;
  effectivePrice: number;
  productId: string;
  productName: string;
}

export interface ShoppingCart {
  userName: string;
  items: ShoppingCartItem[];
  totalPrice: number;
  checkoutEventId: string | null;
}
