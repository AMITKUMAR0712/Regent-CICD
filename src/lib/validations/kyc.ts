import { z } from "zod";

export const ID_TYPES = ["DRIVING_LICENCE", "PASSPORT", "VOTER_ID"] as const;

const baseKycSchema = z.object({
  idType: z.enum(ID_TYPES, { message: "Choose an ID type" }),
  // Only the last 4 characters are ever persisted — see actions.ts.
  // Never Aadhaar: PROJECT_SPEC.md section 4/11 forbid storing it at all.
  idNumber: z
    .string()
    .trim()
    .min(4, "Enter your ID number")
    .max(32, "That doesn't look like a valid ID number")
    .refine((value) => !/^\d{12}$/.test(value.replace(/\s/g, "")), {
      message: "Aadhaar is not accepted. Use a driving licence, passport or voter ID.",
    }),
  addressLine: z.string().trim().min(5, "Enter your current address"),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  alternatePhone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{9,14}$/, "Enter a valid phone number with country code")
    .optional()
    .or(z.literal("")),
});

export const ownerKycSchema = baseKycSchema;

export const hostKycSchema = baseKycSchema.extend({
  emergencyContactName: z.string().trim().min(2, "Enter an emergency contact name"),
  emergencyContactPhone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{9,14}$/, "Enter a valid phone number with country code"),
});

export type OwnerKycInput = z.infer<typeof ownerKycSchema>;
export type HostKycInput = z.infer<typeof hostKycSchema>;
