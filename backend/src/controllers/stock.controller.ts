import { Response } from "express";

import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

import {
  stockMovementSchema,
} from "../validators/stock.validator";

export const createStockMovement = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const validation = stockMovementSchema.safeParse(
      req.body
    );

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const {
      productId,
      quantity,
      type,
      reason,
    } = validation.data;

    const result = await prisma.$transaction(
      async (tx) => {
        const product = await tx.product.findUnique({
          where: {
            id: productId,
          },
        });

        if (!product) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        let newStock = product.currentStock;

        if (type === "IN") {
          newStock += quantity;
        }

        if (type === "OUT") {
          if (product.currentStock < quantity) {
            throw new Error("INSUFFICIENT_STOCK");
          }

          newStock -= quantity;
        }

        const updatedProduct =
          await tx.product.update({
            where: {
              id: productId,
            },
            data: {
              currentStock: newStock,
            },
          });

        const movement =
          await tx.stockMovement.create({
            data: {
              productId,
              quantity,
              type,
              reason,
              createdById: req.user?.userId,
            },
          });

        return {
          updatedProduct,
          movement,
        };
      }
    );

    return res.status(201).json({
      success: true,
      message: `Stock ${type === "IN" ? "added" : "removed"} successfully`,
      data: result,
    });
  } catch (error: any) {
    console.error(error);

    if (error.message === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (error.message === "INSUFFICIENT_STOCK") {
      return res.status(400).json({
        success: false,
        message:
          "Insufficient stock. Stock cannot become negative.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update stock",
    });
  }
};

export const getStockMovements = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100
    );

    const productId =
      req.query.productId !== undefined
        ? Number(req.query.productId)
        : undefined;

    const type =
      typeof req.query.type === "string"
        ? req.query.type
        : undefined;

    const where: any = {};

    if (
      productId !== undefined &&
      Number.isInteger(productId) &&
      productId > 0
    ) {
      where.productId = productId;
    }

    if (type === "IN" || type === "OUT") {
      where.type = type;
    }

    const skip = (page - 1) * limit;

    const [movements, total] =
      await Promise.all([
        prisma.stockMovement.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        }),

        prisma.stockMovement.count({
          where,
        }),
      ]);

    return res.json({
      success: true,
      data: movements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch stock movements",
    });
  }
};