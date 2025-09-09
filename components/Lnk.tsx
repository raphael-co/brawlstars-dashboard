"use client";
import Link from "next/link";

import { useI18n } from "@/components/T";

export function Lnk({ href, children, ...rest }: any) {
  const { locale } = useI18n();
  const to = `/${locale}${String(href).startsWith("/") ? href : `/${href}`}`;
  return <Link href={to} {...rest}>{children}</Link>;
}
