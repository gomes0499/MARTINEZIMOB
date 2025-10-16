"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Home,
  Users,
  UserCheck,
  Building2,
  FileText,
  DollarSign,
  BarChart3,
  FolderOpen,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: Users, label: "Proprietários", href: "/proprietarios" },
  { icon: UserCheck, label: "Inquilinos", href: "/inquilinos" },
  { icon: Building2, label: "Imóveis", href: "/imoveis" },
  { icon: FileText, label: "Contratos", href: "/contratos" },
  { icon: DollarSign, label: "Pagamentos", href: "/pagamentos" },
  { icon: BarChart3, label: "Relatórios", href: "/relatorios" },
  { icon: FolderOpen, label: "Documentos", href: "/documentos" },
  { icon: MessageSquare, label: "Interações", href: "/interacoes" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-black text-white h-screen fixed left-0 top-0 flex flex-col border-r border-white/10">
      <div className="p-6 border-b border-white/10">
        <Image
          src="/martinez-logo-black.svg"
          alt="Martinez Negócios Imobiliários"
          width={200}
          height={56}
          priority
        />
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "!bg-white !text-black font-medium"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-10 w-10 border-2 border-white/20">
            <AvatarFallback className="bg-white text-black font-semibold">
              MN
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              Martinez Negócios
            </p>
            <p className="text-xs text-white/60 truncate">
              contato@martinez.com.br
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
