export type Category = 'srhr'|'mental_health'|'digital_safety'|'period_dignity';
export type Question = {id:string; category:Category; chapter_slug:string;question_text:string; answer_text?:string|null;answered_by:string;status:'pending'|'published'|'archived';is_flagged_urgent:boolean;upvotes:number;created_at:string};
export type Chapter = {slug:string;name:string;institution_type:string;city:string;trained_advocates_count:number;active_members_count:number;pad_kits_available:number;pad_kits_target:number;next_circle_day:string};
export type Impact = {chapters:Chapter[];installs:number;mode:'live'|'demo';updated_at:string};
