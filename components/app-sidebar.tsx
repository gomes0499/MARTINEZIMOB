"use client";

import * as React from "react";
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
  Settings,
  HelpCircle,
} from "lucide-react";
import Image from "next/image";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

const data = {
  user: {
    name: "Marina Martins",
    email: "marinamrezende6@gmail.com",
    avatar: "/marina.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Proprietários",
      url: "/proprietarios",
      icon: Users,
    },
    {
      title: "Inquilinos",
      url: "/inquilinos",
      icon: UserCheck,
    },
    {
      title: "Imóveis",
      url: "/imoveis",
      icon: Building2,
    },
    {
      title: "Contratos",
      url: "/contratos",
      icon: FileText,
    },
    {
      title: "Pagamentos",
      url: "/pagamentos",
      icon: DollarSign,
    },
  ],
  navSecondary: [
    {
      title: "Relatórios",
      url: "/relatorios",
      icon: BarChart3,
    },
    {
      title: "Interações",
      url: "/interacoes",
      icon: MessageSquare,
    },
  ],
  documents: [
    {
      name: "Documentos",
      url: "/documentos",
      icon: FolderOpen,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <div className="flex items-center gap-2">
                  <Image
                    src="/martinez-logo-black.svg"
                    alt="Martinez"
                    width={150}
                    height={40}
                    className="h-auto"
                    priority
                  />
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
