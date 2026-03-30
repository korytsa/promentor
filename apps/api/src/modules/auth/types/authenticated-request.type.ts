import { Request } from "express";
import { JwtPayload } from "./jwt-payload.type";

export type AuthenticatedRequest = Request & { user?: JwtPayload };
