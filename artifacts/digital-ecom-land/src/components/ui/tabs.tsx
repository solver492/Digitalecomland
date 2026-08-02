import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { defaultValue?: string, value?: string, onValueChange?: (v: string) => void }>(({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
  const [active, setActive] = React.useState(value ?? defaultValue)
  
  React.useEffect(() => {
    if (value !== undefined) {
      setActive(value)
    }
  }, [value])

  return (
    <div ref={ref} className={cn(className)} {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { active, setActive: onValueChange || setActive })
        }
        return child
      })}
    </div>
  )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)} {...props}>
    {children}
  </div>
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string, active?: string, setActive?: (v: string) => void }>(({ className, value, active, setActive, ...props }, ref) => {
  const isActive = active === value
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setActive?.(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive && "bg-background text-foreground shadow",
        className
      )}
      {...props}
    />
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string, active?: string }>(({ className, value, active, ...props }, ref) => {
  if (active !== value) return null
  return (
    <div
      ref={ref}
      className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
