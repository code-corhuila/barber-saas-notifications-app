import { Routes } from '@angular/router';

/**
 * What this domain app exposes as './routes' (ADR-013). The shell mounts them under /notifications
 * for every signed-in role: each user sees only their own inbox. The screen is lazy.
 */
export const routes: Routes = [
  { path: '', title: 'Notificaciones', loadComponent: () =>
      import('./notifications/inbox-page.component').then((m) => m.InboxPageComponent) },
];
