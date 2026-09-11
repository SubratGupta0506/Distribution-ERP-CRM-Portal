import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../validators/customer.validator";

export const createCustomer = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const validation = createCustomerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const data = validation.data;

    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        businessName: data.businessName,
        gstNumber: data.gstNumber,
        customerType: data.customerType,
        address: data.address,
        status: data.status || "LEAD",
        followUpDate: data.followUpDate,
        notes: data.notes,
        createdById: req.user?.userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create customer",
    });
  }
};

export const getCustomers = async (
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

    const status =
      typeof req.query.status === "string"
        ? req.query.status
        : undefined;

    const customerType =
      typeof req.query.customerType === "string"
        ? req.query.customerType
        : undefined;

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
          mobile: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          businessName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          gstNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (
      status &&
      ["LEAD", "ACTIVE", "INACTIVE"].includes(status)
    ) {
      where.status = status;
    }

    if (
      customerType &&
      ["RETAIL", "WHOLESALE", "DISTRIBUTOR"].includes(
        customerType
      )
    ) {
      where.customerType = customerType;
    }

    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.customer.count({
        where,
      }),
    ]);

    return res.json({
      success: true,
      data: customers,
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
      message: "Failed to fetch customers",
    });
  }
};

export const getCustomerById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        challans: {
          select: {
            id: true,
            challanNumber: true,
            status: true,
            totalQuantity: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
    });
  }
};

export const updateCustomer = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const validation = updateCustomerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const existingCustomer =
      await prisma.customer.findUnique({
        where: { id },
      });

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: validation.data,
    });

    return res.json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update customer",
    });
  }
};