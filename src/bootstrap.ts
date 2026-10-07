import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

/**
 * Opened on its own, this remote has no session, no gateway and no HttpClient: those belong to the
 * shell (norm 5.4.1). It only says where to see it.
 */
@Component({
  selector: 'nt-root',
  template: `
    <main style="font-family: sans-serif; color: #fff; background: #121212; min-height: 100vh; padding: 2rem;">
      <h1>barber-saas-notifications-app</h1>
      <p>This domain app runs inside the shell. Start barber-saas-front and open
        <a style="color: #d4af37" href="http://localhost:4200/notifications">http://localhost:4200/notifications</a>
        signed in with any role.</p>
    </main>
  `,
})
class StandaloneNotice {}

bootstrapApplication(StandaloneNotice, { providers: [provideZonelessChangeDetection()] })
  .catch((err) => console.error(err));
