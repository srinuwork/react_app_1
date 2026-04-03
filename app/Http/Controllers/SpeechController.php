<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SpeechController extends Controller
{
    /**
     * Synthesize text into an MP3 file using a FREE, NO-KEY method.
     */
    public function synthesize(Request $request)
    {
        $request->validate([
            'text' => 'required|string|max:200', 
            'lang' => 'nullable|string',
        ]);

        try {
            // 1. Prepare text and language
            $text = urlencode($request->text);
            $lang = $request->lang ?? 'en';
            
            // 2. Use the "Free" unofficial Google TTS URL
            $url = "https://translate.google.com/translate_tts?ie=UTF-8&q={$text}&tl={$lang}&client=tw-ob";

            // 3. Fetch the audio
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0'
            ])->get($url);

            if (!$response->successful()) {
                throw new \Exception('Free synthesis provider returned an error.');
            }

            // 4. Store the file in the PUBLIC disk
            $filename = 'speech_free_' . Str::random(10) . '.mp3';
            
            // Ensure audio directory exists on public disk
            Storage::disk('public')->put('audio/' . $filename, $response->body());

            // 5. Return the public URL using the public disk
            return response()->json([
                'success' => true,
                'url' => Storage::disk('public')->url('audio/' . $filename),
                'filename' => $filename
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Synthesis failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
