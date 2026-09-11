import { Router } from "express";

import {
  createStockMovement,
  getStockMovements,
} from "../controllers/stock.controller";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

// Admin and Warehouse can manage inventory
router.post(
  "/movements",
  authorize("ADMIN", "WAREHOUSE"),
  createStockMovement
);

router.get(
  "/movements",
  authorize("ADMIN", "WAREHOUSE"),
  getStockMovements
);

export default router;