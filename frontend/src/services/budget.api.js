import api from './api'

// READ
export const fetchBudgets = () => api.get('/budgets')
export const fetchBudgetById = (id) => api.get(`/budgets/${id}`)

// CREATE
export const createBudget = (data) => api.post('/budgets', data)

// UPDATE
export const updateBudget = (id, data) =>
  api.put(`/budgets/${id}`, data)

// DELETE
export const deleteBudget = (id) =>
  api.delete(`/budgets/${id}`)
