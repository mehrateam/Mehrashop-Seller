import type { Metadata } from "next"
import Image from "next/image"
import { LoginForm } from "@/components/auth/LoginForm"

export const metadata: Metadata = {
  title: "ورود / ثبت نام",
}

export default function AuthPage() {
  return (
    <main className="flex min-h-svh flex-col lg:flex-row">
      <section className="order-2 flex flex-col justify-center gap-6 bg-[#f3f6ec] px-5 py-8 lg:order-1 lg:flex-[1.15] lg:gap-8 lg:px-12 lg:py-12 xl:px-16">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-3 lg:mx-0 lg:gap-4">
          <h1 className="text-xl leading-snug font-bold tracking-tight text-foreground sm:text-[1.7rem]">
            فروشنده و همکار گرامی، به بازارگاه بزرگ مهراشاپ خوش آمدید!
          </h1>
          <p className="text-sm leading-7 text-muted-foreground lg:leading-8">
            اگر صاحب یک فروشگاه، کارگاه خانگی، تولیدکننده بومی یا هر نوع برند سلامت‌محور هستید، این
            فرصت برای شماست تا فروش حرفه‌ای خود را در یک بازارگاه تخصصی و محیط زیستی آغاز کنید.
            <br />
            مهراشاپ، بازارگاهی آنلاین (Market Place) است که به شکل تخصصی بر محصولات گیاهی، ارگانیک،
            طبیعی، و وگان تمرکز دارد. مأموریت ما حمایت از زمین و طبیعت، سلامتی انسان و گسترش سبک
            زندگی پایدار است. بنابراین مهراشاپ میزبان محصولاتی است که می‌تواند به این رسالت کمک کند و
            به همین دلیل، فروش کالاهایی که شامل گوشت، چرم طبیعی و خز باشد در مهراشاپ مجاز نیست.
          </p>
        </div>
        <Image
          src="/brand/login-art.svg"
          alt=""
          width={345}
          height={143}
          className="mx-auto h-auto w-full max-w-xl lg:mx-0"
        />
      </section>

      <section className="order-1 flex flex-1 items-center justify-center px-5 py-10 lg:order-2 lg:flex-none lg:basis-[42%]">
        <div className="flex w-full max-w-[400px] flex-col items-center gap-8">
          <Image src="/brand/logo.svg" alt="مهراشاپ" width={345} height={107} className="h-16 w-auto" />
          <LoginForm />
        </div>
      </section>
    </main>
  )
}
