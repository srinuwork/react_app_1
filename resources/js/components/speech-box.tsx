import axios from 'axios';
import React, { useState, useEffect } from 'react';

export default function SpeechBox() {
    const [text, setText] = useState('Welcome to your new AI Speech Editor! Type anything here in English or Telugu to hear it speak perfectly.');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>('');
    const [pitch, setPitch] = useState(1);
    const [rate, setRate] = useState(1);
    
    // Load available browser voices
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            
            // Filter specifically for English (en) and Telugu (te)
            const filteredVoices = availableVoices.filter(v => 
                v.lang.startsWith('en') || v.lang.startsWith('te')
            );
            
            setVoices(filteredVoices);
            
            // Try to find a Telugu voice first, then a good English voice
            const preferredVoice = filteredVoices.find(v => v.lang.startsWith('te')) || 
                                 filteredVoices.find(v => v.lang.startsWith('en-US')) || 
                                 filteredVoices[0];
                                 
            if (preferredVoice && !selectedVoice) {
                setSelectedVoice(preferredVoice.name);
            }
        };

        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
        
        return () => {
            window.speechSynthesis.cancel();
        };
    }, [selectedVoice]);

    const handleSpeak = () => {
        if (text.trim() === '') {
return;
}

        // Cancel any current speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Find and set the selected voice
        const voice = voices.find(v => v.name === selectedVoice);

        if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang; // CRITICAL: Tells the voice to use its native language engine
        }
        
        utterance.pitch = pitch;
        utterance.rate = rate;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    const handleDownload = async () => {
        if (text.trim() === '') {
return;
}

        setIsGenerating(true);

        // Detect language based on the selected voice
        const currentVoice = voices.find(v => v.name === selectedVoice);
        const lang = currentVoice?.lang.startsWith('te') ? 'te' : 'en';

        try {
            // Uses the "Free" synthesis method from SpeechController
            const response = await axios.post('/synthesize', {
                text: text,
                lang: lang
            });

            if (response.data.success) {
                // Trigger file download
                const link = document.createElement('a');
                link.href = response.data.url;
                link.setAttribute('download', response.data.filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
            } else {
                alert('Generation failed: ' + response.data.error);
            }
        } catch (error: any) {
            console.error('Error generating MP3:', error);
            alert('An error occurred while generating the MP3.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col min-h-0">
            {/* The Big Editor Window */}
            <div className="w-full h-full flex flex-col min-h-0 rounded-3xl bg-white shadow-[0px_20px_40px_-10px_rgba(0,0,0,0.1)] border border-[#1a1a001a] dark:bg-[#161615] dark:border-[#fffaed2d] overflow-hidden">
                <div className="flex items-center justify-between px-8 py-4 border-b border-[#e3e3e0] dark:border-[#3E3E3A] shrink-0">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <span className="text-xs font-semibold text-[#706f6c] dark:text-[#A1A09A]">Narrator Pro v1.0</span>
                </div>
                
                {/* Flex-1 ensures this textarea fills everything but doesn't push things down */}
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="flex-1 w-full p-12 text-2xl font-medium border-none focus:ring-0 outline-none transition-all dark:bg-[#0a0a0a] dark:text-[#EDEDEC] resize-none overflow-y-auto"
                    placeholder="Enter your content here..."
                />
                
                {/* Control Bar - Sticky at bottom of editor */}
                <div className="px-12 py-8 bg-[#FDFDFC] dark:bg-[#161615] border-t border-[#e3e3e0] dark:border-[#3E3E3A] flex flex-wrap items-center justify-between gap-8 shrink-0">
                    
                    {/* Voice Select */}
                    <div className="flex flex-col gap-2 min-w-[300px]">
                        <label className="text-xs font-bold text-[#706f6c] dark:text-[#A1A09A] uppercase tracking-wider">Preview Voice Profile (Free)</label>
                        <select 
                            value={selectedVoice}
                            onChange={(e) => setSelectedVoice(e.target.value)}
                            className="w-full p-3 text-sm font-semibold border border-[#e3e3e0] rounded-xl bg-white dark:bg-[#0a0a0a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] shadow-sm"
                        >
                            {voices.length > 0 ? voices.map((voice) => (
                                <option key={voice.name} value={voice.name}>
                                    {voice.name} ({voice.lang})
                                </option>
                            )) : (
                                <option>No Voices Found—Check browser settings</option>
                            )}
                        </select>
                    </div>

                    {/* Pitch & Rate */}
                    <div className="flex gap-12 grow max-w-sm">
                        <div className="flex-1 flex flex-col gap-2">
                            <label className="text-xs font-bold text-[#706f6c] dark:text-[#A1A09A] uppercase tracking-wider">Pitch ({pitch})</label>
                            <input 
                                type="range" min="0.5" max="2" step="0.1" 
                                value={pitch} 
                                onChange={(e) => setPitch(parseFloat(e.target.value))}
                                className="w-full accent-[#f53003] cursor-pointer"
                            />
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                            <label className="text-xs font-bold text-[#706f6c] dark:text-[#A1A09A] uppercase tracking-wider">Speed ({rate})</label>
                            <input 
                                type="range" min="0.5" max="2" step="0.1" 
                                value={rate} 
                                onChange={(e) => setRate(parseFloat(e.target.value))}
                                className="w-full accent-[#f53003] cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={handleSpeak}
                            disabled={isSpeaking || isGenerating || text.trim() === ''}
                            className={`px-8 py-4 rounded-2xl text-lg font-bold text-white transition-all shadow-[0px_10px_20px_-5px_rgba(245,48,3,0.3)] ${isSpeaking ? 'bg-[#f53003]/50 cursor-not-allowed animate-pulse' : 'bg-[#f53003] hover:bg-[#ff4433] hover:shadow-[0px_15px_30px_-5px_rgba(245,48,3,0.4)] active:scale-[0.98]'}`}
                        >
                            {isSpeaking ? '🎤 Playing Preview...' : '🔊 Preview'}
                        </button>
                        
                        <button
                            onClick={handleDownload}
                            disabled={isSpeaking || isGenerating || text.trim() === ''}
                            className={`flex-1 min-w-[200px] px-8 py-4 rounded-2xl text-lg font-bold text-white transition-all border border-blue-600 shadow-[0px_10px_20px_-5px_rgba(37,99,235,0.3)] ${isGenerating ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}`}
                        >
                            {isGenerating ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Generating MP3...
                                </span>
                            ) : (
                                "💾 Download MP3"
                            )}
                        </button>

                        {isSpeaking && (
                            <button
                                onClick={handleStop}
                                className="p-4 bg-white text-red-500 border border-red-100 rounded-2xl hover:bg-red-50 transition-all dark:bg-red-950/20 dark:border-red-900/30"
                            >
                                <span className="text-xl font-bold">🛑 STOP</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="py-2 text-center text-[#706f6c] dark:text-[#A1A09A]">
                <p className="text-[10px] uppercase font-bold tracking-widest hidden md:block opacity-50">✨ Your AI Narrator is fully operational—Enjoy!</p>
            </div>
        </div>
    );
}
