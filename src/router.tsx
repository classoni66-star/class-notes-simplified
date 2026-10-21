import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Meta, Scripts } from '@tanstack/start'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'SmartSale - Manage your business with less stress' },
      { name: 'description', content: 'SmartSale is the easiest way to record sales, track stock, and manage your business with less stress.' },
      
      // 🦋 WhatsApp & Facebook Preview Tags
      { property: 'og:title', content: 'SmartSale 🦋' },
      { property: 'og:description', content: 'Manage your business with less stress. Track sales, debts, and stock easily.' },
      { property: 'og:image', content: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Butterfly.png' },
      { property: 'og:url', content: 'https://classoni.classoni66.workers.dev' },
      { property: 'og:type', content: 'website' },
      
      // App Theme Color
      { name: 'theme-color', content: '#FF9800' },
    ],
    links: [
      { rel: 'manifest', href: '/manifest.webmanifest' },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <Meta />
      </head>
      <body className="bg-[#F3F4F6]">
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
  }
