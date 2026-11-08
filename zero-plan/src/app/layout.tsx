import type {Metadata,Viewport} from 'next';
import {SafetyCloakProvider} from '@/components/SafetyCloakContext';
import './globals.css';
export const metadata:Metadata={title:'Zero Plan • A space to grow',description:'Safe space. Offline knowledge. Sisterhood support. A youth-led learning space in Ethiopia.',manifest:'/manifest.json',icons:{icon:'/icon.svg',apple:'/icon-192.png'}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#173f3b'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><SafetyCloakProvider>{children}</SafetyCloakProvider></body></html>;}
