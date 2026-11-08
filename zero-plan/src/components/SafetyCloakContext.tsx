'use client';
import {createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {pauseSync,wipe} from '@/lib/storage-sync';
const Safety=createContext({cloak:()=>{},hardWipe:()=>{}});
export const useSafety=()=>useContext(Safety);
export function SafetyCloakProvider({children}:{children:ReactNode}){
 const [hidden,setHidden]=useState(false),[credits,setCredits]=useState([3,3,2]),[grades,setGrades]=useState([4,3,3.5]);
 const lastEsc=useRef(0),clicks=useRef(0),originalTitle=useRef('Zero Plan • A space to grow'),lastClick=useRef(0);
 const cloak=useCallback(()=>{originalTitle.current=document.title;document.title='Student Study Portal';setHidden(true);pauseSync(true);},[]);
 const hardWipe=useCallback(()=>{cloak();void wipe();},[cloak]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){const now=Date.now();if(now-lastEsc.current<800){cloak();lastEsc.current=0;}else lastEsc.current=now;}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[cloak]);
 const unlock=()=>{const now=Date.now();clicks.current=now-lastClick.current<1500?clicks.current+1:1;lastClick.current=now;if(clicks.current===3){clicks.current=0;document.title=originalTitle.current;setHidden(false);pauseSync(false);}};
 const total=credits.reduce((a,b)=>a+b,0),gpa=total?grades.reduce((sum,grade,i)=>sum+grade*credits[i],0)/total:0;
 return <Safety.Provider value={{cloak,hardWipe}}>{hidden?<div className="study-portal"><header><span>STUDENT STUDY PORTAL</span><button onClick={()=>window.location.replace('https://www.google.com')}>Leave Site Immediately ↗</button></header><main><p className="eyebrow">PLAN YOUR SEMESTER</p><h1>Academic Grade &<br/>GPA Study Calculator</h1><p>Enter your course credits and grades to calculate a weighted GPA on a 4.0 scale.</p><div className="study-grid"><section>{credits.map((credit,i)=><div className="grade-row" key={i}><strong>Course {i+1}</strong><label>Credits<input aria-label={`Course ${i+1} credits`} type="number" min="0" max="30" value={credit} onChange={e=>setCredits(credits.map((v,j)=>j===i?Math.min(30,Math.max(0,Number(e.target.value))):v))}/></label><label>Grade<select aria-label={`Course ${i+1} grade`} value={grades[i]} onChange={e=>setGrades(grades.map((v,j)=>j===i?Number(e.target.value):v))}>{[[4,'A'],[3.5,'B+'],[3,'B'],[2.5,'C+'],[2,'C'],[1,'D'],[0,'F']].map(([value,label])=><option key={value} value={value}>{label} ({value})</option>)}</select></label></div>)}<button onClick={()=>{setCredits([...credits,3]);setGrades([...grades,4]);}}>+ Add a course</button></section><aside><small>ESTIMATED GPA</small><strong>{gpa.toFixed(2)}</strong><span>{total} total credits</span></aside></div><p>Use this calculator for study planning. Your institution’s grading policy may differ.</p><button className="version" onClick={unlock}>v1.0.4</button></main></div>:children}</Safety.Provider>;
}
