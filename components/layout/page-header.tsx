import type { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8 pb-6 border-b border-black/10">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-black">{title}</h1>
        {description && <p className="text-base text-black/60 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
