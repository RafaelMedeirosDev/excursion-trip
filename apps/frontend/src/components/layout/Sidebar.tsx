import { NavLink } from "react-router-dom";
import { NAV_ITEMS, type NavGroup } from "@/constants/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const GROUPS: NavGroup[] = ["Operacional", "Administrativo"];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { hasRole } = useAuth();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || hasRole("ADM"),
  );
  const ungroupedItems = visibleItems.filter((item) => item.group === null);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center border-b px-4 font-semibold">
          Gestão de Excursões
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto p-3">
          <div className="space-y-1">
            {ungroupedItems.map((item) => (
              <SidebarLink key={item.href} item={item} onNavigate={onClose} />
            ))}
          </div>

          {GROUPS.map((group) => {
            const items = visibleItems.filter((item) => item.group === group);
            if (items.length === 0) return null;

            return (
              <div key={group} className="space-y-1">
                <p className="px-3 text-xs font-semibold uppercase text-muted-foreground">
                  {group}
                </p>
                {items.map((item) => (
                  <SidebarLink
                    key={item.href}
                    item={item}
                    onNavigate={onClose}
                  />
                ))}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

interface SidebarLinkProps {
  item: (typeof NAV_ITEMS)[number];
  onNavigate: () => void;
}

function SidebarLink({ item, onNavigate }: SidebarLinkProps) {
  const Icon = item.icon;

  if (!item.implemented) {
    return (
      <div
        className="flex cursor-not-allowed items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground/50"
        title="Em breve"
      >
        <span className="flex items-center gap-2">
          <Icon className="size-4" />
          {item.label}
        </span>
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
          em breve
        </span>
      </div>
    );
  }

  return (
    <NavLink
      to={item.href}
      end={item.href === "/"}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground",
        )
      }
    >
      <Icon className="size-4" />
      {item.label}
    </NavLink>
  );
}
