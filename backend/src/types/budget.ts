
  export type Grade =
  | 'kg2'
  | 'kg3'
  | 'p1'
  | 'p2'
  | 'p3'
  | 'p4'
  | 'p5'
  | 'p6'
  | 'm1'
  | 'm2'
  | 'm3'

export type Level =
  | 'kindergarten'
  | 'primary'
  | 'secondary'

export type BudgetCreatePayload = {
  year: number
  level: Level
  grade: Grade
  amount: number
}
export type BudgetUpdatePayload = Partial<BudgetCreatePayload>
export const GRADE_LABEL: Record<Grade, string> = {
    kg2: 'อนุบาล 2',
    kg3: 'อนุบาล 3',
    p1: 'ประถมศึกษาปีที่ 1',
    p2: 'ประถมศึกษาปีที่ 2',
    p3: 'ประถมศึกษาปีที่ 3',
    p4: 'ประถมศึกษาปีที่ 4',
    p5: 'ประถมศึกษาปีที่ 5',
    p6: 'ประถมศึกษาปีที่ 6',
    m1: 'มัธยมศึกษาปีที่ 1',
    m2: 'มัธยมศึกษาปีที่ 2',
    m3: 'มัธยมศึกษาปีที่ 3',
  }
  