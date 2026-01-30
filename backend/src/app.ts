import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { budgetRoutes } from './routes/budget.route'
import { usersRoutes } from './routes/users.route'

export const app = new Elysia()
  .use(cors())
  .use(budgetRoutes)
  .use(usersRoutes)
