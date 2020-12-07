import { Router } from "express";
import { ciRouter } from "./ci";
import { leaseRouter } from "./lease";

export const router = Router();

router.use("/ci", ciRouter);
router.use("/lease", leaseRouter);
