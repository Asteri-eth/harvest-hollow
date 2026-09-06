import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Harvest Hollow — Your little patch of possibility', description: 'A cozy 3D farming game. Grow crops, raise animals, build your farm, and watch your homestead transform.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
