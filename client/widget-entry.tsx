import { createRoot } from "react-dom/client";
import { Widget } from "./src/widget/Widget";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./src/lib/queryClient";
import "./src/index.css";

interface MountOptions {
  agentId: string;
  websocketUrl: string;
}

function mount(container: HTMLElement, options: MountOptions) {
  const root = createRoot(container);
  
  root.render(
    <QueryClientProvider client={queryClient}>
      <Widget agentId={options.agentId} websocketUrl={options.websocketUrl} />
    </QueryClientProvider>
  );

  return {
    unmount: () => {
      root.unmount();
    },
  };
}

(window as any).NaradaWidget = {
  mount,
};

export { mount };
