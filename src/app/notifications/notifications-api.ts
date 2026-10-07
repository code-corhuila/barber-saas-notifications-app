import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Http, NotificationsCalls } from './notifications-calls';

/** The calls, over the shell's HttpClient (it is the only one of the app, norm 5.4.1). */
@Injectable({ providedIn: 'root' })
export class NotificationsApi extends NotificationsCalls {
  constructor() {
    super(inject(HttpClient) as unknown as Http);
  }
}
