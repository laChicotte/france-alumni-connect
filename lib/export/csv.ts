type CsvRow = Record<string, unknown>

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return ""
  const stringValue = String(value)
  if (/[",;\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

function toCsvContent(rows: CsvRow[], separator = ";"): string {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const headerLine = headers.map((h) => escapeCsvValue(h)).join(separator)
  const dataLines = rows.map((row) => headers.map((h) => escapeCsvValue(row[h])).join(separator))
  return [headerLine, ...dataLines].join("\n")
}

export function downloadCsv(filename: string, rows: CsvRow[]): void {
  const content = toCsvContent(rows)
  const bom = "\uFEFF"
  const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.setAttribute("download", filename)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
