import * as XLSX from 'xlsx';

interface SheetData {
  sheetName: string;
  rows: Record<string, any>[];
}

export const exportToExcel = (data: SheetData[], filename: string) => {
  const wb = XLSX.utils.book_new();

  data.forEach(({ sheetName, rows }) => {
    if (rows.length === 0) {
      const ws = XLSX.utils.aoa_to_sheet([['Sem dados']]);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    } else {
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }
  });

  XLSX.writeFile(wb, `${filename}.xlsx`);
};
