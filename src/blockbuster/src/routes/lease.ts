import { Router } from "express";
import { LeaseController } from "../controllers/lease"
import { asyncHandler } from "../error-handler";

export const leaseRouter = Router();

leaseRouter.get('/', asyncHandler(LeaseController.listAll));
leaseRouter.post('/', asyncHandler(LeaseController.addLease));
leaseRouter.delete('/:id', asyncHandler(LeaseController.deleteLease));
leaseRouter.put('/:id', asyncHandler(LeaseController.updateLease));
