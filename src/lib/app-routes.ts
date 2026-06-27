export const APP_ROUTES = {
  dashboard: "/",
  finances: "/finances",
  learning: "/learning",
  projects: "/projects",
} as const;

export const REVALIDATE_ALL_ROUTES = [
  APP_ROUTES.dashboard,
  APP_ROUTES.finances,
  APP_ROUTES.learning,
  APP_ROUTES.projects,
] as const;
