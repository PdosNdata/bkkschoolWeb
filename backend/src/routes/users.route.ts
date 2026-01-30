import { Elysia, t } from 'elysia'
import { supabase } from '../db/supabase'

export const usersRoutes = new Elysia({ prefix: '/users' })

  // ดึงผู้ใช้ทั้งหมด
  .get('/', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('GET /users error:', error)
      return { error: error.message }
    }
    return data || []
  })

  // อัพเดทข้อมูลผู้ใช้
  .put(
    '/:id',
    async ({ params, body }) => {
      const { error } = await supabase
        .from('users')
        .update(body)
        .eq('id', params.id)

      if (error) {
        console.error('PUT /users error:', error)
        return { error: error.message }
      }
      return { success: true }
    },
    {
      body: t.Partial(
        t.Object({
          role: t.String(),
          is_active: t.Boolean(),
          homeroom_grade: t.Nullable(t.String()),
          homeroom_room: t.Nullable(t.String()),
        })
      )
    }
  )
