# FluidmotionTV MP3 Audio Library

Welcome to the `public/mp3s` audio repository for the FluidmotionTV West Coast Radio portal!

## How to add tracks:
1. Place any `.mp3` audio files directly inside this folder (`/public/mp3s/`).
2. Update `manifest.json` in this folder with your file details (optional, as the web portal also lets you drop & load files interactively):
```json
{
  "id": "my-track-01",
  "filename": "my_song.mp3",
  "title": "My Song Title",
  "artist": "Artist Name",
  "bpm": 90,
  "genre": "West Coast Chill"
}
```
3. When running or deployed, the Web Audio API AnalyserNode will automatically stream the track and drive the 3D Horizon Engine, Cyber Dragons, and Plasma ripples in real time!
