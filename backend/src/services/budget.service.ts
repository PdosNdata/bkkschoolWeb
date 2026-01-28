import { supabase } from '../db/supabase'
import type {
  BudgetCreatePayload,
  BudgetUpdatePayload
} from '../types/budget'

export const getBudgets = async (year?: number) => {
  let query = supabase.from('budgets').select('*')
  if (year) query = query.eq('year', year)
  return query
}

export const createBudget = async (payload: BudgetCreatePayload) => {
  return supabase.from('budgets').insert(payload)
}

export const updateBudget = async (
  id: string,
  payload: BudgetUpdatePayload
) => {
  return supabase.from('budgets').update(payload).eq('id', id)
}
export function deleteBudget(id: any) {
  throw new Error('Function not implemented.')
}

