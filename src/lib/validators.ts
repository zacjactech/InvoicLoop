import { z } from "zod";

export const CustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const InvoiceItemSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0.01, "Unit price must be greater than 0"),
});

export const InvoiceSchema = z.object({
  invoiceNumber: z.string().regex(/^INV-\d{4}-\d{4}$/, "Invoice number must be in format INV-YYYY-XXXX"),
  customerId: z.string().min(1, "Customer is required"),
  issuedDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  taxRate: z.number().min(0).max(100).default(0),
  discount: z.number().min(0).default(0),
  currency: z.string().default("USD"),
  notes: z.string().optional(),
  items: z.array(InvoiceItemSchema).min(1, "At least one line item is required"),
}).refine(
  (data) => new Date(data.dueDate) > new Date(data.issuedDate),
  { message: "Due date must be after issue date", path: ["dueDate"] }
);

export const SignupSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Invalid email address").max(254),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  company: z.string().max(120).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
});

export type CustomerInput = z.infer<typeof CustomerSchema>;
export type InvoiceInput = z.infer<typeof InvoiceSchema>;
export type InvoiceItemInput = z.infer<typeof InvoiceItemSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
