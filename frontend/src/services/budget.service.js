import { supabase } from '@/lib/supabase'

export async function fetchBudgetsByYear(year) {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('year', year)

  if (error) throw error
  return data
}
