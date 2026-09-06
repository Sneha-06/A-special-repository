import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { routeParam } from "../utils/routeParam";
import * as ruleService from "../services/ruleService";

export const compareSchema = z.object({
  leftRuleId: z.string().min(2),
  rightRuleId: z.string().min(2),
});

export const list = asyncHandler(async (req, res) => {
  const result = await ruleService.listRules({
    search: String(req.query.search ?? ""),
    category: String(req.query.category ?? "ALL"),
    status: String(req.query.status ?? "ALL"),
    sort: String(req.query.sort ?? "ruleId"),
    order: String(req.query.order ?? "asc"),
    page: Number(req.query.page ?? 1),
    pageSize: Number(req.query.pageSize ?? 12),
  });
  res.json(result);
});

export const getById = asyncHandler(async (req, res) => {
  const rule = await ruleService.getRule(routeParam(req.params.id));
  res.json(rule);
});

export const compare = asyncHandler(async (req, res) => {
  const { leftRuleId, rightRuleId } = compareSchema.parse(req.body);
  const result = await ruleService.compareRules(leftRuleId, rightRuleId);
  res.json(result);
});
