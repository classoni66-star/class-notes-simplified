import { createRootRoute, Outlet, Scripts } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* 🦋 SMARTSALE BRANDING */}
        <title>SmartSale - Manage your business with less stress</title>
        <meta name="description" content="SmartSale is the easiest way to record sales, track stock, and manage your business with less stress." />
        
        {/* 📱 WhatsApp, Facebook, & Telegram Preview Tags */}
        <meta property="og:title" content="SmartSale 🦋" />
        <meta property="og:description" content="Manage your business with less stress. Track sales, debts, and stock easily." />
        <meta property="og:image" content="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Butterfly.png" />
        <meta property="og:url" content="https://classoni.classoni66.workers.dev" />
        <meta property="og:type" content="website" />
        
        {/* App Theme Color & Manifest */}
        <meta name="theme-color" content="#FF9800" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="bg-[#F3F4F6]">
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
        }
