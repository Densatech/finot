import { useEffect, useState } from "react";

/** True once the element (by id) or the window has scrolled past `threshold` pixels. */
export function useScrolled(elementId?: string, threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const target: HTMLElement | Window | null = elementId ? document.getElementById(elementId) : window;
    if (!target) return;
    const read = () =>
      setScrolled((target instanceof Window ? target.scrollY : target.scrollTop) > threshold);
    read();
    target.addEventListener("scroll", read, { passive: true });
    return () => target.removeEventListener("scroll", read);
  }, [elementId, threshold]);
  return scrolled;
}
