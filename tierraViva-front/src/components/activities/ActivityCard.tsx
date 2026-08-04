
"use client";

import Image from "next/image";
import { Calendar, Clock, MapPin, Users, Ticket, Sparkles } from "lucide-react";
import { Activity } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface ActivityCardProps {
    activity: Activity;
    index?: number;
}

const ActivityCard = ({ activity, index = 0 }: ActivityCardProps) => {
    const formattedDate = formatDate(activity.date, { day: 'numeric', month: 'short' });

    return (
        <div 
            className="group relative flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom duration-1000 fill-mode-both hover-lift"
            style={{ animationDelay: `${index * 150}ms` }}
        >
            {/* Image Section - High Contrast Border */}
            <div className="relative aspect-[16/11] rounded-[3rem] overflow-hidden border-2 border-[#0d0f36]/10 group-hover:border-primary/50 transition-all duration-700 shadow-xl bg-muted">
                <Image
                    src={activity.image_url && activity.image_url.startsWith('http') ? activity.image_url : "/placeholder-activity.jpg"}
                    alt={activity.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                
                {/* Floating Date Badge */}
                <div className="absolute top-6 right-6 z-20">
                    <div className="bg-white/95 backdrop-blur-md border-2 border-[#0d0f36] p-3 rounded-2xl flex flex-col items-center justify-center min-w-[60px] shadow-[4px_4px_0px_0px_#0d0f36] -rotate-3 group-hover:rotate-0 transition-transform">
                        <span className="text-sm font-black uppercase tracking-tighter text-primary">{formattedDate.split(' ')[1]}</span>
                        <span className="text-2xl font-black text-[#0d0f36] leading-none">{formattedDate.split(' ')[0]}</span>
                    </div>
                </div>

                {/* Left Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
                    <Badge className="bg-[#0d0f36] text-white font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full border-none">
                        {activity.type_display}
                    </Badge>
                </div>

                {/* Capacity Warning */}
                {activity.remaining_capacity <= 5 && activity.remaining_capacity > 0 && (
                    <div className="absolute bottom-6 left-6 z-20">
                        <Badge variant="destructive" className="rounded-full font-black px-4 py-2 text-[10px] uppercase tracking-tighter shadow-xl">
                            ¡Solo {activity.remaining_capacity} lugares!
                        </Badge>
                    </div>
                )}
                
                {activity.remaining_capacity === 0 && (
                    <div className="absolute inset-0 bg-[#0d0f36]/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <div className="bg-white text-[#0d0f36] border-4 border-[#0d0f36] px-8 py-3 rounded-2xl font-black text-xl uppercase tracking-[0.2em] -rotate-12 shadow-2xl">
                            Agotado
                        </div>
                    </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f36]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>

            {/* Content Section */}
            <div className="px-2 space-y-4">
                <div className="space-y-2">
                    <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-primary">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {activity.duration}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {activity.location}</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter leading-[0.9] group-hover:text-primary transition-colors">
                        {activity.title}
                    </h3>
                </div>

                <div className="pt-6 border-t-2 border-[#0d0f36]/5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#0d0f36]/40">Inversión Solidaria</p>
                        <p className="text-3xl font-black text-[#0d0f36] tracking-tighter">${activity.price}</p>
                    </div>

                    <div className="w-14 h-14 rounded-[1.5rem] bg-white border-2 border-[#0d0f36] flex items-center justify-center shadow-[4px_4px_0px_0px_#0d0f36] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all">
                        <Ticket className="w-6 h-6 text-[#0d0f36]" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityCard;
