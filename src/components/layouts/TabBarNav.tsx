"use client"

import * as React from "react"
import { NavLink } from "react-router-dom"
import { cn } from "@/lib/cx"

export type TabBarLink = {
  path: string
  label: string
  icon?: React.ReactNode
}

type TabBarNavProps = {
  links: TabBarLink[]
}

export function TabBarNav({ links }: TabBarNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t bg-white dark:bg-neutral-900 py-2">
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center text-xs font-medium transition",
              isActive
                ? "text-primary"
                : "text-gray-500 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-200"
            )
          }
        >
          {link.icon}
          <span>{link.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
