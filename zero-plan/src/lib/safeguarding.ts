export const crisisPattern = /\b(abuse|assault|rape|suicide|kill\s+myself|harm|bleeding\s+heavily|forced|threat\w*)\b/i;
export const isUrgent = (text:string) => crisisPattern.test(text);
export const categories = {srhr:'SRHR & health',mental_health:'Mental well-being',digital_safety:'Digital rights',period_dignity:'Period dignity'} as const;
export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
