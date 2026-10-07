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

export type StepTwoOption = { id: number; fa_title: string }

export type StepTwoAttribute = {
  id: number
  fa_name: string
  data_type: string
  text_input_placeholder: string
  selective_attributes: StepTwoOption[]
  multi_options: StepTwoOption[]
}

export type StepTwoNamed = { id: number; fa_name: string; description?: string }

export type AttrDraft = { text: string; selective: number; multi: number[] }

export type StepTwoProduct = {
  id: number
  brand: number | null
  nature: number[]
  full_description: string | null
  important_tips: string[]
  product_age: string | null
  product_defects: string[]
  product_type: "new" | "stock"
  editable: boolean
  needs_seller_review: boolean
  used_placeholder_category: boolean
  is_completely_added: boolean
  status: string
  is_placeholder_category: boolean
  available_attributes: StepTwoAttribute[]
  available_brands: StepTwoNamed[]
  available_natures: StepTwoNamed[]
  attribute_values: Array<{
    attribute?: { id?: number }
    text_value?: string | null
    selective_value?: number | null
    multi_text_value?: number[]
  }>
}

export type StepTwoInput = {
  brand?: number
  full_description: string
  nature: number[]
  important_tips: string[]
  product_age: string
  product_defects: string[]
  attribute_values: Array<{ attribute: number; text_value?: string; selective_value?: number; multi_text_value?: number[] }>
}

export function plainText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim()
}

export function draftsFrom(step: StepTwoProduct) {
  const drafts: Record<number, AttrDraft> = {}
  step.available_attributes.forEach((attr) => {
    drafts[attr.id] = { text: "", selective: 0, multi: [] }
  })
  step.attribute_values.forEach((value) => {
    const id = Number(value.attribute?.id || 0)
    if (!drafts[id]) return
    drafts[id] = {
      text: value.text_value || "",
      selective: Number(value.selective_value || 0),
      multi: (value.multi_text_value || []).map(Number),
    }
  })
  return drafts
}

export function attributePayload(attributes: StepTwoAttribute[], drafts: Record<number, AttrDraft>) {
  const rows: StepTwoInput["attribute_values"] = []
  attributes.forEach((attr) => {
    const draft = drafts[attr.id] || { text: "", selective: 0, multi: [] }
    if (attr.data_type === "text" && draft.text.trim()) rows.push({ attribute: attr.id, text_value: draft.text.trim() })
    if (attr.data_type === "selective" && draft.selective) rows.push({ attribute: attr.id, selective_value: draft.selective })
    if (attr.data_type === "multi_text" && draft.multi.length) rows.push({ attribute: attr.id, multi_text_value: draft.multi })
  })
  return rows
}

export async function fetchStepTwo(productId: number) {
  const res = await apiFetch(`${ROOT}/step2/${productId}/`)
  return read<StepTwoProduct>(res)
}

export async function saveStepTwo(productId: number, body: StepTwoInput) {
  const res = await apiFetch(`${ROOT}/step2/${productId}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return read<StepTwoProduct>(res)
}
