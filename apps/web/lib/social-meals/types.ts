export type SocialMealsSummary = {
  meal_date: string;
  active_members: number;
  declarations_submitted: number;
  students_planning_to_attend: number;
  planned_breakfasts: number;
  planned_lunches: number;
  planned_dinners: number;
  planned_total_meals: number;
  total_possible_meals: number;
  actual_redemptions: number;
};

export type SocialMealsStudent = {
  student_id: string;
  full_name: string;
  email: string;
  is_member: boolean;
  wants_breakfast: boolean;
  wants_lunch: boolean;
  wants_dinner: boolean;
  planned_meals_count: number;
  redemptions_count: number;
};

export type SocialMealsStudentsResponse = {
  meal_date: string;
  students: SocialMealsStudent[];
};
