import {
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

interface DropdownMenuProps {
  id: string;
  trigger: (params: {
    isOpen: boolean;
    onToggle: () => void;
    triggerRef: RefObject<HTMLButtonElement | null>;
  }) => ReactNode;
  children: (params: { closeMenu: () => void }) => ReactNode;
  firstMenuItemRef?: RefObject<HTMLElement | null>;
  containerClassName?: string;
  panelClassName?: string;
}

export const DropdownMenu = ({
  id,
  trigger,
  children,
  firstMenuItemRef,
  containerClassName = "relative",
  panelClassName,
}: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const resolvedPanelClassName =
    panelClassName ??
    "absolute right-0 top-14 w-56 p-1 rounded-lg shadow-xl z-[70] backdrop-blur-3xl overflow-hidden transition-all duration-200 border bg-white/95 border-slate-200 shadow-slate-300/40 dark:bg-slate-800 dark:border-white/5 dark:shadow-xl";

  const closeMenu = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;

    firstMenuItemRef?.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, firstMenuItemRef, id]);

  return (
    <div className={containerClassName}>
      {trigger({ isOpen, onToggle: toggleMenu, triggerRef })}

      {isOpen && (
        <>
          {typeof document !== "undefined" &&
            createPortal(
              <div
                className="fixed inset-0 backdrop-blur-[1px] bg-slate-900/5 dark:bg-black/30"
                aria-hidden="true"
              />,
              document.body,
            )}
          <div
            id={id}
            ref={panelRef}
            role="menu"
            className={resolvedPanelClassName}
          >
            {children({ closeMenu })}
          </div>
        </>
      )}
    </div>
  );
};
