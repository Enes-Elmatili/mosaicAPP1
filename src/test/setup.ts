// ✅ Étend les matchers de Vitest avec jest-dom
import "@testing-library/jest-dom";

// ✅ Nettoie automatiquement le DOM entre les tests
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

// ✅ Optionnel : mock global de matchMedia (utile pour tests PWA / responsive)
if (!("matchMedia" in window)) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {}, // deprecated
      removeListener: () => {}, // deprecated
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// ✅ Optionnel : mock global de IntersectionObserver (utile pour lazy-loading, animations)
if (!("IntersectionObserver" in window)) {
  class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // @ts-expect-error override global
  window.IntersectionObserver = MockIntersectionObserver;
}
// ✅ Optionnel : mock global de ResizeObserver (utile pour responsive, animations)
if (!("ResizeObserver" in window)) {
  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // @ts-expect-error override global
  window.ResizeObserver = MockResizeObserver;
}