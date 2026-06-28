import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // { uniqueId, pizza: {_id, name, image, basePrice}, customPizza: {base, sauce, cheese, vegetables, price}, quantity, price }
  couponCode: null,
  discountAmount: 0,
  tax: 0,
  deliveryCharge: 0,
  subtotal: 0,
  amount: 0
};

// Helper: Re-calculate totals, taxes, discounts, delivery
const recalculateCartTotals = (state) => {
  let subtotal = 0;
  state.items.forEach(item => {
    subtotal += item.price * item.quantity;
  });

  state.subtotal = subtotal;

  // Coupon calculations
  if (state.couponCode === 'PIZZA20') {
    state.discountAmount = Math.round(subtotal * 0.20);
  } else {
    state.discountAmount = 0;
  }

  // GST 5%
  state.tax = Math.round((subtotal - state.discountAmount) * 0.05);

  // Delivery charge (Free over ₹500, else ₹40)
  if (subtotal === 0) {
    state.deliveryCharge = 0;
  } else {
    state.deliveryCharge = subtotal > 500 ? 0 : 40;
  }

  state.amount = subtotal - state.discountAmount + state.tax + state.deliveryCharge;
};

// Helper: Generate hash uniqueId for custom pizzas to avoid conflicts
const generateCustomPizzaId = (customPizza) => {
  const { base, sauce, cheese, vegetables } = customPizza;
  const sortedVeggies = [...vegetables].sort().join(',');
  return `custom_${base}_${sauce}_${cheese}_[${sortedVeggies}]`;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { pizza, customPizza, quantity = 1 } = action.payload;
      
      let uniqueId;
      let price;
      
      if (pizza) {
        uniqueId = pizza._id;
        price = pizza.basePrice;
      } else if (customPizza) {
        uniqueId = generateCustomPizzaId(customPizza);
        price = customPizza.price;
      }

      // Check if item already exists in cart
      const existingItem = state.items.find(item => item.uniqueId === uniqueId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          uniqueId,
          pizza: pizza ? { _id: pizza._id, name: pizza.name, image: pizza.image, basePrice: pizza.basePrice } : null,
          customPizza: customPizza || null,
          quantity,
          price
        });
      }
      recalculateCartTotals(state);
    },
    removeFromCart: (state, action) => {
      const uniqueId = action.payload;
      state.items = state.items.filter(item => item.uniqueId !== uniqueId);
      recalculateCartTotals(state);
    },
    increaseQuantity: (state, action) => {
      const uniqueId = action.payload;
      const item = state.items.find(item => item.uniqueId === uniqueId);
      if (item) {
        item.quantity += 1;
      }
      recalculateCartTotals(state);
    },
    decreaseQuantity: (state, action) => {
      const uniqueId = action.payload;
      const item = state.items.find(item => item.uniqueId === uniqueId);
      if (item) {
        item.quantity -= 1;
        if (item.quantity <= 0) {
          state.items = state.items.filter(i => i.uniqueId !== uniqueId);
        }
      }
      recalculateCartTotals(state);
    },
    applyCoupon: (state, action) => {
      state.couponCode = action.payload;
      recalculateCartTotals(state);
    },
    removeCoupon: (state) => {
      state.couponCode = null;
      state.discountAmount = 0;
      recalculateCartTotals(state);
    },
    clearCart: (state) => {
      state.items = [];
      state.couponCode = null;
      state.discountAmount = 0;
      state.tax = 0;
      state.deliveryCharge = 0;
      state.subtotal = 0;
      state.amount = 0;
    }
  }
});

export const {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  applyCoupon,
  removeCoupon,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;
