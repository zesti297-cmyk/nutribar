"use client";

import { useCallback, useMemo, useState } from "react";

/**
 * Seleção por checkbox com "selecionar todos", compartilhada entre as telas de
 * pacientes e leads.
 */
export function useSelection(allIds: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Ids que sumiram (linha excluída) não podem continuar marcados, senão uma
  // ação em lote agiria sobre algo que já não está no ecrã.
  const valid = useMemo(() => {
    const present = new Set(allIds);
    return new Set([...selected].filter((id) => present.has(id)));
  }, [allIds, selected]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => (prev.size === allIds.length ? new Set() : new Set(allIds)));
  }, [allIds]);

  const clear = useCallback(() => setSelected(new Set()), []);

  const allChecked = allIds.length > 0 && valid.size === allIds.length;

  return {
    selected: valid,
    count: valid.size,
    isSelected: (id: string) => valid.has(id),
    toggle,
    toggleAll,
    clear,
    allChecked,
    // Marca o "selecionar todos" como parcial quando só alguns estão marcados.
    someChecked: valid.size > 0 && !allChecked,
  };
}
