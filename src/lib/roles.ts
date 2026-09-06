export const Role = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const AttendanceStatus = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  LATE: "LATE",
  OD: "OD",
} as const;

export type AttendanceStatus =
  (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

export const OtpPurpose = {
  EMAIL_VERIFY: "EMAIL_VERIFY",
  PASSWORD_RESET: "PASSWORD_RESET",
} as const;

export type OtpPurpose = (typeof OtpPurpose)[keyof typeof OtpPurpose];
