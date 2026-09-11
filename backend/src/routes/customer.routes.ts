import { Router } from "express";

import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
} from "../controllers/customer.controller";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

// Admin and Sales can manage customers
router.post(
  "/",
  authorize("ADMIN", "SALES"),
  createCustomer
);

router.get(
  "/",
  authorize("ADMIN", "SALES"),
  getCustomers
);

router.get(
  "/:id",
  authorize("ADMIN", "SALES"),
  getCustomerById
);

router.put(
  "/:id",
  authorize("ADMIN", "SALES"),
  updateCustomer
);

export default router;