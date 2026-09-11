import { Router } from "express";

import {
  createChallan,
  getChallans,
  getChallanById,
  confirmChallan,
  cancelChallan,
} from "../controllers/challan.controller";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

// Admin and Sales can create challans
router.post(
  "/",
  authorize("ADMIN", "SALES"),
  createChallan
);

// Admin, Sales and Accounts can view challans
router.get(
  "/",
  authorize("ADMIN", "SALES", "ACCOUNTS"),
  getChallans
);

router.get(
  "/:id",
  authorize("ADMIN", "SALES", "ACCOUNTS"),
  getChallanById
);

// Admin, Sales and Accounts can confirm/cancel
router.put(
  "/:id/confirm",
  authorize("ADMIN", "SALES", "ACCOUNTS"),
  confirmChallan
);

router.put(
  "/:id/cancel",
  authorize("ADMIN", "SALES", "ACCOUNTS"),
  cancelChallan
);

export default router;