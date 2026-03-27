(function () {
  const STORAGE_KEYS = {
    playlists: "safesound.playlists",
    favorites: "safesound.favorites",
    settings: "safesound.settings"
  };

  const CATEGORY_ORDER = ["calm", "focus", "upbeat", "piano", "ambient", "classical"];
  const REPEAT_MODES = ["off", "all", "one"];

  const audio = document.getElementById("audioPlayer");
  const trackGrid = document.getElementById("trackGrid");
  const playlistList = document.getElementById("playlistList");
  const playlistDetail = document.getElementById("playlistDetail");
  const playlistForm = document.getElementById("playlistForm");
  const playlistNameInput = document.getElementById("playlistName");
  const newPlaylistButton = document.getElementById("newPlaylistButton");
  const activePlaylistTitle = document.getElementById("activePlaylistTitle");
  const renamePlaylistButton = document.getElementById("renamePlaylistButton");
  const deletePlaylistButton = document.getElementById("deletePlaylistButton");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const favoritesFilterButton = document.getElementById("favoritesFilter");
  const aboutToggle = document.getElementById("aboutToggle");
  const aboutPanel = document.getElementById("aboutPanel");
  const focusToggle = document.getElementById("focusToggle");
  const playPauseButton = document.getElementById("playPauseButton");
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");
  const shuffleButton = document.getElementById("shuffleButton");
  const repeatButton = document.getElementById("repeatButton");
  const seekBar = document.getElementById("seekBar");
  const volumeSlider = document.getElementById("volumeSlider");
  const currentTimeLabel = document.getElementById("currentTime");
  const durationLabel = document.getElementById("duration");
  const trackTitle = document.getElementById("trackTitle");
  const trackMeta = document.getElementById("trackMeta");
  const trackCover = document.getElementById("trackCover");
  const heroNowPlaying = document.getElementById("heroNowPlaying");
  const licenseTableBody = document.getElementById("licenseTableBody");
  const trackCount = document.getElementById("trackCount");
  const favoriteCount = document.getElementById("favoriteCount");
  const playlistCount = document.getElementById("playlistCount");
  const resultsSummary = document.getElementById("resultsSummary");

  const trackMap = new Map(TRACK_LIBRARY.map((track) => [track.id, track]));
  const state = {
    playlists: loadJson(STORAGE_KEYS.playlists, []),
    favorites: new Set(loadJson(STORAGE_KEYS.favorites, [])),
    settings: {
      shuffle: false,
      repeatMode: "off",
      focusMode: false,
      volume: 0.8,
      favoritesOnly: false,
      ...loadJson(STORAGE_KEYS.settings, {})
    },
    activePlaylistId: null,
    currentTrackId: null,
    currentQueue: TRACK_LIBRARY.map((track) => track.id),
    currentQueueLabel: "Library"
  };

  const generatedTrackUrls = new Map();
  audio.volume = Number(state.settings.volume) || 0.8;
  volumeSlider.value = String(audio.volume);

  populateCategoryFilter();
  renderAll();
  updatePlayerUi();
  setupEventListeners();
  registerServiceWorker();

  function setupEventListeners() {
    playlistForm.addEventListener("submit", handleCreatePlaylist);
    newPlaylistButton.addEventListener("click", () => playlistNameInput.focus());
    renamePlaylistButton.addEventListener("click", handleRenamePlaylist);
    deletePlaylistButton.addEventListener("click", handleDeletePlaylist);
    searchInput.addEventListener("input", renderTrackGrid);
    categoryFilter.addEventListener("change", renderTrackGrid);
    favoritesFilterButton.addEventListener("click", () => {
      state.settings.favoritesOnly = !state.settings.favoritesOnly;
      saveSettings();
      renderAll();
    });
    aboutToggle.addEventListener("click", toggleAboutPanel);
    focusToggle.addEventListener("click", toggleFocusMode);
    playPauseButton.addEventListener("click", togglePlayPause);
    prevButton.addEventListener("click", playPreviousTrack);
    nextButton.addEventListener("click", playNextTrack);
    shuffleButton.addEventListener("click", toggleShuffle);
    repeatButton.addEventListener("click", cycleRepeatMode);
    seekBar.addEventListener("input", handleSeek);
    volumeSlider.addEventListener("input", handleVolumeChange);
    audio.addEventListener("timeupdate", syncProgress);
    audio.addEventListener("loadedmetadata", syncProgress);
    audio.addEventListener("ended", handleTrackEnded);
    audio.addEventListener("play", updatePlayerUi);
    audio.addEventListener("pause", updatePlayerUi);

    document.addEventListener("keydown", (event) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        togglePlayPause();
      } else if (event.code === "ArrowRight") {
        event.preventDefault();
        audio.currentTime = Math.min(audio.currentTime + 5, audio.duration || audio.currentTime);
      } else if (event.code === "ArrowLeft") {
        event.preventDefault();
        audio.currentTime = Math.max(audio.currentTime - 5, 0);
      } else if (event.key.toLowerCase() === "f") {
        toggleFocusMode();
      }
    });
  }

  function renderAll() {
    renderPlaylistList();
    renderPlaylistDetail();
    renderTrackGrid();
    renderLicenseTable();
    renderStats();
    syncToggles();
  }

  function renderStats() {
    trackCount.textContent = String(TRACK_LIBRARY.length);
    favoriteCount.textContent = String(state.favorites.size);
    playlistCount.textContent = String(state.playlists.length);
  }

  function populateCategoryFilter() {
    CATEGORY_ORDER.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = capitalize(category);
      categoryFilter.appendChild(option);
    });
  }

  function renderTrackGrid() {
    const tracks = getFilteredTracks();
    resultsSummary.textContent = `${tracks.length} track${tracks.length === 1 ? "" : "s"} shown`;
    trackGrid.innerHTML = "";

    if (!tracks.length) {
      trackGrid.innerHTML = '<div class="empty-state">No tracks match that search or filter.</div>';
      return;
    }

    tracks.forEach((track) => {
      const isFavorite = state.favorites.has(track.id);
      const card = document.createElement("article");
      card.className = "track-card";
      card.innerHTML = `
        <img class="track-art" src="${getTrackCover(track)}" alt="Cover art for ${escapeHtml(track.title)}">
        <div>
          <h3>${escapeHtml(track.title)}</h3>
          <p>${escapeHtml(track.artist)}</p>
        </div>
        <p class="track-meta">${capitalize(track.category)} • ${formatTime(track.durationHint || 0)}</p>
        <div class="tag-row">
          <span class="tag">${capitalize(track.category)}</span>
          <span class="tag">${shortLicense(track.license)}</span>
        </div>
        <div class="track-actions">
          <button class="primary-action" type="button" data-action="play">Play</button>
          <button type="button" data-action="favorite">${isFavorite ? "Unfavorite" : "Favorite"}</button>
          <button type="button" data-action="playlist">Add to Playlist</button>
        </div>
      `;

      card.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.action;
          if (action === "play") {
            const queue = tracks.map((item) => item.id);
            playTrack(track.id, queue, "Filtered Library");
          } else if (action === "favorite") {
            toggleFavorite(track.id);
          } else if (action === "playlist") {
            addTrackToPlaylistPrompt(track.id);
          }
        });
      });

      trackGrid.appendChild(card);
    });
  }

  function renderPlaylistList() {
    playlistList.innerHTML = "";

    if (!state.playlists.length) {
      playlistList.innerHTML = '<div class="empty-state">Create a playlist to save a custom mix on this device.</div>';
      return;
    }

    state.playlists.forEach((playlist) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `playlist-item${playlist.id === state.activePlaylistId ? " active" : ""}`;
      button.innerHTML = `
        <div>
          <p><strong>${escapeHtml(playlist.name)}</strong></p>
          <p class="playlist-count">${playlist.trackIds.length} track${playlist.trackIds.length === 1 ? "" : "s"}</p>
        </div>
        <span aria-hidden="true">Open</span>
      `;
      button.addEventListener("click", () => {
        state.activePlaylistId = playlist.id;
        renderAll();
      });
      playlistList.appendChild(button);
    });
  }

  function renderPlaylistDetail() {
    const playlist = getActivePlaylist();
    activePlaylistTitle.textContent = playlist ? playlist.name : "Library View";
    renamePlaylistButton.disabled = !playlist;
    deletePlaylistButton.disabled = !playlist;

    if (!playlist) {
      playlistDetail.className = "playlist-detail empty-state";
      playlistDetail.textContent = "Select a playlist to add tracks, remove tracks, and reorder them.";
      return;
    }

    playlistDetail.className = "playlist-detail";
    playlistDetail.innerHTML = "";

    if (!playlist.trackIds.length) {
      playlistDetail.innerHTML = '<div class="empty-state">This playlist is empty. Use "Add to Playlist" on any track card.</div>';
      return;
    }

    playlist.trackIds.forEach((trackId, index) => {
      const track = trackMap.get(trackId);
      if (!track) {
        return;
      }

      const row = document.createElement("article");
      row.className = "playlist-track";
      row.innerHTML = `
        <div class="playlist-track-head">
          <div>
            <h3>${index + 1}. ${escapeHtml(track.title)}</h3>
            <p class="playlist-track-meta">${escapeHtml(track.artist)} • ${capitalize(track.category)}</p>
          </div>
        </div>
        <div class="playlist-track-actions">
          <button class="primary-action" type="button" data-action="play">Play</button>
          <button type="button" data-action="up">Move Up</button>
          <button type="button" data-action="down">Move Down</button>
          <button type="button" data-action="remove">Remove</button>
        </div>
      `;

      row.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.action;
          if (action === "play") {
            playTrack(track.id, [...playlist.trackIds], playlist.name);
          } else if (action === "up") {
            moveTrackInPlaylist(playlist.id, index, index - 1);
          } else if (action === "down") {
            moveTrackInPlaylist(playlist.id, index, index + 1);
          } else if (action === "remove") {
            removeTrackFromPlaylist(playlist.id, track.id);
          }
        });
      });

      playlistDetail.appendChild(row);
    });
  }

  function renderLicenseTable() {
    licenseTableBody.innerHTML = "";
    TRACK_LIBRARY.forEach((track) => {
      const row = document.createElement("tr");
      const sourceCell = track.sourceUrl
        ? `<a href="${track.sourceUrl}" target="_blank" rel="noreferrer">Open source</a>`
        : escapeHtml(track.sourceName);

      row.innerHTML = `
        <td>${escapeHtml(track.title)}</td>
        <td>${escapeHtml(track.artist)}</td>
        <td>${capitalize(track.category)}</td>
        <td>${escapeHtml(track.license)}</td>
        <td>${sourceCell}</td>
      `;
      licenseTableBody.appendChild(row);
    });
  }

  function syncToggles() {
    favoritesFilterButton.setAttribute("aria-pressed", String(state.settings.favoritesOnly));
    shuffleButton.setAttribute("aria-pressed", String(state.settings.shuffle));
    shuffleButton.classList.toggle("active", state.settings.shuffle);
    repeatButton.textContent = `Repeat: ${capitalize(state.settings.repeatMode)}`;
    repeatButton.dataset.mode = state.settings.repeatMode;
    focusToggle.setAttribute("aria-pressed", String(state.settings.focusMode));
    document.body.classList.toggle("focus-mode", state.settings.focusMode);
  }

  function getFilteredTracks() {
    const query = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;

    return TRACK_LIBRARY.filter((track) => {
      const matchesQuery =
        !query ||
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.category.toLowerCase().includes(query);

      const matchesCategory = category === "all" || track.category === category;
      const matchesFavorite = !state.settings.favoritesOnly || state.favorites.has(track.id);
      return matchesQuery && matchesCategory && matchesFavorite;
    });
  }

  function handleCreatePlaylist(event) {
    event.preventDefault();
    const name = playlistNameInput.value.trim();
    if (!name) {
      return;
    }

    const playlist = {
      id: `playlist-${Date.now()}`,
      name,
      trackIds: []
    };

    state.playlists.push(playlist);
    state.activePlaylistId = playlist.id;
    playlistNameInput.value = "";
    savePlaylists();
    renderAll();
  }

  function handleRenamePlaylist() {
    const playlist = getActivePlaylist();
    if (!playlist) {
      return;
    }

    const nextName = window.prompt("Rename playlist", playlist.name);
    if (!nextName) {
      return;
    }

    playlist.name = nextName.trim() || playlist.name;
    savePlaylists();
    renderAll();
  }

  function handleDeletePlaylist() {
    const playlist = getActivePlaylist();
    if (!playlist) {
      return;
    }

    const confirmed = window.confirm(`Delete "${playlist.name}"? This only removes it from this browser.`);
    if (!confirmed) {
      return;
    }

    state.playlists = state.playlists.filter((item) => item.id !== playlist.id);
    state.activePlaylistId = null;
    savePlaylists();
    renderAll();
  }

  function addTrackToPlaylistPrompt(trackId) {
    if (!state.playlists.length) {
      window.alert("Create a playlist first, then add tracks to it.");
      return;
    }

    const names = state.playlists.map((playlist, index) => `${index + 1}. ${playlist.name}`).join("\n");
    const input = window.prompt(`Add this track to which playlist?\n${names}`);
    if (!input) {
      return;
    }

    const numericChoice = Number(input);
    const playlist =
      Number.isInteger(numericChoice) && numericChoice >= 1 && numericChoice <= state.playlists.length
        ? state.playlists[numericChoice - 1]
        : state.playlists.find((item) => item.name.toLowerCase() === input.trim().toLowerCase());

    if (!playlist) {
      window.alert("Playlist not found.");
      return;
    }

    if (!playlist.trackIds.includes(trackId)) {
      playlist.trackIds.push(trackId);
      savePlaylists();
    }

    state.activePlaylistId = playlist.id;
    renderAll();
  }

  function removeTrackFromPlaylist(playlistId, trackId) {
    const playlist = state.playlists.find((item) => item.id === playlistId);
    if (!playlist) {
      return;
    }

    playlist.trackIds = playlist.trackIds.filter((id) => id !== trackId);
    savePlaylists();
    renderAll();
  }

  function moveTrackInPlaylist(playlistId, fromIndex, toIndex) {
    const playlist = state.playlists.find((item) => item.id === playlistId);
    if (!playlist || toIndex < 0 || toIndex >= playlist.trackIds.length) {
      return;
    }

    const [moved] = playlist.trackIds.splice(fromIndex, 1);
    playlist.trackIds.splice(toIndex, 0, moved);
    savePlaylists();
    renderPlaylistDetail();
  }

  function toggleFavorite(trackId) {
    if (state.favorites.has(trackId)) {
      state.favorites.delete(trackId);
    } else {
      state.favorites.add(trackId);
    }
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify([...state.favorites]));
    renderAll();
  }

  async function playTrack(trackId, queue, label) {
    const track = trackMap.get(trackId);
    if (!track) {
      return;
    }

    state.currentTrackId = track.id;
    state.currentQueue = Array.isArray(queue) && queue.length ? [...queue] : [track.id];
    state.currentQueueLabel = label || "Library";

    try {
      const source = await resolveTrackSource(track);
      if (audio.src !== source) {
        audio.src = source;
      }
      await audio.play();
    } catch (error) {
      console.error("Unable to play track", error);
      window.alert("This track could not be played. Check the file path or replace the demo track with a valid legal audio file.");
    }

    updatePlayerUi();
  }

  function togglePlayPause() {
    if (!state.currentTrackId) {
      const visibleTracks = getFilteredTracks();
      const firstTrack = visibleTracks[0] || TRACK_LIBRARY[0];
      if (firstTrack) {
        playTrack(firstTrack.id, (visibleTracks.length ? visibleTracks : TRACK_LIBRARY).map((track) => track.id), "Filtered Library");
      }
      return;
    }

    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }

  function playPreviousTrack() {
    if (!state.currentTrackId) {
      return;
    }

    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    const queue = getCurrentQueue();
    const currentIndex = queue.indexOf(state.currentTrackId);
    const previousIndex = currentIndex <= 0 ? queue.length - 1 : currentIndex - 1;
    playTrack(queue[previousIndex], queue, state.currentQueueLabel);
  }

  function playNextTrack() {
    if (!state.currentTrackId) {
      const firstTrack = TRACK_LIBRARY[0];
      if (firstTrack) {
        playTrack(firstTrack.id, TRACK_LIBRARY.map((track) => track.id), "Library");
      }
      return;
    }

    const queue = getCurrentQueue();
    const currentIndex = queue.indexOf(state.currentTrackId);

    if (state.settings.shuffle) {
      const remaining = queue.filter((id) => id !== state.currentTrackId);
      const nextId = remaining[Math.floor(Math.random() * remaining.length)] || state.currentTrackId;
      playTrack(nextId, queue, state.currentQueueLabel);
      return;
    }

    const atEnd = currentIndex >= queue.length - 1;
    if (atEnd && state.settings.repeatMode === "off") {
      audio.pause();
      audio.currentTime = 0;
      updatePlayerUi();
      return;
    }

    const nextIndex = atEnd ? 0 : currentIndex + 1;
    playTrack(queue[nextIndex], queue, state.currentQueueLabel);
  }

  function handleTrackEnded() {
    if (state.settings.repeatMode === "one" && state.currentTrackId) {
      playTrack(state.currentTrackId, getCurrentQueue(), state.currentQueueLabel);
      return;
    }
    playNextTrack();
  }

  function getCurrentQueue() {
    return state.currentQueue && state.currentQueue.length ? state.currentQueue : TRACK_LIBRARY.map((track) => track.id);
  }

  function handleSeek() {
    if (!audio.duration) {
      return;
    }
    audio.currentTime = (Number(seekBar.value) / 100) * audio.duration;
  }

  function handleVolumeChange() {
    audio.volume = Number(volumeSlider.value);
    state.settings.volume = audio.volume;
    saveSettings();
  }

  function syncProgress() {
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const currentTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    currentTimeLabel.textContent = formatTime(currentTime);
    durationLabel.textContent = formatTime(duration || (trackMap.get(state.currentTrackId)?.durationHint || 0));
    seekBar.value = duration ? String((currentTime / duration) * 100) : "0";
  }

  function updatePlayerUi() {
    const track = state.currentTrackId ? trackMap.get(state.currentTrackId) : null;

    if (!track) {
      trackTitle.textContent = "No track selected";
      trackMeta.textContent = "Pick a song from the safe library.";
      heroNowPlaying.textContent = "Choose a track to begin.";
      trackCover.alt = "";
      trackCover.src = getFallbackCover("SafeSound", "focus");
      playPauseButton.textContent = "Play";
      syncProgress();
      return;
    }

    trackTitle.textContent = track.title;
    trackMeta.textContent = `${track.artist} • ${capitalize(track.category)} • ${state.currentQueueLabel}`;
    heroNowPlaying.textContent = `${track.title} by ${track.artist}`;
    trackCover.src = getTrackCover(track);
    trackCover.alt = `Cover art for ${track.title}`;
    playPauseButton.textContent = audio.paused ? "Play" : "Pause";
    syncProgress();
  }

  function toggleAboutPanel() {
    const isHidden = aboutPanel.hasAttribute("hidden");
    if (isHidden) {
      aboutPanel.removeAttribute("hidden");
    } else {
      aboutPanel.setAttribute("hidden", "");
    }
    aboutToggle.setAttribute("aria-expanded", String(isHidden));
  }

  function toggleFocusMode() {
    state.settings.focusMode = !state.settings.focusMode;
    saveSettings();
    syncToggles();
  }

  function toggleShuffle() {
    state.settings.shuffle = !state.settings.shuffle;
    saveSettings();
    syncToggles();
  }

  function cycleRepeatMode() {
    const currentIndex = REPEAT_MODES.indexOf(state.settings.repeatMode);
    state.settings.repeatMode = REPEAT_MODES[(currentIndex + 1) % REPEAT_MODES.length];
    saveSettings();
    syncToggles();
  }

  function getActivePlaylist() {
    return state.playlists.find((playlist) => playlist.id === state.activePlaylistId) || null;
  }

  function savePlaylists() {
    localStorage.setItem(STORAGE_KEYS.playlists, JSON.stringify(state.playlists));
    renderStats();
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
  }

  async function resolveTrackSource(track) {
    if (track.src && !track.src.startsWith("generated:")) {
      return track.src;
    }

    // Generated tracks keep the starter library fully legal and self-contained.
    if (generatedTrackUrls.has(track.id)) {
      return generatedTrackUrls.get(track.id);
    }

    const url = await createGeneratedTrackUrl(track);
    generatedTrackUrls.set(track.id, url);
    return url;
  }

  async function createGeneratedTrackUrl(track) {
    const sequence = track.demo || {};
    const tempo = sequence.tempo || 80;
    const notes = Array.isArray(sequence.notes) && sequence.notes.length ? sequence.notes : ["C4", "E4", "G4", "E4"];
    const beatSeconds = 60 / tempo;
    const noteDuration = beatSeconds * 0.95;
    const sampleRate = 44100;
    const totalDuration = Math.max(notes.length * beatSeconds * 2, 28);
    const frameCount = Math.ceil(totalDuration * sampleRate);
    const offline = new OfflineAudioContext(2, frameCount, sampleRate);

    const master = offline.createGain();
    master.gain.value = 0.42;
    master.connect(offline.destination);

    const pad = offline.createOscillator();
    const padGain = offline.createGain();
    pad.type = "sine";
    pad.frequency.value = noteToFrequency(notes[0]);
    padGain.gain.value = 0.06;
    pad.connect(padGain);
    padGain.connect(master);
    pad.start(0);
    pad.stop(totalDuration);

    let cursor = 0;
    while (cursor < totalDuration - noteDuration) {
      notes.forEach((note, index) => {
        const start = cursor + index * beatSeconds;
        if (start >= totalDuration) {
          return;
        }

        const osc = offline.createOscillator();
        const gain = offline.createGain();
        osc.type = sequence.waveform || "triangle";
        osc.frequency.value = noteToFrequency(note);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.16, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + noteDuration);
        osc.connect(gain);
        gain.connect(master);
        osc.start(start);
        osc.stop(Math.min(start + noteDuration, totalDuration));
      });
      cursor += notes.length * beatSeconds;
    }

    const rendered = await offline.startRendering();
    const wav = audioBufferToWav(rendered);
    return URL.createObjectURL(new Blob([wav], { type: "audio/wav" }));
  }

  function audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1;
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const dataLength = buffer.length * blockAlign;
    const bufferLength = 44 + dataLength;
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);
    let offset = 0;

    function writeString(text) {
      for (let index = 0; index < text.length; index += 1) {
        view.setUint8(offset + index, text.charCodeAt(index));
      }
      offset += text.length;
    }

    function writeUint32(value) {
      view.setUint32(offset, value, true);
      offset += 4;
    }

    function writeUint16(value) {
      view.setUint16(offset, value, true);
      offset += 2;
    }

    writeString("RIFF");
    writeUint32(bufferLength - 8);
    writeString("WAVE");
    writeString("fmt ");
    writeUint32(16);
    writeUint16(format);
    writeUint16(numChannels);
    writeUint32(sampleRate);
    writeUint32(sampleRate * blockAlign);
    writeUint16(blockAlign);
    writeUint16(bitDepth);
    writeString("data");
    writeUint32(dataLength);

    const channelData = [];
    for (let channel = 0; channel < numChannels; channel += 1) {
      channelData.push(buffer.getChannelData(channel));
    }

    for (let sample = 0; sample < buffer.length; sample += 1) {
      for (let channel = 0; channel < numChannels; channel += 1) {
        const value = Math.max(-1, Math.min(1, channelData[channel][sample]));
        view.setInt16(offset, value < 0 ? value * 0x8000 : value * 0x7fff, true);
        offset += 2;
      }
    }

    return arrayBuffer;
  }

  function noteToFrequency(note) {
    const noteMap = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const match = /^([A-G])(#?)(\d)$/.exec(note);
    if (!match) {
      return 261.63;
    }

    const [, letter, sharp, octaveText] = match;
    const octave = Number(octaveText);
    const semitone = noteMap[letter] + (sharp ? 1 : 0);
    const midi = semitone + (octave + 1) * 12;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function getTrackCover(track) {
    return track.cover || getFallbackCover(track.title, track.category);
  }

  function getFallbackCover(title, category) {
    const palettes = {
      calm: ["#70b8ff", "#d6f0ff"],
      focus: ["#3ea97f", "#daf8e7"],
      upbeat: ["#f39b3d", "#fff0cb"],
      piano: ["#8a7aff", "#ebe7ff"],
      ambient: ["#4998d7", "#dbeeff"],
      classical: ["#d86f8b", "#ffe3ec"]
    };
    const [start, end] = palettes[category] || ["#1481ba", "#e5f3ff"];
    const safeTitle = escapeSvg(title);
    const safeCategory = escapeSvg(capitalize(category));
    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${start}" />
            <stop offset="100%" stop-color="${end}" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="28" fill="url(#g)" />
        <circle cx="150" cy="48" r="24" fill="rgba(255,255,255,0.35)" />
        <circle cx="54" cy="148" r="48" fill="rgba(255,255,255,0.25)" />
        <text x="24" y="94" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#16324f">${safeCategory}</text>
        <text x="24" y="124" font-family="Arial, sans-serif" font-size="15" fill="#16324f">${safeTitle}</text>
      </svg>
    `)}`;
  }

  function shortLicense(text) {
    return text.toLowerCase().includes("public domain") ? "PD" : text.toLowerCase().includes("cc0") ? "CC0" : "Demo";
  }

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.warn(`Could not load ${key}`, error);
      return fallback;
    }
  }

  function formatTime(seconds) {
    const total = Math.max(0, Math.floor(seconds || 0));
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }

  function capitalize(value) {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function escapeSvg(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js").catch((error) => {
          console.warn("Service worker registration failed", error);
        });
      });
    }
  }
})();
