/**
 * Shopping Cart Utility for LocalStorage persistence
 */

const CART_KEY = "fashion_market_cart";

// Helper: Safely parse a numeric value
function parseNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

/** Read cart items from LocalStorage */
export function readCart() {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/** Save cart items to LocalStorage */
export function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

/** Get quantity of a specific product in the cart */
export function getCartItemQuantity(cartItems, productId) {
  const found = cartItems.find((item) => item.productId === productId);
  return found ? found.quantity : 0;
}

/** Synchronize cart items with live product inventory */
export function syncCartWithInventory(cartItems = [], products = []) {
  const productMap = new Map(products.map((p) => [p._id, p]));

  const syncedCart = cartItems
    .map((item) => {
      const product = productMap.get(item.productId);
      if (!product || !product.available || parseNumber(product.stock) <= 0) {
        return null;
      }

      const stock = parseNumber(product.stock);
      const quantity = Math.min(Math.max(1, parseNumber(item.quantity)), stock);

      return {
        productId: product._id,
        name: product.name,
        price: product.price,
        stock,
        available: Boolean(product.available),
        quantity,
      };
    })
    .filter(Boolean);

  writeCart(syncedCart);
  return syncedCart;
}

/** Add a product to cart */
export function addToCart(product, quantityToAdd = 1) {
  const cart = readCart();
  const stock = parseNumber(product.stock);

  if (!product.available || stock <= 0) {
    return cart;
  }

  const existingItem = cart.find((item) => item.productId === product._id);

  if (existingItem) {
    existingItem.quantity = Math.min(stock, existingItem.quantity + quantityToAdd);
  } else {
    cart.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      stock,
      available: Boolean(product.available),
      quantity: Math.min(stock, Math.max(1, quantityToAdd)),
    });
  }

  writeCart(cart);
  return cart;
}

/** Update the quantity of a cart item */
export function updateCartItem(productId, newQuantity) {
  const cart = readCart();
  const updatedCart = cart
    .map((item) => {
      if (item.productId !== productId) return item;

      const stock = parseNumber(item.stock);
      const validQty = Math.max(1, parseNumber(newQuantity));
      const finalQty = stock > 0 ? Math.min(validQty, stock) : validQty;

      return { ...item, quantity: finalQty };
    })
    .filter((item) => item.quantity > 0);

  writeCart(updatedCart);
  return updatedCart;
}

/** Remove an item from cart */
export function removeCartItem(productId) {
  const cart = readCart();
  const updatedCart = cart.filter((item) => item.productId !== productId);
  writeCart(updatedCart);
  return updatedCart;
}

/** Clear all items from cart */
export function clearCart() {
  writeCart([]);
}

/** Calculate total items count and total price amount */
export function getCartTotals(cartItems = readCart()) {
  const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return { itemsCount, totalAmount };
}
