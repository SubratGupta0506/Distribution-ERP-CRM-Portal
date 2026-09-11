import { Response } from "express";

import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const getDashboard = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const [
      totalCustomers,
      totalProducts,
      lowStockProducts,
      draftChallans,
      confirmedChallans,
      cancelledChallans,
      recentChallans,
      recentStockMovements,
    ] = await Promise.all([
      prisma.customer.count(),

      prisma.product.count(),

      prisma.$queryRaw<
        Array<{
          id: number;
          name: string;
          sku: string;
          currentStock: number;
          minStock: number;
        }>
      >`
        SELECT
          id,
          name,
          sku,
          "currentStock",
          "minStock"
        FROM "Product"
        WHERE "currentStock" <= "minStock"
        ORDER BY "currentStock" ASC
        LIMIT 10
      `,

      prisma.challan.count({
        where: {
          status: "DRAFT",
        },
      }),

      prisma.challan.count({
        where: {
          status: "CONFIRMED",
        },
      }),

      prisma.challan.count({
        where: {
          status: "CANCELLED",
        },
      }),

      prisma.challan.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
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

      prisma.stockMovement.findMany({
        take: 10,
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
    ]);

    return res.json({
      success: true,
      data: {
        summary: {
          totalCustomers,
          totalProducts,
          lowStockCount: lowStockProducts.length,
          draftChallans,
          confirmedChallans,
          cancelledChallans,
        },

        lowStockProducts,

        recentChallans,

        recentStockMovements,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    });
  }
};