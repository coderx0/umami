import {
  createSemanticProjector,
  type SemanticAppContext,
  type SemanticProjector,
  type SemanticWarning,
} from '@agent-om/core';

// The app's one projector (the Agent Object Model), on window.__semanticUI where
// the chat (and any other consumer) finds it. Its warnings are kept on
// window.__semanticWarnings for the chat's "what Claude sees" view.

declare global {
  interface Window {
    __semanticUI?: SemanticProjector;
    __semanticWarnings?: SemanticWarning[];
  }
}

/** What the projector's context is made of; AgentOm.tsx keeps it current. */
export const appContext: { screen?: string; loading?: boolean } = {};

/**
 * Screen name from the path and the route's params: a segment that is a
 * param's value is named by the param.
 * "/websites/<id>/sessions" → "websites.website-id.sessions", "/" → "home".
 */
export function screenOf(pathname: string, params: Record<string, string | string[]> = {}) {
  const names = new Map<string, string>();
  for (const [name, value] of Object.entries(params)) {
    for (const v of Array.isArray(value) ? value : [value]) {
      names.set(v, name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
    }
  }
  const segments = pathname
    .split('/')
    .filter(Boolean)
    .map(seg => names.get(decodeURIComponent(seg)) ?? seg);
  return segments.length ? segments.join('.') : 'home';
}

/**
 * The page's address as the projector sees it, without the secrets some pages
 * carry in it (guidelines 4.5): /sso is opened with a sign-in token.
 */
export function locationWithoutSecrets(href = window.location.href) {
  const url = new URL(href);
  if (url.pathname.endsWith('/sso')) url.searchParams.delete('token');
  return url.href;
}

/** Start the projector once per document (safe across fast refresh). */
export function startProjection(): SemanticProjector {
  if (window.__semanticUI) return window.__semanticUI;
  const warnings: SemanticWarning[] = [];
  window.__semanticWarnings = warnings;
  const projector = createSemanticProjector({
    context: (): SemanticAppContext => ({
      screen: appContext.screen,
      state: appContext.loading ? 'loading' : 'ready',
    }),
    location: () => locationWithoutSecrets(),
    onWarning: warning => {
      warnings.push(warning);
      // eslint-disable-next-line no-console
      console.warn(`[agent-om] ${warning.code}: ${warning.message}`);
    },
  });
  window.__semanticUI = projector;
  return projector;
}

/**
 * `resolveTarget` for the action executor: node id → element. Projects first
 * (only if changes are pending), so nodes rendered moments ago resolve too.
 */
export function nodeResolver(projector: SemanticProjector) {
  return (id: string) => {
    projector.snapshot();
    return projector.resolve(id);
  };
}
