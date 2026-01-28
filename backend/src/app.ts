import { Elysia } from 'elysia'
import { budgetRoutes } from './routes/budget.route'

export const app = new Elysia()
  .use(budgetRoutes)
