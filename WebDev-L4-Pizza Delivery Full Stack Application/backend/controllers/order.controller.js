const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/order.model');
const Pizza = require('../models/pizza.model');
const Inventory = require('../models/inventory.model');
const User = require('../models/user.model');
const AppError = require('../utils/appError');
const emailService = require('../services/email.service');
const invoiceService = require('../services/invoice.service');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'mock',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock'
});

const isRazorpayMock = () => {
  return !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'your_razorpay_test_key_id';
};

// Helper: Calculate Custom Pizza Price dynamically
const calculateCustomPizzaPrice = (base, sauce, cheese, veggies) => {
  let price = 150; // Base flat rate
  
  // Custom Crust pricing
  if (base === 'Cheese Burst') price += 60;
  else if (base === 'Stuffed') price += 50;
  else if (base === 'Thin Crust') price += 20;
  else price += 30; // Pan, Whole Wheat

  // Sauce flat rate included

  // Cheese additions
  if (cheese === 'Double Cheese') price += 50;
  else if (cheese === 'Cheddar') price += 40;
  else price += 30; // Mozzarella, Paneer

  // Veggies additions (₹20 per veggie)
  price += (veggies.length * 20);

  return price;
};

// 1) Create Order (Checkout init)
exports.createOrder = async (req, res, next) => {
  try {
    const { items, address, couponCode } = req.body;

    if (!items || items.length === 0) {
      return next(new AppError('Your cart is empty', 400));
    }

    let calculatedSubtotal = 0;
    const verifiedItems = [];

    // Check inventory stock and verify prices
    for (const item of items) {
      if (item.pizza) {
        // Preset Pizza
        const pizza = await Pizza.findById(item.pizza);
        if (!pizza || !pizza.available) {
          return next(new AppError(`Pizza is no longer available`, 404));
        }
        
        // Check inventory for preset ingredients (e.g. general "dough", "cheese", "sauce")
        // We'll decrement: "dough" (crust category), "tomato sauce" (sauce category), "mozzarella" (cheese category)
        // Since we are validating in mock/production, let's verify if we have basic stocks
        const dough = await Inventory.findOne({ category: 'crust', quantity: { $gte: item.quantity } });
        if (!dough) return next(new AppError('Sorry, we are out of pizza crusts/bases!', 400));

        const itemSubtotal = pizza.basePrice * item.quantity;
        calculatedSubtotal += itemSubtotal;

        verifiedItems.push({
          pizza: pizza._id,
          quantity: item.quantity,
          price: pizza.basePrice
        });

      } else if (item.customPizza) {
        // Custom Pizza
        const { base, sauce, cheese, vegetables } = item.customPizza;
        
        // Check ingredient stock levels in inventory
        const checkBase = await Inventory.findOne({ itemName: base, quantity: { $gte: item.quantity } });
        if (!checkBase) return next(new AppError(`Sorry, ${base} crust is out of stock!`, 400));

        const checkSauce = await Inventory.findOne({ itemName: sauce, quantity: { $gte: item.quantity } });
        if (!checkSauce) return next(new AppError(`Sorry, ${sauce} sauce is out of stock!`, 400));

        const checkCheese = await Inventory.findOne({ itemName: cheese, quantity: { $gte: item.quantity } });
        if (!checkCheese) return next(new AppError(`Sorry, ${cheese} cheese is out of stock!`, 400));

        for (const veg of vegetables) {
          const checkVeg = await Inventory.findOne({ itemName: veg, quantity: { $gte: item.quantity } });
          if (!checkVeg) return next(new AppError(`Sorry, topping: ${veg} is out of stock!`, 400));
        }

        const customPrice = calculateCustomPizzaPrice(base, sauce, cheese, vegetables);
        const itemSubtotal = customPrice * item.quantity;
        calculatedSubtotal += itemSubtotal;

        verifiedItems.push({
          customPizza: {
            base,
            sauce,
            cheese,
            vegetables,
            price: customPrice
          },
          quantity: item.quantity,
          price: customPrice
        });
      }
    }

    // Taxes & Delivery Charges calculations
    const tax = Math.round(calculatedSubtotal * 0.05); // 5% GST
    const deliveryCharge = calculatedSubtotal > 500 ? 0 : 40; // Free delivery over ₹500
    
    // Coupon codes calculation (E.g. PIZZA20 gives 20% discount)
    let discountAmount = 0;
    if (couponCode === 'PIZZA20') {
      discountAmount = Math.round(calculatedSubtotal * 0.20);
    }

    const amount = calculatedSubtotal - discountAmount + tax + deliveryCharge;

    // Create order document in pending status
    const order = await Order.create({
      user: req.user._id,
      items: verifiedItems,
      amount,
      tax,
      deliveryCharge,
      couponCode: discountAmount > 0 ? couponCode : null,
      discountAmount,
      address,
      paymentStatus: 'Pending',
      orderStatus: 'Order Received'
    });

    // Handle Razorpay checkout setup
    if (isRazorpayMock()) {
      // Mock Razorpay Order ID for easy local testing
      const mockOrderId = `order_mock_${Date.now()}_${Math.round(Math.random() * 1000)}`;
      order.paymentDetails = { razorpayOrderId: mockOrderId };
      await order.save();

      return res.status(201).json({
        status: 'success',
        isMock: true,
        data: {
          orderId: order._id,
          razorpayOrderId: mockOrderId,
          amount: amount,
          keyId: 'mock_key_id'
        }
      });
    }

    // Real Razorpay integration
    const options = {
      amount: amount * 100, // paise
      currency: 'INR',
      receipt: order._id.toString()
    };

    const razorpayOrder = await razorpay.orders.create(options);
    order.paymentDetails = { razorpayOrderId: razorpayOrder.id };
    await order.save();

    res.status(201).json({
      status: 'success',
      isMock: false,
      data: {
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: amount,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });

  } catch (error) {
    next(error);
  }
};

// 2) Verify Order Payment
exports.verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    const razorpayOrderId = order.paymentDetails.razorpayOrderId;

    // Verification check (Supports Mock Mode bypass)
    if (isRazorpayMock() && razorpayOrderId.startsWith('order_mock_')) {
      // Auto success in Mock Mode
      order.paymentStatus = 'Paid';
      order.paymentDetails.razorpayPaymentId = razorpayPaymentId || `pay_mock_${Date.now()}`;
      order.paymentDetails.razorpaySignature = razorpaySignature || 'mock_sig';
      await order.save();

      // Trigger Stock Reductions and PDF Invoice
      await reduceInventory(order);

      // Send order confirmation email
      const user = await User.findById(order.user);
      if (user) {
        await order.populate('items.pizza');
        await invoiceService.generateInvoicePDF(order, user);
        await emailService.sendOrderConfirmationEmail(user.email, order);
      }

      // Socket.io trigger will be connected in real-time steps
      if (req.app.get('socketio')) {
        const io = req.app.get('socketio');
        io.to(order._id.toString()).emit('orderStatusChanged', {
          orderId: order._id,
          status: 'Order Received'
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Payment verified successfully (Mock Mode)',
        data: {
          order
        }
      });
    }

    // Cryptographic validation for production Razorpay
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      order.paymentStatus = 'Failed';
      await order.save();
      return next(new AppError('Payment signature verification failed. Fraudulent attempt blocked.', 400));
    }

    // Payment Succeeded
    order.paymentStatus = 'Paid';
    order.paymentDetails.razorpayPaymentId = razorpayPaymentId;
    order.paymentDetails.razorpaySignature = razorpaySignature;
    await order.save();

    // Reduce stock
    await reduceInventory(order);

    // Generate Invoice and Send confirmation email
    const user = await User.findById(order.user);
    if (user) {
      await order.populate('items.pizza');
      await invoiceService.generateInvoicePDF(order, user);
      await emailService.sendOrderConfirmationEmail(user.email, order);
    }

    // Socket.io broadcast
    if (req.app.get('socketio')) {
      const io = req.app.get('socketio');
      io.to(order._id.toString()).emit('orderStatusChanged', {
        orderId: order._id,
        status: 'Order Received'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Payment verified successfully',
      data: {
        order
      }
    });

  } catch (error) {
    next(error);
  }
};

