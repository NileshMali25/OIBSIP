const Pizza = require('../models/pizza.model');
const AppError = require('../utils/appError');
const cloudinaryService = require('../services/cloudinary.service');

// 1) Get All Pizzas (Public) - with search, filtering, pagination, sorting
exports.getAllPizzas = async (req, res, next) => {
  try {
    // BUILD QUERY
    // 1A) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Only show available pizzas for general public (admins can see all)
    if (!req.user || req.user.role !== 'Admin') {
      queryObj.available = true;
    }

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    let query = Pizza.find(JSON.parse(queryStr));

    // 1B) Search by name
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = query.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      });
    }

    // 2) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('createdAt');
    }

    // 3) Field Limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // 4) Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Get total count for pagination headers
    const totalPizzas = await Pizza.countDocuments(JSON.parse(queryStr));

    // EXECUTE QUERY
    const pizzas = await query;

    res.status(200).json({
      status: 'success',
      results: pizzas.length,
      total: totalPizzas,
      pages: Math.ceil(totalPizzas / limit),
      currentPage: page,
      data: {
        pizzas
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2) Get Pizza by ID (Public)
exports.getPizza = async (req, res, next) => {
  try {
    const pizza = await Pizza.findById(req.params.id);
    
    if (!pizza) {
      return next(new AppError('No pizza found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        pizza
      }
    });
  } catch (error) {
    next(error);
  }
};

// 3) Create Pizza (Admin Only)
exports.createPizza = async (req, res, next) => {
  try {
    const { name, description, category, basePrice, ingredients } = req.body;

    let imageUrl;
    if (req.file) {
      // Upload to Cloudinary / local fallback
      imageUrl = await cloudinaryService.uploadImage(req.file.buffer, 'pizzas');
    } else if (req.body.image) {
      imageUrl = req.body.image;
    } else {
      return next(new AppError('Please upload an image for the pizza', 400));
    }

    // Parse ingredients if sent as a JSON string
    let parsedIngredients = ingredients;
    if (typeof ingredients === 'string') {
      try {
        parsedIngredients = JSON.parse(ingredients);
      } catch (err) {
        parsedIngredients = ingredients.split(',').map(item => item.trim());
      }
    }

    const newPizza = await Pizza.create({
      name,
      description,
      image: imageUrl,
      category,
      basePrice: parseFloat(basePrice),
      ingredients: parsedIngredients
    });

    res.status(201).json({
      status: 'success',
      data: {
        pizza: newPizza
      }
    });
  } catch (error) {
    next(error);
  }
};

// 4) Update Pizza (Admin Only)
exports.updatePizza = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    // If file uploaded, process image
    if (req.file) {
      const imageUrl = await cloudinaryService.uploadImage(req.file.buffer, 'pizzas');
      updateData.image = imageUrl;
    }

    // Parse ingredients if provided
    if (updateData.ingredients) {
      if (typeof updateData.ingredients === 'string') {
        try {
          updateData.ingredients = JSON.parse(updateData.ingredients);
        } catch (err) {
          updateData.ingredients = updateData.ingredients.split(',').map(item => item.trim());
        }
      }
    }

    const pizza = await Pizza.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!pizza) {
      return next(new AppError('No pizza found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        pizza
      }
    });
  } catch (error) {
    next(error);
  }
};

// 5) Delete Pizza (Admin Only)
exports.deletePizza = async (req, res, next) => {
  try {
    const pizza = await Pizza.findByIdAndDelete(req.params.id);

    if (!pizza) {
      return next(new AppError('No pizza found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// 6) Toggle Pizza Availability (Admin Only)
exports.togglePizzaAvailability = async (req, res, next) => {
  try {
    const pizza = await Pizza.findById(req.params.id);

    if (!pizza) {
      return next(new AppError('No pizza found with that ID', 404));
    }

    pizza.available = !pizza.available;
    await pizza.save();

    res.status(200).json({
      status: 'success',
      message: `Pizza status successfully updated to ${pizza.available ? 'available' : 'unavailable'}`,
      data: {
        pizza
      }
    });
  } catch (error) {
    next(error);
  }
};
