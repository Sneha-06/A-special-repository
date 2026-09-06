import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { routeParam } from "../utils/routeParam";
import * as aiService from "../services/aiService";
import * as claimService from "../services/claimService";

export const chatSchema = z.object({
  question: z.string().min(3),
  conversationId: z.string().uuid().optional(),
});

export const analyzeClaimSchema = z.object({
  claimId: z.string().min(3),
});

export const chat = asyncHandler(async (req, res) => {
  const { question, conversationId } = chatSchema.parse(req.body);
  const result = await aiService.chat(question, conversationId, req.user?.id);
  res.json(result);
});

export const analyzeClaim = asyncHandler(async (req, res) => {
  const { claimId } = analyzeClaimSchema.parse(req.body);
  const result = await claimService.analyzeClaim(claimId);
  res.json(result);
});

export const conversations = asyncHandler(async (_req, res) => {
  const items = await aiService.listConversations();
  res.json({ items });
});

export const conversation = asyncHandler(async (req, res) => {
  const item = await aiService.getConversation(routeParam(req.params.id));
  res.json(item);
});
