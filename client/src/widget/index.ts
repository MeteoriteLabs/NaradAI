import { createRoot, Root } from "react-dom/client";
import { Widget } from "./Widget";
import { createElement } from "react";

export interface WidgetMountOptions {
  agentId: string;
  websocketUrl: string;
  apiBase?: string;
}

let widgetRoot: Root | null = null;

export function mount(container: HTMLElement, options: WidgetMountOptions) {
  if (widgetRoot) {
    widgetRoot.unmount();
  }

  widgetRoot = createRoot(container);
  widgetRoot.render(
    createElement(Widget, {
      agentId: options.agentId,
      websocketUrl: options.websocketUrl,
      apiBase: options.apiBase,
    })
  );
}

export function unmount() {
  if (widgetRoot) {
    widgetRoot.unmount();
    widgetRoot = null;
  }
}

if (typeof window !== "undefined") {
  (window as any).NaradaWidget = { mount, unmount };
}

export { Widget };
export * from "./core/types";
