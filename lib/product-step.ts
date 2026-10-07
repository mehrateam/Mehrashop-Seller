import { apiFetch } from "@/lib/auth"

const ROOT = "/dashboard/api/02/products/seller"

type Ok<T> = { message?: unknown; data: T; is_success: boolean }

export type CategoryNode = {
  id: number
  name: string
  level: number
  stock_active: boolean
  commission: string
  is_placeholder: boolean
  children: CategoryNode[]
}

export type StepOneProduct = {
  id: number
  fa_name: string
  en_name: string
  meta_title: string
  meta_description: string
  product_type: "new" | "stock"
  is_original: boolean
  main_category: number | null
  sub_category: number[]
  used_placeholder_category: boolean
  needs_seller_review: boolean
  status: string
  is_placeholder_category: boolean
  is_completely_added: boolean
}

export type StepOneInput = {
  fa_name: string
  en_name: string
  meta_title: string
  meta_description: string
  product_type: "new" | "stock"
  is_original: boolean
  main_category: number
  sub_category: number[]
}

function failText(message: unknown) {
  if (typeof message === "string" && message) return message
  return "خطا در ارتباط با سرور"
}

async function read<T>(res: Response) {
  const body = (await res.json().catch(() => null)) as Ok<T> | null
  if (!res.ok || !body?.is_success) throw new Error(failText(body?.message))
  return body.data
}

export function findCategory(tree: CategoryNode[], id: number): CategoryNode | null {
  for (const node of tree) {
    if (node.id === id) return node
    const child = findCategory(node.children, id)
    if (child) return child
  }
  return null
}

export function categoryPath(tree: CategoryNode[], id: number): CategoryNode[] {
  const walk = (nodes: CategoryNode[], trail: CategoryNode[]): CategoryNode[] | null => {
    for (const node of nodes) {
      const next = [...trail, node]
      if (node.id === id) return next
      const found = walk(node.children, next)
      if (found) return found
    }
    return null
  }
  return id ? walk(tree, []) ?? [] : []
}

export function categoryOptions(tree: CategoryNode[], levels: number[], index: number) {
  if (index === 0) return tree
  return findCategory(tree, levels[index - 1] || 0)?.children ?? []
}

export function placeholderIds(tree: CategoryNode[]) {
  const ids: number[] = []
  let nodes = tree
  for (let level = 0; level < 4; level += 1) {
    const node = nodes.find((item) => item.is_placeholder)
    if (!node) return []
    ids.push(node.id)
    nodes = node.children
  }
  return ids
}

export function categoryLeaves(tree: CategoryNode[]) {
  const rows: CategoryNode[] = []
  const walk = (nodes: CategoryNode[]) => {
    nodes.forEach((node) => {
      if (node.level === 4 && !node.is_placeholder && node.children.length === 0) rows.push(node)
      else walk(node.children)
    })
  }
  walk(tree)
  return rows
}

export function canEditDetails(step: Pick<StepOneProduct, "used_placeholder_category" | "is_completely_added" | "status" | "is_placeholder_category">) {
  return (
    step.used_placeholder_category &&
    step.is_completely_added &&
    step.status !== "awaiting_category" &&
    step.is_placeholder_category === false
  )
}

export function commissionText(value: string) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return ""
  return Number.isInteger(amount) ? String(amount) : String(Number(amount.toFixed(2)))
}

export async function fetchCategories() {
  const res = await apiFetch(`${ROOT}/categories/`)
  return (await read<{ categories: CategoryNode[] }>(res)).categories
}

export async function fetchStepOne(productId: number) {
  const res = await apiFetch(`${ROOT}/step1/${productId}/`)
  return read<StepOneProduct>(res)
}

export async function saveStepOne(productId: number, body: StepOneInput) {
  const res = await apiFetch(productId ? `${ROOT}/step1/${productId}/` : `${ROOT}/step1/`, {
    method: productId ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return read<StepOneProduct>(res)
}
