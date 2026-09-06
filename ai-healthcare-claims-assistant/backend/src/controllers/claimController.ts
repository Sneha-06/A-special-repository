import { asyncHandler } from "../utils/asyncHandler";
import { routeParam } from "../utils/routeParam";
import * as claimService from "../services/claimService";

export const list = asyncHandler(async (req, res) => {
  const result = await claimService.listClaims({
    search: String(req.query.search ?? ""),
    status: String(req.query.status ?? "ALL"),
    from: req.query.from ? String(req.query.from) : undefined,
    to: req.query.to ? String(req.query.to) : undefined,
    sort: String(req.query.sort ?? "serviceDate"),
    order: String(req.query.order ?? "desc"),
    page: Number(req.query.page ?? 1),
    pageSize: Number(req.query.pageSize ?? 10),
  });
  res.json(result);
});

export const getById = asyncHandler(async (req, res) => {
  const claim = await claimService.getClaimByClaimId(routeParam(req.params.id));
  res.json(claim);
});

export const analyze = asyncHandler(async (req, res) => {
  const result = await claimService.analyzeClaim(routeParam(req.params.id));
  res.json(result);
});
