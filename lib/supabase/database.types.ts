// Placeholder until the first migration exists. Replace by running:
//   npx supabase gen types typescript --local > lib/supabase/database.types.ts
export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
