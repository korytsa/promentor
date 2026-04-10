import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";
import { GoogleAuthProfile } from "../types/google-auth-profile.type";
import {
  GoogleAuthState,
  decodeGoogleAuthState,
} from "../utils/google-auth-state.util";

export type GoogleOAuthRequestUser = {
  profile: GoogleAuthProfile;
  state: GoogleAuthState;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} must be set for Google OAuth.`);
  }
  return value;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    super({
      clientID: getRequiredEnv("GOOGLE_CLIENT_ID"),
      clientSecret: getRequiredEnv("GOOGLE_CLIENT_SECRET"),
      callbackURL: getRequiredEnv("GOOGLE_CALLBACK_URL"),
      scope: ["email", "profile"],
      passReqToCallback: true,
    });
  }

  validate(
    req: Request,
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const primaryEmail = profile.emails?.[0]?.value?.trim().toLowerCase();
    if (!primaryEmail) {
      done(new UnauthorizedException("Google account has no email."), false);
      return;
    }

    const fullName =
      profile.displayName?.trim() ||
      [profile.name?.givenName, profile.name?.familyName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      primaryEmail;

    const state = decodeGoogleAuthState(req.query?.state);
    done(null, {
      profile: {
        email: primaryEmail,
        fullName,
      },
      state,
    });
  }
}
