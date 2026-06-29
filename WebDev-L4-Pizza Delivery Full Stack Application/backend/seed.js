const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const Pizza = require('./models/pizza.model');
const Inventory = require('./models/inventory.model');
const User = require('./models/user.model');

const pizzasToSeed = [
  {
    name: "Classic Margherita",
    description: "Classic delight with 100% real mozzarella cheese, fresh basil, and signature tomato sauce base.",
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=600&q=80",
    category: "Veg",
    basePrice: 199,
    ingredients: ["Mozzarella", "Tomato Sauce", "Basil"],
    available: true
  },
  {
    name: "Double Cheese Margherita",
    description: "The crowd favorite - loaded with double helpings of delicious melted mozzarella cheese.",
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80",
    category: "Veg",
    basePrice: 279,
    ingredients: ["Double Cheese", "Mozzarella", "Tomato Sauce"],
    available: true
  },
  {
    name: "Farmhouse Pizza",
    description: "A healthy, crunchy medley of onions, green capsicum, juicy tomatoes, and fresh mushrooms.",
    image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=600&q=80",
    category: "Veg",
    basePrice: 329,
    ingredients: ["Mozzarella", "Tomato Sauce", "Onion", "Capsicum", "Tomato", "Mushroom"],
    available: true
  },
  {
    name: "Spicy Peppy Paneer",
    description: "Chunky paneer cubes marinated in spices, paired with capsicum and spicy red paprika.",
    image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80",
    category: "Veg",
    basePrice: 359,
    ingredients: ["Mozzarella", "Schezwan Sauce", "Paneer", "Capsicum", "Jalapeno"],
    available: true
  },
  {
    name: "Mexican Green Wave",
    description: "A hot & spicy wave of jalapeños, onions, capsicum, tomatoes, and Mexican seasoning.",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
    category: "Veg",
    basePrice: 349,
    ingredients: ["Mozzarella", "Tomato Sauce", "Onion", "Capsicum", "Tomato", "Jalapeno"],
    available: true
  },
  {
    name: "Pepper Barbecue Chicken",
    description: "Smoky barbecue chicken pieces combined with sweet onions and melted cheese.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
    category: "Non-Veg",
    basePrice: 399,
    ingredients: ["Mozzarella", "BBQ Sauce", "Chicken", "Onion"],
    available: true
  },
  {
    name: "Chicken Tikka Feast",
    description: "Tandoori chicken tikka chunks, sliced onions, red paprika, and premium mozzarella.",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80",
    category: "Non-Veg",
    basePrice: 429,
    ingredients: ["Mozzarella", "Tomato Sauce", "Chicken Tikka", "Onion"],
    available: true
  },
  {
    name: "Veg Extravaganza",
    description: "The ultimate veggie pizza: black olives, capsicum, onions, mushrooms, corn, tomatoes, and jalapeños.",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80",
    category: "Veg",
    basePrice: 389,
    ingredients: ["Onion", "Capsicum", "Tomato", "Olives", "Corn", "Paneer", "Mushroom", "Jalapeno", "Extra Cheese"],
    available: true
  },
  {
    name: "Chilled Pepsi (500ml)",
    description: "Chilled Pepsi carbonated soft drink to pair with your pizza.",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80",
    category: "Beverages",
    basePrice: 60,
    ingredients: [],
    available: true
  },
  {
    name: "Chilled Coca Cola (500ml)",
    description: "Chilled classic Coca-Cola soft drink.",
    image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=600&q=80",
    category: "Beverages",
    basePrice: 60,
    ingredients: [],
    available: true
  },
  {
    name: "Classic Masala Maggi",
    description: "Your favorite 2-minute instant noodles cooked with secret spices and fresh diced veggies.",
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80",
    category: "Veg",
    basePrice: 79,
    ingredients: ["Onion", "Tomato", "Capsicum"],
    available: true
  },
  {
    name: "Cheese Cheese Maggi",
    description: "Maggi noodles loaded with melted cheese blocks and special herbs for a creamy, rich taste.",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
    category: "Veg",
    basePrice: 99,
    ingredients: ["Mozzarella", "Cheddar", "Onion"],
    available: true
  },
  {
    name: "Double Masala Egg Maggi",
    description: "Masala Maggi loaded with scrambled eggs, fresh green chilies, and coriander toppings.",
    image: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=600&q=80",
    category: "Non-Veg",
    basePrice: 119,
    ingredients: ["Onion", "Tomato", "Egg"],
    available: true
  },
  {
    name: "Iced Cafe Latte",
    description: "Perfectly brewed espresso over ice with creamy fresh cold milk.",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
    category: "Beverages",
    basePrice: 120,
    ingredients: [],
    available: true
  },
  {
    name: "Fresh Lemon Mojito",
    description: "Sparkling refreshing drink with fresh mint leaves, squeezed lime, and cane sugar syrup over crushed ice.",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
    category: "Beverages",
    basePrice: 99,
    ingredients: [],
    available: true
  },
  {
    name: "Garlic Breadsticks",
    description: "Freshly baked garlic breadsticks seasoned with garlic butter, oregano, and basil.",
    image: "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=600&q=80",
    category: "Sides",
    basePrice: 129,
    ingredients: ["Garlic Butter", "Oregano"],
    available: true
  },
  {
    name: "Stuffed Paneer Pocket",
    description: "Delicious pocket filled with spicy marinated paneer chunks, corn, and melted mozzarella.",
    image: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=600&q=80",
    category: "Sides",
    basePrice: 149,
    ingredients: ["Paneer", "Corn", "Mozzarella"],
    available: true
  },
  {
    name: "Crispy French Fries",
    description: "Perfectly cut golden crispy french fries served with spicy peri-peri seasoning.",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80",
    category: "Sides",
    basePrice: 99,
    ingredients: ["Peri Peri Seasoning"],
    available: true
  }
];

