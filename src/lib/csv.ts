/**
 * Gera e baixa um CSV no próprio navegador — sem ida ao servidor, sem
 * dependência nova.
 */

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  // Um campo com vírgula, aspas ou quebra de linha precisa de aspas, e cada
  // aspa interna vira duas — sem isso o Excel quebra a linha em colunas erradas.
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  return [headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n");
}

// O BOM faz o Excel ler o ficheiro como UTF-8 — sem ele, "País" fica "PaÃ­s".
const BOM = "\uFEFF";

export function downloadCsv(filename: string, headers: string[], rows: unknown[][]) {
  const blob = new Blob([BOM + toCsv(headers, rows)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Sufixo de data para o nome do ficheiro: pacientes-2026-07-16.csv */
export function dateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}
