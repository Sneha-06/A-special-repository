import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Button, ListItemText, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import type { TestCase } from "../../types/testCase";
import {
  exportTestCasesCsv,
  exportTestCasesExcel,
  exportTestCasesJson,
} from "../../utils/export";

interface ExportTestCasesMenuProps {
  testCases: TestCase[];
  requirementTitle?: string;
  disabled?: boolean;
}

export function ExportTestCasesMenu({
  testCases,
  requirementTitle,
  disabled,
}: ExportTestCasesMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleExport = (format: "csv" | "excel" | "json") => {
    if (testCases.length === 0) return;
    if (format === "csv") exportTestCasesCsv(testCases, requirementTitle);
    if (format === "excel") exportTestCasesExcel(testCases, requirementTitle);
    if (format === "json") exportTestCasesJson(testCases, requirementTitle);
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<FileDownloadOutlinedIcon />}
        disabled={disabled || testCases.length === 0}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        Export
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => handleExport("csv")}>
          <ListItemText primary="CSV" secondary="Comma-separated spreadsheet" />
        </MenuItem>
        <MenuItem onClick={() => handleExport("excel")}>
          <ListItemText primary="Excel" secondary=".xlsx workbook" />
        </MenuItem>
        <MenuItem onClick={() => handleExport("json")}>
          <ListItemText primary="JSON" secondary="Full structured export" />
        </MenuItem>
      </Menu>
    </>
  );
}
