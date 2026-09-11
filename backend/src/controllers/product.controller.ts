import { Response } from "express";

import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

import {
  createProductSchema,
  updateProductSchema,
} from "../validators/product.validator";

export const createProduct = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const validation = createProductSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const data = validation.data;

    const existingProduct = await prisma.product.findUnique({
      where: {
        sku: data.sku,
      },
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Product with this SKU already exists",
      });
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        category: data.category,
        unitPrice: data.unitPrice,
        currentStock: data.currentStock ?? 0,
        minStock: data.minStock ?? 0,
        location: data.location,
        warehouse: data.warehouse,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

export const getProducts = async (
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

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const category =
      typeof req.query.category === "string"
        ? req.query.category.trim()
        : "";

    const lowStock = req.query.lowStock === "true";

    const where: any = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          sku: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          category: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (category) {
      where.category = {
        contains: category,
        mode: "insensitive",
      };
    }

    /*
     * We cannot compare currentStock with minStock directly
     * using a normal Prisma where condition.
     *
     * Therefore, when lowStock=true, we fetch the matching
     * products first and filter them in JavaScript.
     */

    if (lowStock) {
      const allProducts = await prisma.product.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
      });

      const filteredProducts = allProducts.filter(
        (product) =>
          product.currentStock <= product.minStock
      );

      const total = filteredProducts.length;

      const skip = (page - 1) * limit;

      const products = filteredProducts.slice(
        skip,
        skip + limit
      );

      return res.json({
        success: true,
        data: products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    /*
     * Normal product listing
     */

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.product.count({
        where,
      }),
    ]);

    return res.json({
      success: true,
      data: products,
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
      message: "Failed to fetch products",
    });
  }
};

export const getProductById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        stockMovements: {
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

export const updateProduct = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const validation = updateProductSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          id,
        },
      });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (validation.data.sku) {
      const duplicateSku =
        await prisma.product.findFirst({
          where: {
            sku: validation.data.sku,
            NOT: {
              id,
            },
          },
        });

      if (duplicateSku) {
        return res.status(409).json({
          success: false,
          message:
            "Another product already uses this SKU",
        });
      }
    }

    const product = await prisma.product.update({
      where: {
        id,
      },
      data: validation.data,
    });

    return res.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};