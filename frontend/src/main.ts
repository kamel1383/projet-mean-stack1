/**
 * main.ts — Angular Application Bootstrap Entry Point
 *
 * Launches the standalone root `App` component in the browser using the providers
 * configured in `app.config.ts` (Router, HttpClient, JWT Interceptor).
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
