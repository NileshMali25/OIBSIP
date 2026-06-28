const express = require('express');
const pizzaController = require('../controllers/pizza.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

// Public routes (anyone can see available pizzas, but we optionally pass protect to see unavailable ones for admin)
router.get('/', (req, res, next) => {
  // Optional check to allow admin to see disabled pizzas in listing
  if (req.headers.authorization) {
    return protect(req, res, () => {
      pizzaController.getAllPizzas(req, res, next);
    });
  }
  pizzaController.getAllPizzas(req, res, next);
});

router.get('/:id', pizzaController.getPizza);

// Admin-only protected routes
router.use(protect);
router.use(restrictTo('Admin'));

router.post('/', upload.single('image'), pizzaController.createPizza);
router.put('/:id', upload.single('image'), pizzaController.updatePizza);
router.delete('/:id', pizzaController.deletePizza);
router.patch('/:id/toggle', pizzaController.togglePizzaAvailability);

module.exports = router;
