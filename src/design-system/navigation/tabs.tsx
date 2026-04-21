"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
} from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/utils/cn";

/**
 * Tabs 标签页组件
 *
 * Design System 中的标签页组件，用于内容分组和切换。
 * 实现 WAI-ARIA Tabs 模式，支持键盘导航和屏幕阅读器。
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [activeTab, setActiveTab] = useState("tab1");
 *
 *   return (
 *     <Tabs value={activeTab} onValueChange={setActiveTab}>
 *       <Tabs.List>
 *         <Tabs.Trigger value="tab1">标签 1</Tabs.Trigger>
 *         <Tabs.Trigger value="tab2">标签 2</Tabs.Trigger>
 *         <Tabs.Trigger value="tab3">标签 3</Tabs.Trigger>
 *       </Tabs.List>
 *       <Tabs.Content value="tab1">
 *         <p>内容 1</p>
 *       </Tabs.Content>
 *       <Tabs.Content value="tab2">
 *         <p>内容 2</p>
 *       </Tabs.Content>
 *       <Tabs.Content value="tab3">
 *         <p>内容 3</p>
 *       </Tabs.Content>
 *     </Tabs>
 *   );
 * }
 * ```
 */

type TabVariant = "line" | "enclosed" | "soft";

interface TabsContextValue {
  activeTab: string;
  onTabChange: (value: string) => void;
  variant: TabVariant;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error(
      "Tabs compound components must be used within a <Tabs> provider"
    );
  }
  return ctx;
}

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  variant?: TabVariant;
}

function Tabs({
  value,
  onValueChange,
  children,
  className,
  variant = "line",
}: TabsProps) {
  const baseId = useId();

  const contextValue = useMemo<TabsContextValue>(
    () => ({ activeTab: value, onTabChange: onValueChange, variant, baseId }),
    [value, onValueChange, variant, baseId]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn("w-full", className)} data-variant={variant}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}


export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const listVariants = cva("flex", {
  variants: {
    variant: {
      line: "border-b border-gray-200",
      enclosed: "bg-gray-100 p-1 rounded-lg gap-1",
      soft: "gap-2",
    },
  },
  defaultVariants: {
    variant: "line",
  },
});

function TabsList({ children, className, onKeyDown, ...props }: TabsListProps) {
  const { variant } = useTabsContext();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);

      const tablist = e.currentTarget;
      const triggers = Array.from(
        tablist.querySelectorAll<HTMLElement>('[role="tab"]')
      );
      const focused = document.activeElement;
      const currentIndex = focused instanceof HTMLElement
        ? triggers.indexOf(focused)
        : -1;

      if (currentIndex === -1) return;

      let nextIndex = -1;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          nextIndex = (currentIndex + 1) % triggers.length;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          nextIndex = (currentIndex - 1 + triggers.length) % triggers.length;
          break;
        case "Home":
          e.preventDefault();
          nextIndex = 0;
          break;
        case "End":
          e.preventDefault();
          nextIndex = triggers.length - 1;
          break;
        default:
          return;
      }

      triggers[nextIndex]?.focus();
    },
    [onKeyDown]
  );

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn(listVariants({ variant }), className)}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </div>
  );
}


export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
}

const triggerVariants = cva(
  "px-4 py-2 text-sm font-medium transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        line: "border-b-2 -mb-px rounded-t-lg data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 text-gray-600 hover:text-gray-900 border-transparent",
        enclosed:
          "rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900",
        soft: "rounded-lg data-[state=active]:bg-primary-50 data-[state=active]:text-primary-700 text-gray-600 hover:text-gray-900 hover:bg-gray-100",
      },
    },
    defaultVariants: {
      variant: "line",
    },
  }
);

function TabsTrigger({
  value,
  children,
  className,
  onClick,
  ...props
}: TabsTriggerProps) {
  const { activeTab, onTabChange, variant, baseId } = useTabsContext();
  const isActive = activeTab === value;
  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onTabChange(value);
      onClick?.(e);
    },
    [onTabChange, value, onClick]
  );

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={panelId}
      id={tabId}
      tabIndex={isActive ? 0 : -1}
      data-state={isActive ? "active" : "inactive"}
      className={cn(triggerVariants({ variant }), className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}


export interface TabsContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

function TabsContent({ value, children, className, ...props }: TabsContentProps) {
  const { activeTab, baseId } = useTabsContext();
  const isActive = activeTab === value;

  if (!isActive) return null;

  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  return (
    <div
      role="tabpanel"
      aria-labelledby={tabId}
      id={panelId}
      tabIndex={0}
      data-state="active"
      className={cn("mt-4 focus:outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}


const TabsComponent = Tabs as React.FC<TabsProps> & {
  List: typeof TabsList;
  Trigger: typeof TabsTrigger;
  Content: typeof TabsContent;
};

TabsComponent.List = TabsList;
TabsComponent.Trigger = TabsTrigger;
TabsComponent.Content = TabsContent;

export { TabsComponent as Tabs };
export { TabsList, TabsTrigger, TabsContent };
