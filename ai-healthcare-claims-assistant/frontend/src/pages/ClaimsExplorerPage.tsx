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
  Tooltip,
} from "@mui/material";
import { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { EmptyState, ErrorState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { StatusChip } from "../components/StatusChip";
import { useAppDispatch, useAppSelector } from "../hooks";
import { loadClaims, setClaimFilters } from "../store/slices/claimsSlice";

export function ClaimsExplorerPage() {
  const dispatch = useAppDispatch();
  const { list, status, error, filters } = useAppSelector((state) => state.claims);

  useEffect(() => {
    void dispatch(loadClaims());
  }, [dispatch, filters]);

  const toggleSort = (field: string) => {
    const order = filters.sort === field && filters.order === "asc" ? "desc" : "asc";
    dispatch(setClaimFilters({ sort: field, order, page: 1 }));
  };

  return (
    <>
      <PageHeader
        title="Claims explorer"
        subtitle="Search and filter the synthetic adjudication book"
        crumbs={[{ label: "Home", to: "/" }, { label: "Claims" }]}
      />
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            label="Search claim, member, provider, or service"
            value={filters.search}
            onChange={(event) => dispatch(setClaimFilters({ search: event.target.value, page: 1 }))}
            fullWidth
          />
          <TextField
            select
            label="Status"
            value={filters.status}
            onChange={(event) => dispatch(setClaimFilters({ status: event.target.value, page: 1 }))}
            sx={{ minWidth: 160 }}
          >
            {["ALL", "APPROVED", "REJECTED", "PENDING", "REVIEW"].map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            type="date"
            label="From"
            InputLabelProps={{ shrink: true }}
            value={filters.from}
            onChange={(event) => dispatch(setClaimFilters({ from: event.target.value, page: 1 }))}
          />
          <TextField
            type="date"
            label="To"
            InputLabelProps={{ shrink: true }}
            value={filters.to}
            onChange={(event) => dispatch(setClaimFilters({ to: event.target.value, page: 1 }))}
          />
        </Stack>
      </Paper>
      {error ? <ErrorState message={error} onRetry={() => void dispatch(loadClaims())} /> : null}
      {!list?.items.length && status !== "loading" ? (
        <EmptyState title="No claims match these filters" description="Adjust search or status and try again." />
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={filters.sort === "claimId"}
                    direction={filters.order === "asc" ? "asc" : "desc"}
                    onClick={() => toggleSort("claimId")}
                  >
                    Claim ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>Member ID</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Provider</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={filters.sort === "serviceDate"}
                    direction={filters.order === "asc" ? "asc" : "desc"}
                    onClick={() => toggleSort("serviceDate")}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={filters.sort === "submittedAmount"}
                    direction={filters.order === "asc" ? "asc" : "desc"}
                    onClick={() => toggleSort("submittedAmount")}
                  >
                    Amount
                  </TableSortLabel>
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Rejection reason</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list?.items.map((claim) => (
                <TableRow key={claim.claimId} hover>
                  <TableCell>{claim.claimId}</TableCell>
                  <TableCell>{claim.member.memberId}</TableCell>
                  <TableCell>{claim.serviceName}</TableCell>
                  <TableCell>{claim.provider.name}</TableCell>
                  <TableCell>{new Date(claim.serviceDate).toLocaleDateString()}</TableCell>
                  <TableCell>${claim.submittedAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <StatusChip status={claim.status} />
                  </TableCell>
                  <TableCell>{claim.rejectionReason ?? "—"}</TableCell>
                  <TableCell>
                    <Tooltip title="Open claim record">
                      <Button size="small" component={RouterLink} to={`/claims/${claim.claimId}`}>
                        View
                      </Button>
                    </Tooltip>
                    <Button size="small" component={RouterLink} to={`/claims/${claim.claimId}?analyze=1`}>
                      Analyze
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
            onPageChange={(_event, page) => dispatch(setClaimFilters({ page: page + 1 }))}
            rowsPerPage={filters.pageSize}
            onRowsPerPageChange={(event) =>
              dispatch(setClaimFilters({ pageSize: Number(event.target.value), page: 1 }))
            }
          />
        </Paper>
      )}
    </>
  );
}
