import { Elysia, t } from 'elysia'
import type { BudgetUpdatePayload } from '../types/budget'
import {
  getBudgets,
  createBudget,
  updateBudget
} from '../services/budget.service'

const BudgetUpdateSchema = t.Partial(
    t.Object({
      year: t.Number(),
      level: t.String(),
      grade: t.String(),
      amount: t.Number()
    })
  )
  
  type BudgetUpdateBody = typeof BudgetUpdateSchema.static
export const budgetRoutes = new Elysia({ prefix: '/budgets' })

  // ดึงงบทั้งหมด / filter ได้
  .get('/', ({ query }) => {
    const year = query.year ? Number(query.year) : undefined
    return getBudgets(year)
  })

  // เพิ่มงบ
  .post(
    '/',
    ({ body }) => createBudget(body),
    {
      body: t.Object({
        year: t.Number(),
        level: t.Union([
          t.Literal('kindergarten'),
          t.Literal('primary'),
          t.Literal('secondary'),
        ]),
        grade: t.Union([
            t.Literal('kg2'),
            t.Literal('kg3'),
            t.Literal('p1'),
            t.Literal('p2'),
            t.Literal('p3'),
            t.Literal('p4'),
            t.Literal('p5'),
            t.Literal('p6'),
            t.Literal('m1'),
            t.Literal('m2'),
            t.Literal('m3'),
          ]),
        amount: t.Number()
      })
    }
  )

  // แก้ไขงบ (Partial)
  .put(
    '/:id',
    ({ params, body }) => updateBudget(params.id,body as BudgetUpdatePayload),
    {
      body: t.Partial(
        t.Object({
          year: t.Number(),
          level: t.String(),
          grade: t.String(),
          amount: t.Number()
        })
      )
    }
  )