// Private inventory reducer helper
const reduceInventory = async (order) => {
  try {
    for (const item of order.items) {
      const qty = item.quantity;
      if (item.pizza) {
        // Preset pizza: Reduce general crust base, sauce, and cheese
        await Inventory.findOneAndUpdate({ category: 'crust' }, { $inc: { quantity: -qty } });
        await Inventory.findOneAndUpdate({ category: 'sauce' }, { $inc: { quantity: -qty } });
        await Inventory.findOneAndUpdate({ category: 'cheese' }, { $inc: { quantity: -qty } });
      } else if (item.customPizza) {
        // Custom: Reduce specific items selected
        const { base, sauce, cheese, vegetables } = item.customPizza;
        
        await Inventory.findOneAndUpdate({ itemName: base }, { $inc: { quantity: -qty } });
        await Inventory.findOneAndUpdate({ itemName: sauce }, { $inc: { quantity: -qty } });
        await Inventory.findOneAndUpdate({ itemName: cheese }, { $inc: { quantity: -qty } });
        
        for (const veg of vegetables) {
          await Inventory.findOneAndUpdate({ itemName: veg }, { $inc: { quantity: -qty } });
        }
      }
    }
    console.log(`[INVENTORY REDUCED] - Subtracted ingredients for Order #${order._id}`);
  } catch (error) {
    console.error('Inventory reduction error:', error.message);
  }
};

