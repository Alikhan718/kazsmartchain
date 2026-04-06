function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSocialMealsConfig() {
  return {
    jasaimApiBaseUrl: getRequiredEnv('JASAIM_API_BASE_URL').replace(/\/+$/, ''),
    jasaimAdminToken: getRequiredEnv('SOCIAL_MEAL_ADMIN_TOKEN'),
    adminUsername: getRequiredEnv('SOCIAL_MEALS_ADMIN_USERNAME'),
    adminPassword: getRequiredEnv('SOCIAL_MEALS_ADMIN_PASSWORD'),
    sessionSecret: getRequiredEnv('SOCIAL_MEALS_SESSION_SECRET'),
  };
}
