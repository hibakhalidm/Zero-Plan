'use client';
import {ArrowUpRight,ShieldCheck} from 'lucide-react';
import {useSafety} from './SafetyCloakContext';
export default function QuickExitBar(){const {cloak}=useSafety();return <div className="quick-bar"><span><ShieldCheck size={14}/> Your space. Your privacy.</span><span className="exit-hint">Need privacy? Tap Quick Exit or press ESC twice.</span><button onClick={cloak}>Quick Exit <ArrowUpRight size={14}/></button></div>;}
