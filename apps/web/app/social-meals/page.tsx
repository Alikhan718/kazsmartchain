import { SocialMealsDashboard } from '../../components/social-meals/SocialMealsDashboard';
import { requireSocialMealsAuth } from '../../lib/social-meals/auth';
import { getAlmatyTimeZone, getTodayInAlmaty } from '../../lib/social-meals/date';

export default async function SocialMealsPage() {
  await requireSocialMealsAuth();

  return (
    <SocialMealsDashboard
      initialDate={getTodayInAlmaty()}
      timeZoneLabel={getAlmatyTimeZone()}
    />
  );
}
