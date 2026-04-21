import { lazy } from "react";

export const TeamsPage = lazy(() => import("coachingApp/TeamsPage"));
export const BoardsPage = lazy(() => import("coachingApp/BoardsPage"));
export const ExploreTeamsPage = lazy(
  () => import("coachingApp/ExploreTeamsPage"),
);
export const MentorsPage = lazy(() => import("coachingApp/MentorsPage"));
export const SuggestionPage = lazy(() => import("coachingApp/SuggestionPage"));
export const RequestsPage = lazy(() => import("coachingApp/RequestsPage"));
export const ProfilePage = lazy(() => import("coachingApp/ProfilePage"));
