/** Tipado mínimo para GSAP cargado por CDN. */
declare const gsap: {
  registerPlugin: (...plugins: unknown[]) => void;
  set: (targets: string | Element | Element[] | NodeListOf<Element>, vars: Record<string, unknown>) => void;
  from: (targets: string | Element | Element[] | NodeListOf<Element>, vars: Record<string, unknown>) => unknown;
  to: (targets: string | Element | Element[] | NodeListOf<Element>, vars: Record<string, unknown>) => unknown;
  fromTo: (
    targets: string | Element | Element[] | NodeListOf<Element>,
    fromVars: Record<string, unknown>,
    toVars: Record<string, unknown>
  ) => unknown;
  timeline: (vars?: Record<string, unknown>) => {
    from: (
      targets: string | Element | Element[] | NodeListOf<Element>,
      vars: Record<string, unknown>,
      position?: string | number
    ) => unknown;
    to: (
      targets: string | Element | Element[] | NodeListOf<Element>,
      vars: Record<string, unknown>,
      position?: string | number
    ) => unknown;
  };
  matchMedia: () => {
    add: (query: string, handler: () => void | (() => void)) => void;
  };
};

declare const ScrollTrigger: {
  refresh: () => void;
};
