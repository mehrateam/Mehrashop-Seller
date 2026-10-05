import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/LoginForm"

export const metadata: Metadata = {
  title: "ورود",
}

export default function LoginPage() {
  return (
    <main className="flex min-h-svh flex-col lg:flex-row">
      <section className="hidden flex-col justify-center gap-8 bg-[#f3f6ec] px-12 py-12 lg:flex lg:flex-[1.15] xl:px-16">
        <div className="flex max-w-xl flex-col gap-4">
          <h1 className="text-[1.7rem] leading-snug font-bold tracking-tight text-foreground">
            فروشنده و همکار گرامی، به بازارگاه بزرگ مهراشاپ خوش آمدید!
          </h1>
          <p className="text-sm leading-8 text-muted-foreground">
            اگر صاحب یک فروشگاه، کارگاه خانگی، تولیدکننده بومی یا هر نوع برند سلامت‌محور هستید، این
            فرصت برای شماست تا فروش حرفه‌ای خود را در یک بازارگاه تخصصی و محیط زیستی آغاز کنید.
            <br />
            مهراشاپ، بازارگاهی آنلاین (Market Place) است که به شکل تخصصی بر محصولات گیاهی، ارگانیک،
            طبیعی، و وگان تمرکز دارد. مأموریت ما حمایت از زمین و طبیعت، سلامتی انسان و گسترش سبک
            زندگی پایدار است. بنابراین مهراشاپ میزبان محصولاتی است که می‌تواند به این رسالت کمک کند و
            به همین دلیل، فروش کالاهایی که شامل گوشت، چرم طبیعی و خز باشد در مهراشاپ مجاز نیست.
          </p>
        </div>
        <img src="/brand/login-art.svg" alt="" className="w-full max-w-xl" />
      </section>

      <section className="flex flex-1 items-center justify-center px-5 py-10 lg:flex-none lg:basis-[42%]">
        <div className="flex w-full max-w-[400px] flex-col items-center gap-8">
          <img src="/brand/logo.svg" alt="مهراشاپ" className="h-16 w-auto" />
          <LoginForm />
        </div>
      </section>
    </main>
  )
}
