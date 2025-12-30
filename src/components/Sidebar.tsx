"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Off Plan", href: "/properties/off-plan" },
  { name: "Secondary", href: "/properties/secondary" },
  { name: "Rent", href: "/properties/rent" },
  { name: "News", href: "/news" },
  { name: "Country", href: "/settings/location/country" },
  { name: "City", href: "/settings/location/city" },
  { name: "Area", href: "/settings/location/area" },
  { name: "API Key", href: "/api-key" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>
      <nav>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-4 py-2 rounded transition-colors ${
                  pathname === item.href
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-800"
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
