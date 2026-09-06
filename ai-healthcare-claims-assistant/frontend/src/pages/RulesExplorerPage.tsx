import {
  Button,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
} from "@mui/material";
import { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { EmptyState, ErrorState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { StatusChip } from "../components/StatusChip";
import { useAppDispatch, useAppSelector } from "../hooks";
import { loadRules, setRuleFilters } from "../store/slices/rulesSlice";

export function RulesExplorerPage() {
  const dispatch = useAppDispatch();
  const { list, filters, status, error } = useAppSelector((state) => state.rules);

  useEffect(() => {
    void dispatch(loadRules());
  }, [dispatch, filters]);

  return (
    <>
      <PageHeader
        title="Mandate / rules explorer"
        subtitle="Synthetic PBM mandate catalog"
        crumbs={[{ label: "Home", to: "/" }, { label: "Rules" }]}
        actions={
          <Button component={RouterLink} to="/rules/compare" variant="contained">
            Compare rules
          </Button>
        }
      />
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            label="Search rules"
            value={filters.search}
            onChange={(event) => dispatch(setRuleFilters({ search: event.target.value, page: 1 }))}
            fullWidth
          />
          <TextField
            select
            label="Category"
            value={filters.category}
            onChange={(event) => dispatch(setRuleFilters({ category: event.target.value, page: 1 }))}
            sx={{ minWidth: 180 }}
          >
            {["ALL", "Eligibility", "Authorization", "Formulary", "Utilization", "Network", "Clinical", "Coverage"].map(
              (value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ),
            )}
          </TextField>
          <TextField
            select
            label="Status"
            value={filters.status}
            onChange={(event) => dispatch(setRuleFilters({ status: event.target.value, page: 1 }))}
            sx={{ minWidth: 140 }}
          >
            {["ALL", "ACTIVE", "INACTIVE", "DRAFT"].map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>
      {error ? <ErrorState message={error} onRetry={() => void dispatch(loadRules())} /> : null}
      {!list?.items.length && status !== "loading" ? (
        <EmptyState title="No rules found" description="Try a different category or search term." />
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={filters.sort === "ruleId"}
                    direction={filters.order === "asc" ? "asc" : "desc"}
                    onClick={() =>
                      dispatch(
                        setRuleFilters({
                          sort: "ruleId",
                          order: filters.order === "asc" ? "desc" : "asc",
                        }),
                      )
                    }
                  >
                    Rule ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>Rule name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Effective date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list?.items.map((rule) => (
                <TableRow key={rule.ruleId} hover>
                  <TableCell>{rule.ruleId}</TableCell>
                  <TableCell>{rule.name}</TableCell>
                  <TableCell>{rule.category}</TableCell>
                  <TableCell>{new Date(rule.effectiveDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <StatusChip status={rule.status} />
                  </TableCell>
                  <TableCell>
                    <Button size="small" component={RouterLink} to={`/rules/${rule.ruleId}`}>
                      View
                    </Button>
                    <Button
                      size="small"
                      component={RouterLink}
                      to={`/rules/compare?left=${rule.ruleId}&right=MR-305`}
                    >
                      Compare
                    </Button>
                    <Button
                      size="small"
                      component={RouterLink}
                      to={`/assistant?q=${encodeURIComponent(`Explain rule ${rule.ruleId} eligibility requirements`)}`}
                    >
                      Ask AI
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={list?.total ?? 0}
            page={(filters.page ?? 1) - 1}
            onPageChange={(_event, page) => dispatch(setRuleFilters({ page: page + 1 }))}
            rowsPerPage={12}
            rowsPerPageOptions={[12]}
          />
        </Paper>
      )}
    </>
  );
}