const inventoryToSeed = [
  // Crusts
  { itemName: 'Thin Crust', category: 'crust', quantity: 100, minimumQuantity: 10 },
  { itemName: 'Cheese Burst', category: 'crust', quantity: 100, minimumQuantity: 10 },
  { itemName: 'Pan', category: 'crust', quantity: 100, minimumQuantity: 10 },
  { itemName: 'Stuffed', category: 'crust', quantity: 100, minimumQuantity: 10 },
  { itemName: 'Whole Wheat', category: 'crust', quantity: 100, minimumQuantity: 10 },

  // Sauces
  { itemName: 'Tomato Sauce', category: 'sauce', quantity: 100, minimumQuantity: 10 },
  { itemName: 'Schezwan Sauce', category: 'sauce', quantity: 100, minimumQuantity: 10 },
  { itemName: 'Pesto Sauce', category: 'sauce', quantity: 100, minimumQuantity: 10 },
  { itemName: 'Garlic Sauce', category: 'sauce', quantity: 100, minimumQuantity: 10 },
  { itemName: 'BBQ Sauce', category: 'sauce', quantity: 100, minimumQuantity: 10 },

  // Cheeses
  { itemName: 'Mozzarella', category: 'cheese', quantity: 100, minimumQuantity: 10 },
  { itemName: 'Cheddar', category: 'cheese', quantity: 100, minimumQuantity: 10 },
  { itemName: 'Paneer Cheese', category: 'cheese', quantity: 100, minimumQuantity: 10 },
  { itemName: 'Double Cheese', category: 'cheese', quantity: 100, minimumQuantity: 10 },

  // Vegetables
  { itemName: 'Onion', category: 'vegetable', quantity: 100, minimumQuantity: 10 },
  { itemName: 'Capsicum', category: 'vegetable', quantity: 100, minimumQuantity: 10 },
  { itemName: 'Tomato', category: 'vegetable', quantity: 100, minimumQuantity: 10 },
  { itemName: 'Olives', category: 'vegetable', quantity: 100, minimumQuantity: 10 },
  { itemName: 'Corn', category: 'vegetable', quantity: 100, minimumQuantity: 10 },
  { itemName: 'Paneer', category: 'vegetable', quantity: 100, minimumQuantity: 10 },
  { itemName: 'Mushroom', category: 'vegetable', quantity: 100, minimumQuantity: 10 },
  { itemName: 'Jalapeno', category: 'vegetable', quantity: 100, minimumQuantity: 10 },
  { itemName: 'Extra Cheese', category: 'vegetable', quantity: 100, minimumQuantity: 10 }
];

const seed = async () => {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected.');

    // 1. Clear existing pizzas
    console.log('Clearing existing pizzas...');
    await Pizza.deleteMany({});
    
    // 2. Insert new pizzas
    console.log('Seeding new pizzas...');
    await Pizza.insertMany(pizzasToSeed);
    console.log('Pizzas seeded successfully.');

    // 3. Clear existing inventory
    console.log('Clearing existing inventory...');
    await Inventory.deleteMany({});

    // 4. Insert new inventory
    console.log('Seeding inventory items...');
    await Inventory.insertMany(inventoryToSeed);
    console.log('Inventory seeded successfully.');

    // 5. Update existing users default profileImage
    console.log('Updating existing users default profileImage...');
    const updateResult = await User.updateMany(
      { profileImage: 'https://res.cloudinary.com/default/image/upload/v1600000000/default-avatar.png' },
      { profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=d32f2f' }
    );
    console.log(`Updated ${updateResult.modifiedCount} users profile images.`);

    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seed();
