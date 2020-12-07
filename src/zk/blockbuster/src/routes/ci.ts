import { Router } from "express";
import { CiController } from "../controllers/ci";
import { asyncHandler } from "../error-handler";

export const ciRouter = Router();

ciRouter.get('/', asyncHandler(CiController.getCis));
ciRouter.post('/', asyncHandler(CiController.addCi));
ciRouter.put('/', asyncHandler(CiController.updateCi));
ciRouter.delete('/', asyncHandler(CiController.deleteCi));
