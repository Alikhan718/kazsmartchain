import { getSocialMealsConfig } from './config';
import type {
  SocialMealsSummary,
  SocialMealsStudentsResponse,
} from './types';

async function fetchFromJasaim<T>(path: string): Promise<T> {
  const { jasaimApiBaseUrl, jasaimAdminToken } = getSocialMealsConfig();

  const response = await fetch(`${jasaimApiBaseUrl}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': jasaimAdminToken,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `Jasaim request failed (${response.status}): ${errorText || response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function getSocialMealsSummary(date: string): Promise<SocialMealsSummary> {
  return fetchFromJasaim<SocialMealsSummary>(
    `/api/v1/social-meals/admin/daily-summary?date=${encodeURIComponent(date)}`,
  );
}

export async function getSocialMealsStudents(date: string): Promise<SocialMealsStudentsResponse> {
  return fetchFromJasaim<SocialMealsStudentsResponse>(
    `/api/v1/social-meals/admin/students?date=${encodeURIComponent(date)}`,
  );
}