// 3) Get Logged in User Order History
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: {
        orders
      }
    });
  } catch (error) {
    next(error);
  }
};

// 4) Get Order Details by ID (Protected)
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.pizza');
    
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // Only allow user who placed it or an Admin to view details
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new AppError('You do not have permission to view this order', 403));
    }

    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
};

// 5) Get All Orders (Admin Only) - with filters and search
exports.getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filterObj = {};
    if (req.query.status) filterObj.orderStatus = req.query.status;
    if (req.query.paymentStatus) filterObj.paymentStatus = req.query.paymentStatus;

    const totalOrders = await Order.countDocuments(filterObj);
    const orders = await Order.find(filterObj)
      .populate('user', 'name email phone')
      .populate('items.pizza')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      results: orders.length,
      total: totalOrders,
      pages: Math.ceil(totalOrders / limit),
      currentPage: page,
      data: {
        orders
      }
    });
  } catch (error) {
    next(error);
  }
};

// 6) Update Order Status (Admin Only) -> triggers socket.io live updates
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    
    const validStatuses = ['Order Received', 'Preparing', 'In Kitchen', 'Out For Delivery', 'Delivered'];
    if (!validStatuses.includes(orderStatus)) {
      return next(new AppError('Invalid order status level', 400));
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true, runValidators: true }
    );

    if (!order) {
      return next(new AppError('No order found with that ID', 404));
    }

    // Trigger real-time Socket.io status update broadcast
    if (req.app.get('socketio')) {
      const io = req.app.get('socketio');
      console.log(`[SOCKET STATUS BROADCAST] - Emitting status change for Order ${order._id} -> ${orderStatus}`);
      io.to(order._id.toString()).emit('orderStatusChanged', {
        orderId: order._id,
        status: orderStatus
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
};

// 7) Admin Panel Analytics API (Admin Only)
exports.getAdminAnalytics = async (req, res, next) => {
  try {
    // Total Revenue
    const revenueStats = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].total : 0;

    // Total Orders Count
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ paymentStatus: 'Paid' });

    // Total Users Count
    const totalUsers = await User.countDocuments({ role: 'User' });

    // Low stock items count
    const lowStockCount = await Inventory.countDocuments({
      $expr: { $lt: ['$quantity', '$minimumQuantity'] }
    });

    // Recent Sales Chart Details (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesHistory = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: 'Paid', 
          createdAt: { $gte: sevenDaysAgo } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalRevenue,
          totalOrders,
          paidOrders,
          totalUsers,
          lowStockCount
        },
        salesHistory
      }
    });
  } catch (error) {
    next(error);
  }
};
