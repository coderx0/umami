import { actionableNodes, type SemanticNode } from '@agent-om/core';
import { whatClaudeSees } from './use-claude';

// Dev only: the guidelines' automatic checks on the current page
// (../agent-om/docs/guidelines.md, "How to check"), with Claude's view of it.
// Run `await __agentOmCheck()` in the console, or from a script.

declare global {
  interface Window {
    __agentOmCheck?: () => Promise<PageCheck>;
  }
}

export type PageCheck = {
  path: string;
  title?: string;
  screen?: unknown;
  state?: unknown;
  modalId?: string;
  /** every projector warning so far (codes: invalid-value, metadata-without-id, duplicate-id, …) */
  warnings: string[];
  /** 1.3: actionable elements without a name */
  unnamed: string[];
  /** 1.15: search fields without a description of what they match */
  searchWithoutDescription: string[];
  /** 1.16: controls that open choices without naming them */
  choicesUnnamed: string[];
  /** Claude's full view of the page */
  view: string;
};

function searchFields(n: SemanticNode, inSearch = false): SemanticNode[] {
  return [
    ...(n.role === 'searchbox' || (inSearch && n.role === 'textbox') ? [n] : []),
    ...(n.children ?? []).flatMap(c => searchFields(c, inSearch || n.role === 'search')),
  ];
}

export async function checkPage(): Promise<PageCheck> {
  const projector = window.__semanticUI;
  if (!projector) throw new Error('The projector is not running.');
  const view = await whatClaudeSees();
  const state = projector.snapshot();
  const actionable = actionableNodes(state);
  return {
    path: String(state.context.path),
    title: state.context.title as string | undefined,
    screen: state.context.screen,
    state: state.context.state,
    modalId: state.context.modalId as string | undefined,
    warnings: (window.__semanticWarnings ?? []).map(w => `${w.code}: ${w.message}`),
    unnamed: actionable.filter(n => !n.name).map(n => n.id),
    searchWithoutDescription: searchFields(state.root)
      .filter(n => !n.description)
      .map(n => n.id),
    choicesUnnamed: actionable
      .filter(n => (n.haspopup || n.role === 'combobox') && !n.items && !n.description)
      .map(n => n.id),
    view,
  };
}
