import { Router } from "express";
import { LeaseController } from "../controllers/lease"
import { asyncHandler } from "../error-handler";

export const leaseRouter = Router();

leaseRouter.post('/', asyncHandler(LeaseController.addLease));
leaseRouter.delete('/', asyncHandler(LeaseController.deleteLease));
leaseRouter.put('/', asyncHandler(LeaseController.updateLease));
