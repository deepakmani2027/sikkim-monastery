"use client"
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

type Props = React.ComponentProps<typeof NextThemesProvider> & {
  children?: React.ReactNode
}

export function ThemeProvider(props: Props) {
  return <NextThemesProvider {...props} />
}
