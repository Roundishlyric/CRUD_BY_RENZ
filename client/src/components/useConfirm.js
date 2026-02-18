import { useCallback, useRef, useState } from "react";
import ConfirmModal from "./ConfirmModal";

/**
 * Promise-based confirm dialog.
 * Usage:
 *   const { confirm, ConfirmDialog } = useConfirm();
 *   const ok = await confirm({ title, message, variant, confirmText });
 *   return (
 *     <> ... <ConfirmDialog/> </>
 *   )
 */
export default function useConfirm() {
  const resolverRef = useRef(null);
  const [state, setState] = useState({
    isOpen: false,
    title: "Confirm",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "default",
  });

  const confirm = useCallback((opts = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState((s) => ({
        ...s,
        isOpen: true,
        title: opts.title ?? "Confirm",
        message: opts.message ?? "",
        confirmText: opts.confirmText ?? "Confirm",
        cancelText: opts.cancelText ?? "Cancel",
        variant: opts.variant ?? "default",
      }));
    });
  }, []);

  const close = useCallback((result) => {
    setState((s) => ({ ...s, isOpen: false }));
    const r = resolverRef.current;
    resolverRef.current = null;
    r?.(result);
  }, []);

  const ConfirmDialog = useCallback(() => {
    return (
      <ConfirmModal
        isOpen={state.isOpen}
        title={state.title}
        message={state.message}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        variant={state.variant}
        onConfirm={() => close(true)}
        onCancel={() => close(false)}
      />
    );
  }, [state, close]);

  return { confirm, ConfirmDialog };
}
