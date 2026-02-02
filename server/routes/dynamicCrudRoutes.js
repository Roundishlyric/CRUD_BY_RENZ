import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import * as crud from "../controller/dynamicCrudController.js";

const router = express.Router();

router.get("/:model", verifyToken, crud.list);
router.get("/:model/:id", verifyToken, crud.getById);
router.post("/:model", verifyToken, crud.create);
router.put("/:model/:id", verifyToken, crud.update);
router.delete("/:model/:id", verifyToken, crud.remove);

export default router;
