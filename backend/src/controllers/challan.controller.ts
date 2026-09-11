import { Response } from "express";

import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { createChallanSchema } from "../validators/challan.validator";

const generateChallanNumber = (): string => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  return `CH-${year}${month}${day}-${randomNumber}`;
};

// =====================================================
// CREATE DRAFT CHALLAN
// =====================================================

export const createChallan = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const validation = createChallanSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const { customerId, items } = validation.data;

    const customer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const productIds = items.map((item) => item.productId);

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    if (products.length !== productIds.length) {
      const foundProductIds = new Set(
        products.map((product) => product.id)
      );

      const missingProductIds = productIds.filter(
        (id) => !foundProductIds.has(id)
      );

      return res.status(404).json({
        success: false,
        message: "One or more products not found",
        missingProductIds,
      });
    }

    const productMap = new Map(
      products.map((product) => [product.id, product])
    );

    const totalQuantity = items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    const challanNumber = generateChallanNumber();

    const challan = await prisma.challan.create({
      data: {
        challanNumber,
        customerId,
        status: "DRAFT",
        totalQuantity,
        createdById: req.user?.userId,

        items: {
          create: items.map((item) => {
            const product = productMap.get(item.productId)!;

            return {
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              unitPrice: product.unitPrice,
              quantity: item.quantity,
            };
          }),
        },
      },

      include: {
        customer: {
          select: {
            id: true,
            name: true,
            mobile: true,
            businessName: true,
          },
        },

        items: true,

        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Draft challan created successfully",
      data: challan,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create challan",
    });
  }
};

// =====================================================
// GET ALL CHALLANS
// =====================================================

export const getChallans = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100
    );

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const status =
      typeof req.query.status === "string"
        ? req.query.status
        : undefined;

    const where: any = {};

    if (search) {
      where.OR = [
        {
          challanNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          customer: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          customer: {
            businessName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    if (
      status === "DRAFT" ||
      status === "CONFIRMED" ||
      status === "CANCELLED"
    ) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              mobile: true,
              businessName: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          items: true,
        },
      }),

      prisma.challan.count({
        where,
      }),
    ]);

    return res.json({
      success: true,
      data: challans,
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
      message: "Failed to fetch challans",
    });
  }
};

// =====================================================
// GET CHALLAN BY ID
// =====================================================

export const getChallanById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid challan ID",
      });
    }

    const challan = await prisma.challan.findUnique({
      where: {
        id,
      },
      include: {
        customer: true,

        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                currentStock: true,
              },
            },
          },
        },

        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    return res.json({
      success: true,
      data: challan,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch challan",
    });
  }
};

// =====================================================
// CONFIRM CHALLAN
// =====================================================

export const confirmChallan = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid challan ID",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({
        where: {
          id,
        },
        include: {
          items: true,
        },
      });

      if (!challan) {
        throw new Error("CHALLAN_NOT_FOUND");
      }

      if (challan.status !== "DRAFT") {
        throw new Error("CHALLAN_NOT_DRAFT");
      }

      const productIds = challan.items.map(
        (item) => item.productId
      );

      const products = await tx.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });

      const productMap = new Map(
        products.map((product) => [product.id, product])
      );

      // ---------------------------------------------
      // Check stock before changing anything
      // ---------------------------------------------

      for (const item of challan.items) {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        if (product.currentStock < item.quantity) {
          throw new Error(
            `INSUFFICIENT_STOCK:${product.name}:${product.currentStock}:${item.quantity}`
          );
        }
      }

      // ---------------------------------------------
      // Deduct stock and create OUT movements
      // ---------------------------------------------

      for (const item of challan.items) {
        const product = productMap.get(item.productId)!;

        await tx.product.update({
          where: {
            id: product.id,
          },
          data: {
            currentStock: {
              decrement: item.quantity,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: product.id,
            quantity: item.quantity,
            type: "OUT",
            reason: `Challan ${challan.challanNumber} confirmed`,
            createdById: req.user?.userId,
          },
        });
      }

      const updatedChallan = await tx.challan.update({
        where: {
          id,
        },
        data: {
          status: "CONFIRMED",
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              mobile: true,
              businessName: true,
            },
          },

          items: true,

          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return updatedChallan;
    });

    return res.json({
      success: true,
      message: "Challan confirmed and stock deducted successfully",
      data: result,
    });
  } catch (error: any) {
    console.error(error);

    if (error.message === "CHALLAN_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    if (error.message === "CHALLAN_NOT_DRAFT") {
      return res.status(400).json({
        success: false,
        message: "Only draft challans can be confirmed",
      });
    }

    if (error.message === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "One or more products in the challan no longer exist",
      });
    }

    if (error.message.startsWith("INSUFFICIENT_STOCK:")) {
      const [, productName, available, requested] =
        error.message.split(":");

      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${productName}. Available: ${available}, Requested: ${requested}`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to confirm challan",
    });
  }
};

// =====================================================
// CANCEL CHALLAN
// =====================================================

export const cancelChallan = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid challan ID",
      });
    }

    const challan = await prisma.challan.findUnique({
      where: {
        id,
      },
    });

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    if (challan.status !== "DRAFT") {
      return res.status(400).json({
        success: false,
        message: "Only draft challans can be cancelled",
      });
    }

    const updatedChallan = await prisma.challan.update({
      where: {
        id,
      },
      data: {
        status: "CANCELLED",
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            mobile: true,
            businessName: true,
          },
        },

        items: true,

        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      message: "Challan cancelled successfully",
      data: updatedChallan,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel challan",
    });
  }
};