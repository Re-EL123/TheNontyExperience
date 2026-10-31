import type { BookingStatus, EnquiryStatus, MediaCategory } from "@nonty/shared";

export type User = { id: string; email: string; name: string; role: "owner" | "staff" };
export type Service = {
  id: string; slug: string; name: string; description: string | null;
  priceCents: number | null; compareAtCents: number | null; priceNote: string | null; active: boolean; sortOrder: number;
};
export type Client = { id: string; name: string; phone: string; email: string | null; notes: string | null; createdAt: string };
export type Enquiry = {
  id: string; name: string; phone: string; email: string | null; serviceId: string | null; serviceLabel: string | null;
  preferredDate: string | null; preferredTime: string | null; occasion: string | null; details: string | null;
  status: EnquiryStatus; clientId: string | null; createdAt: string;
};
export type Booking = {
  id: string; clientId: string; enquiryId: string | null; serviceId: string | null; startsAt: string; durationMins: number;
  location: string | null; priceCents: number; depositCents: number; status: BookingStatus; notes: string | null;
  clientName?: string; clientPhone?: string; serviceName?: string | null;
};
export type MediaItem = {
  id: string; key: string; url: string; alt: string; caption: string | null; category: MediaCategory; published: boolean;
};
