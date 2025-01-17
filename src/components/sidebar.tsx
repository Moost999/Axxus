import Link from 'next/link'
import { Home, Users, PlusCircle, Settings, MessageSquare } from 'lucide-react'

export function Sidebar() {
  return (
    <div className="w-11 md:w-64 bg-card text-card-foreground h-screen transition-all duration-300 ease-in-out">
      <div className="h-16 bg-gradient-to-b flex items-center justify-center">
        <h3 className="text-2xl font-bold font-orbitron hidden md:block">AXXUS</h3>
        <h1 className="text-2xl font-bold  font-orbitron md:hidden">axxusAI</h1>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          <SidebarItem href="/" icon={<Home className="w-5 h-5" />} text="Dashboard" />
          <SidebarItem href="/assistants" icon={<Users className="w-5 h-5" />} text="Assistants" />
          <SidebarItem href="/create-assistant" icon={<PlusCircle className="w-5 h-5" />} text="Create" />
          <SidebarItem href="/chat" icon={<MessageSquare className="w-5 h-5" />} text="Chat" />
          <SidebarItem href="/settings" icon={<Settings className="w-5 h-5" />} text="Settings" />
        </ul>
      </nav>
    </div>
  )
}

function SidebarItem({ href, icon, text }: { href: string; icon: React.ReactNode; text: string }) {
  return (
    <li>
      <Link href={href} className="flex items-center space-x-3 p-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors duration-200">
        {icon}
        <span className="font-medium hidden md:inline">{text}</span>
      </Link>
    </li>
  )
}

