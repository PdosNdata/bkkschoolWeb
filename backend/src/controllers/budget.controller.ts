import * as budgetService from '../services/budget.service'
import type { Request, Response } from 'express'

export const listBudgets = async (req: Request, res: Response) => {
  try {
    const data = await budgetService.getBudgets()
    res.json(data)
  } catch (err: any) {
    res.status(500).json({ message: err instanceof Error ? err.message : String(err) })
  }
}

export const getBudget = async (req: any, res: any) => {
  try {
    const data = await budgetService.getBudgets(req.params.id)
    res.json(data)
  } catch (err) {
    res.status(404).json({ message: 'ไม่พบข้อมูลงบประมาณ' })
  }
}

export const createBudget = async (req: any, res: any) => {
  try {
    const data = await budgetService.createBudget(req.body)
    res.status(201).json(data)
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}

export const updateBudget = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const data = await budgetService.updateBudget(id, req.body)
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ message: err instanceof Error ? err.message : String(err) })
  }
}

export const deleteBudget = async (req: Request, res: Response) => {
  try {
    await budgetService.deleteBudget(req.params.id)
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}
