/** The shapes of notification-service.yaml 2.1.0 this app reads. */
export type NotificationType = 'APPOINTMENT_CONFIRMATION' | 'REMINDER' | 'PROMOTION' | 'SYSTEM';

export interface AppNotification {
  id: string;
  userId: string;
  barbershopId: string | null;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

/** {data, meta} of _shared.yaml (norm 5.3.6). */
export interface Page<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
