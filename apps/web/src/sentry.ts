import * as Sentry from '@sentry/vue'
import { BrowserTracing } from '@sentry/tracing'
import type { App } from 'vue'
import type { Router } from 'vue-router'

export function initSentry(app: App<Element>, router: Router): void {
  if (!import.meta.env.PROD) {
    return
  }

  Sentry.init({
    app,
    logErrors: true,
    dsn: 'https://767cd1d908624b83a55c8e4cbed7867f@o1407583.ingest.sentry.io/6742285',
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        tracingOrigins: ["api.locksend.app", /^\//],
      }),
    ],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
}
