export const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
]

export const JALALI_WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"]

export type Jalali = { jy: number; jm: number; jd: number }

function div(a: number, b: number) {
  return ~~(a / b)
}

function mod(a: number, b: number) {
  return a - ~~(a / b) * b
}

function g2d(gy: number, gm: number, gd: number) {
  let day = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408
  day = day - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752
  return day
}

function d2g(jdn: number) {
  let j = 4 * jdn + 139361631
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908
  const i = div(mod(j, 1461), 4) * 5 + 308
  const gd = div(mod(i, 153), 5) + 1
  const gm = mod(div(i, 153), 12) + 1
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6)
  return { gy, gm, gd }
}

function jalCal(jy: number) {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178]
  const gy = jy + 621
  let leapJ = -14
  let jp = breaks[0]
  let jump = 0
  for (let i = 1; i < breaks.length; i += 1) {
    const jm = breaks[i]
    jump = jm - jp
    if (jy < jm) break
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4)
    jp = jm
  }
  let n = jy - jp
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4)
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150
  const march = 20 + leapJ - leapG
  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33
  let leap = mod(mod(n + 1, 33) - 1, 4)
  if (leap === -1) leap = 4
  return { leap, gy, march }
}

function j2d(jy: number, jm: number, jd: number) {
  const r = jalCal(jy)
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1
}

function d2j(jdn: number): Jalali {
  const gy = d2g(jdn).gy
  let jy = gy - 621
  const r = jalCal(jy)
  const k0 = jdn - g2d(gy, 3, r.march)
  let k = k0
  if (k >= 0) {
    if (k <= 185) return { jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 }
    k -= 186
  } else {
    jy -= 1
    k += 179
    if (r.leap === 1) k += 1
  }
  return { jy, jm: 7 + div(k, 30), jd: mod(k, 30) + 1 }
}

export function toJalaali(gy: number, gm: number, gd: number) {
  return d2j(g2d(gy, gm, gd))
}

export function toGregorian(jy: number, jm: number, jd: number) {
  return d2g(j2d(jy, jm, jd))
}

export function monthLength(jy: number, jm: number) {
  if (jm <= 6) return 31
  if (jm <= 11) return 30
  return jalCal(jy).leap === 0 ? 30 : 29
}

function pad(n: number) {
  return String(n).padStart(2, "0")
}

export function isoOf(j: Jalali) {
  const g = toGregorian(j.jy, j.jm, j.jd)
  return `${g.gy}-${pad(g.gm)}-${pad(g.gd)}`
}

export function todayIso() {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function partsOf(iso: string): Jalali | null {
  const [gy, gm, gd] = iso.slice(0, 10).split("-").map(Number)
  if (!gy || !gm || !gd) return null
  return toJalaali(gy, gm, gd)
}

export function jalaliLabel(iso: string) {
  const j = partsOf(iso)
  if (!j) return ""
  return `${j.jd} ${JALALI_MONTHS[j.jm - 1]} ${j.jy}`
}

export function shiftMonth(j: Jalali, delta: number): Jalali {
  const index = j.jy * 12 + (j.jm - 1) + delta
  const jy = Math.floor(index / 12)
  return { jy, jm: index - jy * 12 + 1, jd: 1 }
}

export function monthLead(jy: number, jm: number) {
  const g = toGregorian(jy, jm, 1)
  const date = new Date(g.gy, g.gm - 1, g.gd)
  return (date.getDay() + 1) % 7
}
