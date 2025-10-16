import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Skeleton } from "@/components/ui/skeleton"

export default function InteracoesLoading() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-12 w-64" />
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-96" />
          </div>
        </main>
      </div>
    </div>
  )
}
