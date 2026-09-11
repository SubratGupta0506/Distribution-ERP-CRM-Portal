import { Router } from "express";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
} from "../controllers/product.controller";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

// Admin and Warehouse can manage products
router.post(
  "/",
  authorize("ADMIN", "WAREHOUSE"),
  createProduct
);

router.get(
  "/",
  authorize("ADMIN", "WAREHOUSE"),
  getProducts
);

router.get(
  "/:id",
  authorize("ADMIN", "WAREHOUSE"),
  getProductById
);

router.put(
  "/:id",
  authorize("ADMIN", "WAREHOUSE"),
  updateProduct
);

export default router;