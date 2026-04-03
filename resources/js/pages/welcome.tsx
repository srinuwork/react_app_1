import { Head } from '@inertiajs/react';
import SpeechBox from '@/components/speech-box';

export default function Welcome() {
    return (
        <>
            <Head title="AI Speech Editor" />
            
            {/* Using h-screen and overflow-hidden to prevent the page from jumping/scrolling */}
            <div className="h-screen w-full bg-[#FDFDFC] dark:bg-[#0a0a0a] flex flex-col overflow-hidden">
                
                <header className="py-6 text-center shrink-0">
                    <h1 className="text-2xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">AI Speech Editor</h1>
                    <p className="text-[12px] text-[#706f6c] dark:text-[#A1A09A] uppercase tracking-[0.2em] font-semibold mt-1">English & Telugu Synthesis</p>
                </header>
                
                <main className="flex-1 w-full max-w-7xl mx-auto px-4 pb-8 flex flex-col min-h-0">
                    <SpeechBox />
                </main>

                <footer className="py-4 text-center text-[11px] text-[#706f6c] dark:text-[#A1A09A] shrink-0 border-t border-[#e3e3e0] dark:border-[#3E3E3A]">
                    Designed for Speed & Clarity • © 2026
                </footer>
            </div>
        </>
    );
}
