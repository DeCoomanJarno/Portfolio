/* Global ambient type declarations for packages without bundled types */

declare module 'splitting' {
  interface SplittingOptions {
    target?: string | Element | Element[] | NodeList;
    by?: string;
    key?: string | null;
    matching?: string;
    whitespace?: boolean;
  }

  interface SplittingResult {
    el: Element;
    chars?: Element[];
    words?: Element[];
    lines?: Element[][];
    [key: string]: unknown;
  }

  export default function Splitting(options?: SplittingOptions): SplittingResult[];
}
