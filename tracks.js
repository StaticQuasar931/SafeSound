// Replace generated demo tracks with real legal audio files by changing `src`
// to a relative path such as `assets/audio/lofi/example.mp3`.
const TRACK_LIBRARY = [
  {
    id: "aurora-bells",
    title: "Aurora Bells",
    artist: "SafeSound Demo Ensemble",
    category: "calm",
    mood: "gentle",
    src: "generated:aurora-bells",
    cover: "",
    license: "Original SafeSound demo track. Redistribution with this project is allowed.",
    sourceName: "Bundled with SafeSound",
    sourceUrl: "",
    durationHint: 64,
    lyrics: [],
    demo: {
      tempo: 72,
      waveform: "sine",
      notes: ["C4", "G4", "A4", "G4", "E4", "D4", "C4", "G3"],
      bassNotes: ["C2", "G2", "A2", "G2"]
    }
  },
  {
    id: "study-lantern",
    title: "Study Lantern",
    artist: "SafeSound Demo Ensemble",
    category: "focus",
    mood: "steady",
    src: "generated:study-lantern",
    cover: "",
    license: "Original SafeSound demo track. Redistribution with this project is allowed.",
    sourceName: "Bundled with SafeSound",
    sourceUrl: "",
    durationHint: 66,
    lyrics: [],
    demo: {
      tempo: 80,
      waveform: "triangle",
      notes: ["D4", "A4", "F4", "E4", "D4", "A3", "D4", "E4"],
      bassNotes: ["D2", "A2", "F2", "A2"]
    }
  },
  {
    id: "bright-hallway",
    title: "Bright Hallway",
    artist: "SafeSound Demo Ensemble",
    category: "upbeat",
    mood: "cheery",
    src: "generated:bright-hallway",
    cover: "",
    license: "Original SafeSound demo track. Redistribution with this project is allowed.",
    sourceName: "Bundled with SafeSound",
    sourceUrl: "",
    durationHint: 58,
    lyrics: [],
    demo: {
      tempo: 104,
      waveform: "sawtooth",
      notes: ["G4", "B4", "D5", "B4", "A4", "G4", "E4", "D4"],
      bassNotes: ["G2", "D3", "E3", "D3"]
    }
  },
  {
    id: "soft-rain-room",
    title: "Soft Rain Room",
    artist: "SafeSound Demo Ensemble",
    category: "ambient",
    mood: "dreamy",
    src: "generated:soft-rain-room",
    cover: "",
    license: "Original SafeSound demo track. Redistribution with this project is allowed.",
    sourceName: "Bundled with SafeSound",
    sourceUrl: "",
    durationHint: 72,
    lyrics: [],
    demo: {
      tempo: 66,
      waveform: "sine",
      notes: ["A3", "E4", "G4", "E4", "D4", "C4", "A3", "E3"],
      bassNotes: ["A2", "E2", "G2", "E2"]
    }
  },
  {
    id: "sunny-practice",
    title: "Sunny Practice",
    artist: "SafeSound Demo Ensemble",
    category: "piano",
    mood: "warm",
    src: "generated:sunny-practice",
    cover: "",
    license: "Original SafeSound demo track. Redistribution with this project is allowed.",
    sourceName: "Bundled with SafeSound",
    sourceUrl: "",
    durationHint: 63,
    lyrics: [],
    demo: {
      tempo: 92,
      waveform: "triangle",
      notes: ["F4", "A4", "C5", "A4", "G4", "F4", "E4", "C4"],
      bassNotes: ["F2", "C3", "G2", "C3"]
    }
  },
  {
    id: "museum-morning",
    title: "Museum Morning",
    artist: "SafeSound Demo Ensemble",
    category: "classical",
    mood: "curious",
    src: "generated:museum-morning",
    cover: "",
    license: "Original SafeSound demo track. Redistribution with this project is allowed.",
    sourceName: "Bundled with SafeSound",
    sourceUrl: "",
    durationHint: 67,
    lyrics: [],
    demo: {
      tempo: 88,
      waveform: "sine",
      notes: ["E4", "B4", "C5", "B4", "G4", "F4", "E4", "B3"],
      bassNotes: ["E2", "B2", "C3", "B2"]
    }
  },
  {
    id: "quiet-library-air",
    title: "Quiet Library Air",
    artist: "SafeSound Demo Ensemble",
    category: "focus",
    mood: "soft",
    src: "generated:quiet-library-air",
    cover: "",
    license: "Original SafeSound demo track. Redistribution with this project is allowed.",
    sourceName: "Bundled with SafeSound",
    sourceUrl: "",
    durationHint: 56,
    lyrics: [],
    demo: {
      tempo: 74,
      waveform: "triangle",
      notes: ["C4", "E4", "G4", "E4", "D4", "C4", "G3", "C4"],
      bassNotes: ["C2", "G2", "D2", "G2"]
    }
  },
  {
    id: "playground-breeze",
    title: "Playground Breeze",
    artist: "SafeSound Demo Ensemble",
    category: "upbeat",
    mood: "sunny",
    src: "generated:playground-breeze",
    cover: "",
    license: "Original SafeSound demo track. Redistribution with this project is allowed.",
    sourceName: "Bundled with SafeSound",
    sourceUrl: "",
    durationHint: 55,
    lyrics: [],
    demo: {
      tempo: 108,
      waveform: "sawtooth",
      notes: ["A4", "C5", "E5", "C5", "B4", "A4", "G4", "E4"],
      bassNotes: ["A2", "E3", "G2", "E3"]
    }
  },
  {
    id: "midnight-pencil",
    title: "Midnight Pencil",
    artist: "SafeSound Lo-fi Lab",
    category: "lofi",
    mood: "chill",
    src: "generated:midnight-pencil",
    cover: "",
    license: "Original SafeSound demo track. Redistribution with this project is allowed.",
    sourceName: "Bundled with SafeSound",
    sourceUrl: "",
    durationHint: 82,
    lyrics: [],
    demo: {
      tempo: 84,
      waveform: "triangle",
      notes: ["E4", "G4", "B4", "G4", "D4", "B3", "A3", "B3"],
      bassNotes: ["E2", "B2", "D2", "B2"],
      beatStyle: "lofi"
    }
  },
  {
    id: "window-seat-beat",
    title: "Window Seat Beat",
    artist: "SafeSound Lo-fi Lab",
    category: "lofi",
    mood: "study",
    src: "generated:window-seat-beat",
    cover: "",
    license: "Original SafeSound demo track. Redistribution with this project is allowed.",
    sourceName: "Bundled with SafeSound",
    sourceUrl: "",
    durationHint: 79,
    lyrics: [],
    demo: {
      tempo: 90,
      waveform: "sine",
      notes: ["C4", "D4", "G4", "D4", "A4", "G4", "E4", "D4"],
      bassNotes: ["C2", "G2", "A2", "G2"],
      beatStyle: "lofi"
    }
  },
  {
    id: "locker-rhythm",
    title: "Locker Rhythm",
    artist: "SafeSound Lo-fi Lab",
    category: "lofi",
    mood: "bounce",
    src: "generated:locker-rhythm",
    cover: "",
    license: "Original SafeSound demo track. Redistribution with this project is allowed.",
    sourceName: "Bundled with SafeSound",
    sourceUrl: "",
    durationHint: 74,
    lyrics: [],
    demo: {
      tempo: 96,
      waveform: "square",
      notes: ["D4", "F4", "A4", "F4", "E4", "D4", "C4", "A3"],
      bassNotes: ["D2", "A2", "C2", "A2"],
      beatStyle: "lofi"
    }
  },
  {
    id: "glow-notes",
    title: "Glow Notes",
    artist: "SafeSound Studio Voices",
    category: "lyrics",
    mood: "kind",
    src: "generated:glow-notes",
    cover: "",
    license: "Original SafeSound lyric demo track. Redistribution with this project is allowed.",
    sourceName: "Bundled with SafeSound",
    sourceUrl: "",
    durationHint: 64,
    lyrics: [
      { time: 0, text: "Take a breath and start the page." },
      { time: 8, text: "Little steps can feel so brave." },
      { time: 16, text: "Quiet room and steady hands." },
      { time: 24, text: "Learning grows with gentle plans." },
      { time: 32, text: "Glow notes, bright notes, line by line." },
      { time: 40, text: "You can build a clever mind." },
      { time: 48, text: "Safe songs, calm songs, here to stay." },
      { time: 56, text: "Kind ideas can lead the way." }
    ],
    demo: {
      tempo: 88,
      waveform: "triangle",
      notes: ["G4", "A4", "B4", "A4", "G4", "E4", "D4", "E4"],
      bassNotes: ["G2", "D3", "E3", "D3"]
    }
  },
  {
    id: "paper-plane-chorus",
    title: "Paper Plane Chorus",
    artist: "SafeSound Studio Voices",
    category: "lyrics",
    mood: "hopeful",
    src: "generated:paper-plane-chorus",
    cover: "",
    license: "Original SafeSound lyric demo track. Redistribution with this project is allowed.",
    sourceName: "Bundled with SafeSound",
    sourceUrl: "",
    durationHint: 68,
    lyrics: [
      { time: 0, text: "Fold a thought into the sky." },
      { time: 8, text: "Let it sail and let it fly." },
      { time: 16, text: "Every question starts so small." },
      { time: 24, text: "Then it learns to cross the hall." },
      { time: 32, text: "Paper planes and bright ideas." },
      { time: 40, text: "Growing strong across the years." },
      { time: 48, text: "Safe and steady, clear and true." },
      { time: 56, text: "Make a song that's made by you." }
    ],
    demo: {
      tempo: 92,
      waveform: "sine",
      notes: ["C4", "E4", "G4", "A4", "G4", "E4", "D4", "C4"],
      bassNotes: ["C2", "G2", "A2", "G2"]
    }
  },
  {
    id: "focus-harbor",
    title: "Focus Harbor",
    artist: "SafeSound Demo Ensemble",
    category: "focus",
    mood: "calm",
    src: "generated:focus-harbor",
    cover: "",
    license: "Original SafeSound demo track. Redistribution with this project is allowed.",
    sourceName: "Bundled with SafeSound",
    sourceUrl: "",
    durationHint: 70,
    lyrics: [],
    demo: {
      tempo: 76,
      waveform: "triangle",
      notes: ["F4", "C5", "A4", "G4", "F4", "D4", "C4", "D4"],
      bassNotes: ["F2", "C3", "D2", "C3"]
    }
  },
  {
    id: "graph-paper-drift",
    title: "Graph Paper Drift",
    artist: "SafeSound Lo-fi Lab",
    category: "lofi",
    mood: "night",
    src: "generated:graph-paper-drift",
    cover: "",
    license: "Original SafeSound demo track. Redistribution with this project is allowed.",
    sourceName: "Bundled with SafeSound",
    sourceUrl: "",
    durationHint: 86,
    lyrics: [],
    demo: {
      tempo: 82,
      waveform: "sine",
      notes: ["A3", "C4", "E4", "G4", "E4", "C4", "B3", "C4"],
      bassNotes: ["A2", "E2", "G2", "E2"],
      beatStyle: "lofi"
    }
  },
  {
    id: "reading-cloud",
    title: "Reading Cloud",
    artist: "SafeSound Demo Ensemble",
    category: "ambient",
    mood: "float",
    src: "generated:reading-cloud",
    cover: "",
    license: "Original SafeSound demo track. Redistribution with this project is allowed.",
    sourceName: "Bundled with SafeSound",
    sourceUrl: "",
    durationHint: 71,
    lyrics: [],
    demo: {
      tempo: 68,
      waveform: "sine",
      notes: ["D4", "A4", "C5", "A4", "G4", "E4", "D4", "A3"],
      bassNotes: ["D2", "A2", "C2", "A2"]
    }
  }
];
