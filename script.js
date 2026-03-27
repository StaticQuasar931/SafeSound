(function () {
  const STORAGE_KEYS = {
    playlists: "safesound.playlists",
    favorites: "safesound.favorites",
    settings: "safesound.settings",
    customTracks: "safesound.customTracks"
  };

  const CATEGORY_ORDER = ["calm", "focus", "lofi", "upbeat", "piano", "ambient", "classical", "lyrics"];
  const REPEAT_MODES = ["off", "all", "one"];
  const COMPOSER_PATTERNS = {
    drift: ["C4", "E4", "G4", "E4", "D4", "C4", "A3", "C4"],
    bounce: ["C4", "G4", "A4", "G4", "E4", "G4", "D4", "G4"],
    night: ["C4", "D4", "G4", "A4", "G4", "E4", "D4", "C4"],
    spark: ["C4", "E4", "A4", "C5", "B4", "A4", "G4", "E4"],
    piano: ["C4", "G4", "E4", "G4", "A4", "E4", "D4", "C4"]
  };
  const PATTERN_BASS = {
    drift: ["C2", "G2", "A2", "G2"],
    bounce: ["C2", "C3", "D2", "G2"],
    night: ["A2", "E2", "G2", "E2"],
    spark: ["F2", "C3", "G2", "C3"],
    piano: ["C2", "G2", "F2", "G2"]
  };
  const RANDOM_IDEAS = [
    { title: "Homework Halo", artist: "Student Creator", category: "focus", tempo: 84, waveform: "triangle", root: "D", pattern: "drift" },
    { title: "Late Bus Lo-fi", artist: "Student Creator", category: "lofi", tempo: 90, waveform: "sine", root: "A", pattern: "night" },
    { title: "Sunny Notes", artist: "Student Creator", category: "upbeat", tempo: 108, waveform: "sawtooth", root: "G", pattern: "bounce" },
    { title: "Quiet Pencil", artist: "Student Creator", category: "piano", tempo: 76, waveform: "triangle", root: "F", pattern: "piano" }
  ];

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
  const lyricFilterButton = document.getElementById("lyricFilter");
  const categoryChips = document.getElementById("categoryChips");
  const aboutToggle = document.getElementById("aboutToggle");
  const aboutPanel = document.getElementById("aboutPanel");
  const themeToggle = document.getElementById("themeToggle");
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
  const heroTrackDescription = document.getElementById("heroTrackDescription");
  const lyricsPanelBody = document.getElementById("lyricsPanelBody");
  const licenseTableBody = document.getElementById("licenseTableBody");
  const trackCount = document.getElementById("trackCount");
  const favoriteCount = document.getElementById("favoriteCount");
  const playlistCount = document.getElementById("playlistCount");
  const resultsSummary = document.getElementById("resultsSummary");
  const composerForm = document.getElementById("composerForm");
  const composerTitle = document.getElementById("composerTitle");
  const composerArtist = document.getElementById("composerArtist");
  const composerCategory = document.getElementById("composerCategory");
  const composerTempo = document.getElementById("composerTempo");
  const composerWaveform = document.getElementById("composerWaveform");
  const composerRoot = document.getElementById("composerRoot");
  const composerPattern = document.getElementById("composerPattern");
  const composerLyrics = document.getElementById("composerLyrics");
  const tempoReadout = document.getElementById("tempoReadout");
  const composerPreviewTitle = document.getElementById("composerPreviewTitle");
  const composerPreviewMeta = document.getElementById("composerPreviewMeta");
  const previewComposerButton = document.getElementById("previewComposerButton");
  const randomizeComposerButton = document.getElementById("randomizeComposerButton");

  const state = {
    playlists: loadJson(STORAGE_KEYS.playlists, []),
    favorites: new Set(loadJson(STORAGE_KEYS.favorites, [])),
    customTracks: loadJson(STORAGE_KEYS.customTracks, []),
    settings: {
      shuffle: false,
      repeatMode: "off",
      focusMode: false,
      darkMode: false,
      volume: 0.8,
      favoritesOnly: false,
      lyricsOnly: false,
      ...loadJson(STORAGE_KEYS.settings, {})
    },
    activePlaylistId: null,
    currentTrackId: null,
    currentQueue: [],
    currentQueueLabel: "Library"
  };

  const generatedTrackUrls = new Map();
  audio.volume = Number(state.settings.volume) || 0.8;
  volumeSlider.value = String(audio.volume);

  applyTheme();
  syncLibrary();
  populateCategoryOptions();
  seedComposerForm();
  bindEvents();
  renderAll();
  updatePlayerUi();
  registerServiceWorker();

  function bindEvents() {
    playlistForm.addEventListener("submit", handleCreatePlaylist);
    newPlaylistButton.addEventListener("click", () => playlistNameInput.focus());
    renamePlaylistButton.addEventListener("click", handleRenamePlaylist);
    deletePlaylistButton.addEventListener("click", handleDeletePlaylist);
    searchInput.addEventListener("input", renderTrackGrid);
    categoryFilter.addEventListener("change", () => {
      renderTrackGrid();
      syncToggles();
    });
    favoritesFilterButton.addEventListener("click", () => {
      state.settings.favoritesOnly = !state.settings.favoritesOnly;
      saveSettings();
      renderAll();
    });
    lyricFilterButton.addEventListener("click", () => {
      state.settings.lyricsOnly = !state.settings.lyricsOnly;
      saveSettings();
      renderAll();
    });
    aboutToggle.addEventListener("click", toggleAboutPanel);
    themeToggle.addEventListener("click", toggleTheme);
    focusToggle.addEventListener("click", toggleFocusMode);
    playPauseButton.addEventListener("click", togglePlayPause);
    prevButton.addEventListener("click", playPreviousTrack);
    nextButton.addEventListener("click", playNextTrack);
    shuffleButton.addEventListener("click", toggleShuffle);
    repeatButton.addEventListener("click", cycleRepeatMode);
    seekBar.addEventListener("input", handleSeek);
    volumeSlider.addEventListener("input", handleVolumeChange);
    composerTempo.addEventListener("input", updateComposerPreview);
    composerWaveform.addEventListener("change", updateComposerPreview);
    composerCategory.addEventListener("change", updateComposerPreview);
    composerRoot.addEventListener("change", updateComposerPreview);
    composerPattern.addEventListener("change", updateComposerPreview);
    composerTitle.addEventListener("input", updateComposerPreview);
    composerArtist.addEventListener("input", updateComposerPreview);
    composerForm.addEventListener("submit", handleCreateCustomTrack);
    previewComposerButton.addEventListener("click", previewComposerTrack);
    randomizeComposerButton.addEventListener("click", randomizeComposerForm);

    audio.addEventListener("timeupdate", () => {
      syncProgress();
      renderLyricsPanel();
    });
    audio.addEventListener("loadedmetadata", () => {
      syncProgress();
      renderLyricsPanel();
    });
    audio.addEventListener("ended", handleTrackEnded);
    audio.addEventListener("play", updatePlayerUi);
    audio.addEventListener("pause", updatePlayerUi);

    document.addEventListener("keydown", handleKeyboardShortcuts);
  }

  function handleKeyboardShortcuts(event) {
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
    } else if (event.key.toLowerCase() === "d") {
      toggleTheme();
    }
  }

  function syncLibrary() {
    state.library = [...TRACK_LIBRARY, ...state.customTracks];
    state.trackMap = new Map(state.library.map((track) => [track.id, track]));
    if (!state.currentQueue.length) {
      state.currentQueue = state.library.map((track) => track.id);
    }
  }

  function populateCategoryOptions() {
    categoryFilter.innerHTML = '<option value="all">All categories</option>';
    composerCategory.innerHTML = "";
    categoryChips.innerHTML = "";

    CATEGORY_ORDER.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = capitalize(category);
      categoryFilter.appendChild(option);

      const makerOption = document.createElement("option");
      makerOption.value = category;
      makerOption.textContent = capitalize(category);
      composerCategory.appendChild(makerOption);

      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = capitalize(category);
      chip.addEventListener("click", () => {
        categoryFilter.value = categoryFilter.value === category ? "all" : category;
        renderTrackGrid();
        syncToggles();
      });
      categoryChips.appendChild(chip);
    });
  }

  function seedComposerForm() {
    composerTitle.value = "My Study Beat";
    composerArtist.value = "Student Creator";
    composerCategory.value = "focus";
    composerTempo.value = "88";
    composerWaveform.value = "triangle";
    composerRoot.value = "C";
    composerPattern.value = "drift";
    updateComposerPreview();
  }

  function updateComposerPreview() {
    const title = composerTitle.value.trim() || "My Study Beat";
    const category = composerCategory.value || "focus";
    const tempo = Number(composerTempo.value || 88);
    const waveformLabel = composerWaveform.options[composerWaveform.selectedIndex].textContent;
    composerPreviewTitle.textContent = title;
    composerPreviewMeta.textContent = `${capitalize(category)} | ${tempo} BPM | ${waveformLabel}`;
    tempoReadout.textContent = `${tempo} BPM`;
  }

  function randomizeComposerForm() {
    const idea = RANDOM_IDEAS[Math.floor(Math.random() * RANDOM_IDEAS.length)];
    composerTitle.value = idea.title;
    composerArtist.value = idea.artist;
    composerCategory.value = idea.category;
    composerTempo.value = String(idea.tempo);
    composerWaveform.value = idea.waveform;
    composerRoot.value = idea.root;
    composerPattern.value = idea.pattern;
    composerLyrics.value = "";
    updateComposerPreview();
  }

  function renderAll() {
    syncLibrary();
    renderPlaylistList();
    renderPlaylistDetail();
    renderTrackGrid();
    renderLicenseTable();
    renderStats();
    renderLyricsPanel();
    syncToggles();
  }

  function renderStats() {
    trackCount.textContent = String(state.library.length);
    favoriteCount.textContent = String(state.favorites.size);
    playlistCount.textContent = String(state.playlists.length);
  }

  function getFilteredTracks() {
    const query = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;

    return state.library.filter((track) => {
      const matchesQuery =
        !query ||
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.category.toLowerCase().includes(query) ||
        (track.mood || "").toLowerCase().includes(query);
      const matchesCategory = category === "all" || track.category === category;
      const matchesFavorite = !state.settings.favoritesOnly || state.favorites.has(track.id);
      const matchesLyrics = !state.settings.lyricsOnly || (track.lyrics && track.lyrics.length);
      return matchesQuery && matchesCategory && matchesFavorite && matchesLyrics;
    });
  }

  function renderTrackGrid() {
    const tracks = getFilteredTracks();
    resultsSummary.textContent = `${tracks.length} track${tracks.length === 1 ? "" : "s"} shown`;
    trackGrid.innerHTML = "";

    if (!tracks.length) {
      trackGrid.innerHTML = '<div class="empty-state">No tracks match your current filters.</div>';
      return;
    }

    tracks.forEach((track) => {
      const isFavorite = state.favorites.has(track.id);
      const isCustom = track.id.startsWith("custom-");
      const card = document.createElement("article");
      card.className = "track-card";
      card.innerHTML = `
        <img class="track-art" src="${getTrackCover(track)}" alt="Cover art for ${escapeHtml(track.title)}">
        <div>
          <h3>${escapeHtml(track.title)}</h3>
          <p>${escapeHtml(track.artist)}</p>
        </div>
        <p class="track-meta">${capitalize(track.category)} | ${capitalize(track.mood || "safe")} | ${formatTime(track.durationHint || 0)}</p>
        <div class="tag-row">
          <span class="tag">${capitalize(track.category)}</span>
          <span class="tag">${track.lyrics && track.lyrics.length ? "Lyrics" : "Instrumental"}</span>
          <span class="tag">${isCustom ? "Custom" : "Bundled"}</span>
        </div>
        <div class="track-actions">
          <button class="primary-action" type="button" data-action="play">Play</button>
          <button type="button" data-action="favorite">${isFavorite ? "Unfavorite" : "Favorite"}</button>
          <button type="button" data-action="playlist">Add to Playlist</button>
          ${isCustom ? '<button type="button" data-action="delete">Delete</button>' : ""}
        </div>
      `;

      card.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.action;
          if (action === "play") {
            playTrack(track.id, tracks.map((item) => item.id), "Filtered Library");
          } else if (action === "favorite") {
            toggleFavorite(track.id);
          } else if (action === "playlist") {
            addTrackToPlaylistPrompt(track.id);
          } else if (action === "delete") {
            deleteCustomTrack(track.id);
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
      const track = state.trackMap.get(trackId);
      if (!track) {
        return;
      }

      const row = document.createElement("article");
      row.className = "playlist-track";
      row.innerHTML = `
        <div>
          <h3>${index + 1}. ${escapeHtml(track.title)}</h3>
          <p class="playlist-track-meta">${escapeHtml(track.artist)} | ${capitalize(track.category)}</p>
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

  function renderLyricsPanel() {
    const track = state.trackMap.get(state.currentTrackId);
    if (!track || !track.lyrics || !track.lyrics.length) {
      lyricsPanelBody.className = "lyrics-body empty-state";
      lyricsPanelBody.textContent = "Play a lyric track to see original school-safe lyrics here.";
      return;
    }

    const now = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const activeIndex = getActiveLyricIndex(track.lyrics, now);
    lyricsPanelBody.className = "lyrics-body";
    lyricsPanelBody.innerHTML = "";

    track.lyrics.forEach((line, index) => {
      const row = document.createElement("div");
      row.className = `lyric-line${index === activeIndex ? " active" : ""}`;
      row.innerHTML = `<strong>${formatTime(line.time)}</strong><p>${escapeHtml(line.text)}</p>`;
      lyricsPanelBody.appendChild(row);
    });
  }

  function renderLicenseTable() {
    licenseTableBody.innerHTML = "";
    state.library.forEach((track) => {
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
    lyricFilterButton.setAttribute("aria-pressed", String(state.settings.lyricsOnly));
    shuffleButton.setAttribute("aria-pressed", String(state.settings.shuffle));
    shuffleButton.classList.toggle("active", state.settings.shuffle);
    repeatButton.textContent = `Repeat: ${capitalize(state.settings.repeatMode)}`;
    focusToggle.setAttribute("aria-pressed", String(state.settings.focusMode));
    themeToggle.setAttribute("aria-pressed", String(state.settings.darkMode));
    themeToggle.textContent = state.settings.darkMode ? "Light Mode" : "Dark Mode";
    document.body.classList.toggle("focus-mode", state.settings.focusMode);

    [...categoryChips.querySelectorAll(".chip")].forEach((chip) => {
      chip.classList.toggle("active", chip.textContent.toLowerCase() === categoryFilter.value);
    });
  }

  function handleCreatePlaylist(event) {
    event.preventDefault();
    const name = playlistNameInput.value.trim();
    if (!name) {
      return;
    }
    state.playlists.push({ id: `playlist-${Date.now()}`, name, trackIds: [] });
    state.activePlaylistId = state.playlists[state.playlists.length - 1].id;
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
    if (!window.confirm(`Delete "${playlist.name}" from this browser?`)) {
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

    const numberChoice = Number(input);
    const playlist =
      Number.isInteger(numberChoice) && numberChoice >= 1 && numberChoice <= state.playlists.length
        ? state.playlists[numberChoice - 1]
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
    const moved = playlist.trackIds.splice(fromIndex, 1)[0];
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
    const track = state.trackMap.get(trackId);
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
      const firstTrack = visibleTracks[0] || state.library[0];
      if (firstTrack) {
        playTrack(firstTrack.id, (visibleTracks.length ? visibleTracks : state.library).map((track) => track.id), "Filtered Library");
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
      const firstTrack = state.library[0];
      if (firstTrack) {
        playTrack(firstTrack.id, state.library.map((track) => track.id), "Library");
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
    durationLabel.textContent = formatTime(duration || (state.trackMap.get(state.currentTrackId)?.durationHint || 0));
    seekBar.value = duration ? String((currentTime / duration) * 100) : "0";
  }

  function updatePlayerUi() {
    const track = state.trackMap.get(state.currentTrackId);
    if (!track) {
      trackTitle.textContent = "No track selected";
      trackMeta.textContent = "Pick something from the safe library.";
      heroNowPlaying.textContent = "Choose a track to begin.";
      heroTrackDescription.textContent = "SafeSound includes chill instrumentals, gentle focus tracks, and original lyric experiments.";
      trackCover.alt = "";
      trackCover.src = getFallbackCover("SafeSound", "focus", "safe");
      playPauseButton.textContent = "Play";
      syncProgress();
      return;
    }

    trackTitle.textContent = track.title;
    trackMeta.textContent = `${track.artist} | ${capitalize(track.category)} | ${state.currentQueueLabel}`;
    heroNowPlaying.textContent = `${track.title} by ${track.artist}`;
    heroTrackDescription.textContent = track.lyrics && track.lyrics.length
      ? "Original school-safe lyric track."
      : `${capitalize(track.mood || "safe")} mood generated for SafeSound.`;
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

  function toggleTheme() {
    state.settings.darkMode = !state.settings.darkMode;
    applyTheme();
    saveSettings();
    syncToggles();
  }

  function applyTheme() {
    document.body.classList.toggle("dark", Boolean(state.settings.darkMode));
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

  function previewComposerTrack() {
    const previewTrack = buildComposerTrack("custom-preview-track");
    state.trackMap.set(previewTrack.id, previewTrack);
    playTrack(previewTrack.id, [previewTrack.id], "Studio Preview");
  }

  function handleCreateCustomTrack(event) {
    event.preventDefault();
    const track = buildComposerTrack(`custom-${Date.now()}`);
    state.customTracks.unshift(track);
    saveCustomTracks();
    syncLibrary();
    renderAll();
    playTrack(track.id, [track.id], "Custom Track");
  }

  function buildComposerTrack(id) {
    const title = composerTitle.value.trim() || "My Study Beat";
    const artist = composerArtist.value.trim() || "Student Creator";
    const category = composerCategory.value || "focus";
    const patternName = composerPattern.value || "drift";
    const root = composerRoot.value || "C";
    const waveform = composerWaveform.value || "triangle";
    const tempo = Number(composerTempo.value || 88);
    const notes = transposePattern(COMPOSER_PATTERNS[patternName], root);
    const bassNotes = transposePattern(PATTERN_BASS[patternName], root);
    const lyricLines = composerLyrics.value.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 12);

    return {
      id,
      title,
      artist,
      category,
      mood: patternName,
      src: `generated:${id}`,
      cover: "",
      license: "Original custom track generated locally in this browser.",
      sourceName: "Created in SafeSound Studio",
      sourceUrl: "",
      durationHint: Math.max(56, lyricLines.length * 8 || 64),
      lyrics: lyricLines.map((text, index) => ({ time: index * 8, text })),
      demo: {
        tempo,
        waveform,
        notes,
        bassNotes,
        beatStyle: category === "lofi" ? "lofi" : "soft"
      }
    };
  }

  function transposePattern(pattern, root) {
    const semitoneOffsets = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9 };
    const offset = semitoneOffsets[root] || 0;
    return pattern.map((note) => midiToNote(noteToMidi(note) + offset));
  }

  function deleteCustomTrack(trackId) {
    if (!window.confirm("Delete this custom track from this browser?")) {
      return;
    }

    state.customTracks = state.customTracks.filter((track) => track.id !== trackId);
    state.playlists.forEach((playlist) => {
      playlist.trackIds = playlist.trackIds.filter((id) => id !== trackId);
    });
    if (state.currentTrackId === trackId) {
      audio.pause();
      audio.removeAttribute("src");
      state.currentTrackId = null;
    }
    saveCustomTracks();
    savePlaylists();
    syncLibrary();
    renderAll();
    updatePlayerUi();
  }

  function getCurrentQueue() {
    return state.currentQueue && state.currentQueue.length ? state.currentQueue : state.library.map((track) => track.id);
  }

  function getActivePlaylist() {
    return state.playlists.find((playlist) => playlist.id === state.activePlaylistId) || null;
  }

  function savePlaylists() {
    localStorage.setItem(STORAGE_KEYS.playlists, JSON.stringify(state.playlists));
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
  }

  function saveCustomTracks() {
    localStorage.setItem(STORAGE_KEYS.customTracks, JSON.stringify(state.customTracks));
  }

  async function resolveTrackSource(track) {
    if (track.src && !track.src.startsWith("generated:")) {
      return track.src;
    }
    if (generatedTrackUrls.has(track.id)) {
      return generatedTrackUrls.get(track.id);
    }
    const url = await createGeneratedTrackUrl(track);
    generatedTrackUrls.set(track.id, url);
    return url;
  }

  async function createGeneratedTrackUrl(track) {
    const sequence = track.demo || {};
    const tempo = sequence.tempo || 84;
    const melody = Array.isArray(sequence.notes) && sequence.notes.length ? sequence.notes : ["C4", "E4", "G4", "E4"];
    const bass = Array.isArray(sequence.bassNotes) && sequence.bassNotes.length ? sequence.bassNotes : ["C2", "G2", "A2", "G2"];
    const sampleRate = 44100;
    const beatSeconds = 60 / tempo;
    const totalDuration = Math.max(track.durationHint || 56, melody.length * beatSeconds * 4);
    const frameCount = Math.ceil(totalDuration * sampleRate);
    const context = new OfflineAudioContext(2, frameCount, sampleRate);
    const master = context.createGain();
    master.gain.value = 0.48;
    master.connect(context.destination);

    createPadLayer(context, master, melody, totalDuration);
    createMelodyLayer(context, master, melody, beatSeconds, totalDuration, sequence.waveform || "triangle");
    createBassLayer(context, master, bass, beatSeconds, totalDuration);
    createBeatLayer(context, master, beatSeconds, totalDuration, sequence.beatStyle || "soft");

    const rendered = await context.startRendering();
    const wavBuffer = audioBufferToWav(rendered);
    return URL.createObjectURL(new Blob([wavBuffer], { type: "audio/wav" }));
  }

  function createPadLayer(context, master, melody, totalDuration) {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "sine";
    osc.frequency.value = noteToFrequency(melody[0]);
    gain.gain.value = 0.04;
    osc.connect(gain);
    gain.connect(master);
    osc.start(0);
    osc.stop(totalDuration);
  }

  function createMelodyLayer(context, master, melody, beatSeconds, totalDuration, waveform) {
    const noteDuration = beatSeconds * 0.9;
    let cursor = 0;
    while (cursor < totalDuration - noteDuration) {
      melody.forEach((note, index) => {
        const start = cursor + index * beatSeconds;
        if (start >= totalDuration) {
          return;
        }
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = waveform;
        osc.frequency.value = noteToFrequency(note);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.14, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + noteDuration);
        osc.connect(gain);
        gain.connect(master);
        osc.start(start);
        osc.stop(Math.min(start + noteDuration, totalDuration));
      });
      cursor += melody.length * beatSeconds;
    }
  }

  function createBassLayer(context, master, bass, beatSeconds, totalDuration) {
    const step = beatSeconds * 2;
    const noteDuration = beatSeconds * 1.8;
    let cursor = 0;
    while (cursor < totalDuration - noteDuration) {
      bass.forEach((note, index) => {
        const start = cursor + index * step;
        if (start >= totalDuration) {
          return;
        }
        const osc = context.createOscillator();
        const filter = context.createBiquadFilter();
        const gain = context.createGain();
        osc.type = "sine";
        osc.frequency.value = noteToFrequency(note);
        filter.type = "lowpass";
        filter.frequency.value = 420;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.12, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + noteDuration);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(master);
        osc.start(start);
        osc.stop(Math.min(start + noteDuration, totalDuration));
      });
      cursor += bass.length * step;
    }
  }

  function createBeatLayer(context, master, beatSeconds, totalDuration, beatStyle) {
    let start = 0;
    while (start < totalDuration) {
      createKick(context, master, start);
      createHat(context, master, start + beatSeconds * 0.5, beatStyle === "lofi" ? 0.03 : 0.02);
      createHat(context, master, start + beatSeconds * 1.5, beatStyle === "lofi" ? 0.04 : 0.025);
      if (beatStyle === "lofi") {
        createSnare(context, master, start + beatSeconds, 0.05);
        createSnare(context, master, start + beatSeconds * 3, 0.05);
      }
      start += beatSeconds * 4;
    }
  }

  function createKick(context, master, start) {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, start);
    osc.frequency.exponentialRampToValueAtTime(55, start + 0.18);
    gain.gain.setValueAtTime(0.16, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);
    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(start + 0.22);
  }

  function createHat(context, master, start, level) {
    const buffer = createNoiseBuffer(context, 0.05);
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = "highpass";
    filter.frequency.value = 5500;
    gain.gain.setValueAtTime(level, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.04);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(start);
    source.stop(start + 0.05);
  }

  function createSnare(context, master, start, level) {
    const buffer = createNoiseBuffer(context, 0.12);
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.value = 1800;
    gain.gain.setValueAtTime(level, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.11);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(start);
    source.stop(start + 0.12);
  }

  function createNoiseBuffer(context, duration) {
    const frameCount = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  function audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const dataLength = buffer.length * blockAlign;
    const bufferLength = 44 + dataLength;
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);
    let offset = 0;

    function writeString(text) {
      for (let i = 0; i < text.length; i += 1) {
        view.setUint8(offset + i, text.charCodeAt(i));
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
    writeUint16(1);
    writeUint16(numChannels);
    writeUint32(sampleRate);
    writeUint32(sampleRate * blockAlign);
    writeUint16(blockAlign);
    writeUint16(16);
    writeString("data");
    writeUint32(dataLength);

    const channels = [];
    for (let channel = 0; channel < numChannels; channel += 1) {
      channels.push(buffer.getChannelData(channel));
    }

    for (let sample = 0; sample < buffer.length; sample += 1) {
      for (let channel = 0; channel < numChannels; channel += 1) {
        const value = Math.max(-1, Math.min(1, channels[channel][sample]));
        view.setInt16(offset, value < 0 ? value * 0x8000 : value * 0x7fff, true);
        offset += 2;
      }
    }

    return arrayBuffer;
  }

  function noteToFrequency(note) {
    return 440 * Math.pow(2, (noteToMidi(note) - 69) / 12);
  }

  function noteToMidi(note) {
    const map = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const match = /^([A-G])(#?)(\d)$/.exec(note);
    if (!match) {
      return 60;
    }
    return map[match[1]] + (match[2] ? 1 : 0) + (Number(match[3]) + 1) * 12;
  }

  function midiToNote(midi) {
    const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const note = names[((midi % 12) + 12) % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${note}${octave}`;
  }

  function getActiveLyricIndex(lines, currentTime) {
    let activeIndex = 0;
    lines.forEach((line, index) => {
      if (currentTime >= line.time) {
        activeIndex = index;
      }
    });
    return activeIndex;
  }

  function getTrackCover(track) {
    return track.cover || getFallbackCover(track.title, track.category, track.mood);
  }

  function getFallbackCover(title, category, mood) {
    const palettes = {
      calm: ["#72bdfb", "#d9f0ff"],
      focus: ["#38a57a", "#d7f7e8"],
      lofi: ["#8b7bff", "#ece6ff"],
      upbeat: ["#ffa552", "#fff0d9"],
      piano: ["#f59bc4", "#ffe4f1"],
      ambient: ["#59b2c8", "#dbf7ff"],
      classical: ["#e2787d", "#ffe5e7"],
      lyrics: ["#668cff", "#e0e7ff"]
    };
    const palette = palettes[category] || ["#1778b5", "#e5f4ff"];
    const safeTitle = escapeSvg(title);
    const safeLabel = escapeSvg(`${capitalize(category)} | ${capitalize(mood || "safe")}`);
    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${palette[0]}" />
            <stop offset="100%" stop-color="${palette[1]}" />
          </linearGradient>
        </defs>
        <rect width="240" height="240" rx="28" fill="url(#bg)" />
        <circle cx="182" cy="56" r="30" fill="rgba(255,255,255,0.26)" />
        <circle cx="70" cy="182" r="54" fill="rgba(255,255,255,0.18)" />
        <rect x="26" y="28" width="90" height="26" rx="13" fill="rgba(255,255,255,0.24)" />
        <text x="26" y="115" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#14314f">${safeLabel}</text>
        <text x="26" y="148" font-family="Arial, sans-serif" font-size="16" fill="#14314f">${safeTitle}</text>
      </svg>
    `)}`;
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
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
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
