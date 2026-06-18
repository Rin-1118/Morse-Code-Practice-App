const letters = [
  { letter: "A", code: ".-", memo: "A は最初に軽く入ってから、右脚で長く支える形として「短・長」を思い出します。" },
  { letter: "B", code: "-...", memo: "B は背骨を長く置き、丸みを三つの軽い点として追うと「長・短・短・短」です。" },
  { letter: "C", code: "-.-.", memo: "C は大きな弧を長く始め、内側で短く返し、また長く回って短く閉じると考えます。" },
  { letter: "D", code: "-..", memo: "D は縦棒を長く打ち、右の丸みを二つの短い反応として「長・短・短」です。" },
  { letter: "E", code: ".", memo: "E は横棒が一つ。最小の印として短点一つです。" },
  { letter: "F", code: "..-.", memo: "F は上の二本を軽く、縦を長く、最後に中段を軽く戻す形で「短・短・長・短」です。" },
  { letter: "G", code: "--.", memo: "G は大きく回る力を二回長く取り、最後の小さな口を短点にします。" },
  { letter: "H", code: "....", memo: "H は左右の柱と横棒を細かく分け、四つの短い打点として覚えます。" },
  { letter: "I", code: "..", memo: "I は上下の印を二つの短点として見ると「短・短」です。" },
  { letter: "J", code: ".---", memo: "J は上の小さな点から入り、下へ大きく長く伸びる流れで「短・長・長・長」です。" },
  { letter: "K", code: "-.-", memo: "K は縦を長く、斜めで短く切り返し、もう一度長く開く形です。" },
  { letter: "L", code: ".-..", memo: "L は小さく始め、縦を長く落とし、足を二つの短い動きに分けます。" },
  { letter: "M", code: "--", memo: "M は二本の山をどちらも長く押すので「長・長」です。" },
  { letter: "N", code: "-.", memo: "N は斜めの大きな流れを長く、終点を短く置いて「長・短」です。" },
  { letter: "O", code: "---", memo: "O は丸を三つの長い弧に分けて「長・長・長」です。" },
  { letter: "P", code: ".--.", memo: "P は小さく始め、縦と丸みを長く取り、最後を短く閉じます。" },
  { letter: "Q", code: "--.-", memo: "Q は O の長い回転に、短いしっぽ、最後の長い押しを加える形です。" },
  { letter: "R", code: ".-.", memo: "R は小さく入り、縦を長く支え、斜め足を短く出して「短・長・短」です。" },
  { letter: "S", code: "...", memo: "S は曲線を三つの短い区切りでなぞるので「短・短・短」です。" },
  { letter: "T", code: "-", memo: "T は一本の横棒。短点より長く保つ長点一つです。" },
  { letter: "U", code: "..-", memo: "U は左右の上端を短く置き、底の曲線を長く支える形です。" },
  { letter: "V", code: "...-", memo: "V は細かく三回落ちて、最後に長く開く「短・短・短・長」です。" },
  { letter: "W", code: ".--", memo: "W は小さく入ってから二つの山を長く押すので「短・長・長」です。" },
  { letter: "X", code: "-..-", memo: "X は大きな斜線で長く入り、交点を短く二回、最後に長く抜けます。" },
  { letter: "Y", code: "-.--", memo: "Y は上の分岐を長く、中心を短く、下へ二回長く流す形です。" },
  { letter: "Z", code: "--..", memo: "Z は上辺と斜めを長く取り、下辺を二つの短い終点として覚えます。" }
];

const grid = document.querySelector(".letter-grid");
const shape = document.querySelector(".letter-shape");
const track = document.querySelector(".morse-track");
const selectedLetter = document.querySelector("#selected-letter");
const selectedCode = document.querySelector("#selected-code");
const selectedMemo = document.querySelector("#selected-memo");
const selectedVideoNote = document.querySelector("#selected-video-note");
const playButton = document.querySelector("#play-button");
const appScreens = [...document.querySelectorAll("[data-screen]")];
const appNavButtons = [...document.querySelectorAll("[data-screen-target]")];
const appTitles = {
  home: "Home",
  mode: "練習方法を選択",
  session: "レベルと問題数",
  listening: "リスニング練習",
  keying: "打鍵練習",
  tutorial: "チュートリアル",
  profile: "マイページ",
  settings: "詳細設定"
};
const sessionStateKey = "morsePractice.session.v1";
const defaultSessionState = {
  mode: "listening",
  level: "single",
  questionCount: 10,
  currentQuestion: 1,
  startedAt: null
};
let sessionState = loadSessionState();

let current = letters[0];
let audioContext;

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  audioContext = audioContext || new AudioContextClass();
  return audioContext;
}

function activateAppScreen(screenName, updateHash = true) {
  const target = appTitles[screenName] ? screenName : "home";

  appScreens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === target);
  });

  appNavButtons.forEach((button) => {
    const active = button.dataset.screenTarget === target;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  const title = document.querySelector(".app-header h1");
  if (title) {
    title.textContent = appTitles[target];
  }

  if (updateHash && window.location.hash !== `#app-${target}`) {
    history.pushState(null, "", `#app-${target}`);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function screenFromHash() {
  const hash = window.location.hash.replace("#", "");
  return hash.startsWith("app-") ? hash.replace("app-", "") : null;
}

window.MorsePracticeShell = {
  screens: Object.freeze({ ...appTitles }),
  activate: activateAppScreen,
  getActiveScreen() {
    const activeScreen = appScreens.find((screen) => screen.classList.contains("is-active"));
    return activeScreen ? activeScreen.dataset.screen : "home";
  }
};

window.MorsePracticeSession = {
  getState() {
    return { ...sessionState };
  },
  setState(patch) {
    sessionState = saveSessionState({ ...sessionState, ...patch });
    renderSessionState();
    return { ...sessionState };
  },
  start(mode, level, questionCount) {
    sessionState = saveSessionState({
      mode,
      level,
      questionCount: Number(questionCount) || defaultSessionState.questionCount,
      currentQuestion: 1,
      startedAt: new Date().toISOString()
    });
    renderSessionState();
    return { ...sessionState };
  }
};

function loadSessionState() {
  try {
    return {
      ...defaultSessionState,
      ...JSON.parse(localStorage.getItem(sessionStateKey) || "{}")
    };
  } catch {
    return { ...defaultSessionState };
  }
}

function saveSessionState(nextState) {
  const normalized = {
    ...defaultSessionState,
    ...nextState,
    questionCount: normalizedQuestionCount(Number(nextState.questionCount) || defaultSessionState.questionCount),
    currentQuestion: Math.max(1, Number(nextState.currentQuestion) || 1)
  };
  localStorage.setItem(sessionStateKey, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent("morse-session-change", { detail: normalized }));
  return normalized;
}

function sessionModeLabel(mode = sessionState.mode) {
  return mode === "keying" ? "打鍵練習" : "リスニング練習";
}

function renderSessionLevelLabels() {
  const listeningLabels = {
    single: "1文字",
    word: "短い単語",
    phrase: "短文",
    sentence: "長文"
  };
  const keyingLabels = {
    single: "初級",
    word: "A-Z",
    phrase: "0-9",
    sentence: "英数字"
  };
  const labels = sessionState.mode === "keying" ? keyingLabels : listeningLabels;
  document.querySelectorAll('input[name="sessionLevel"]').forEach((input) => {
    const label = input.closest("label");
    const text = label ? label.querySelector("span") : null;
    if (text) text.textContent = labels[input.value] || input.value;
  });
}

function renderSessionState() {
  document.querySelectorAll("[data-session-mode-label]").forEach((node) => {
    node.textContent = sessionModeLabel();
  });
  document.querySelectorAll("[data-session-summary]").forEach((node) => {
    node.textContent = `第${sessionState.currentQuestion}問 / ${sessionState.questionCount}問`;
  });

  const levelInput = document.querySelector(`input[name="sessionLevel"][value="${sessionState.level}"]`);
  if (levelInput) levelInput.checked = true;

  const countInput = document.querySelector('input[name="sessionQuestionCount"]');
  if (countInput) countInput.value = sessionState.questionCount;
  renderSessionLevelLabels();
}

function selectedSessionLevel() {
  return document.querySelector('input[name="sessionLevel"]:checked')?.value || sessionState.level;
}

function selectedQuestionCount() {
  return Number(document.querySelector('input[name="sessionQuestionCount"]')?.value) || sessionState.questionCount;
}

function applySessionToPractice() {
  if (sessionState.mode === "listening") {
    startListeningPractice({
      level: sessionState.level,
      questionCount: sessionState.questionCount
    });
    return;
  }

  if (typeof startKeyingSession === "function") {
    startKeyingSession({
      level: sessionState.level,
      questionCount: sessionState.questionCount
    });
  }
}

const MORSE_CODE = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  0: "-----",
  1: ".----",
  2: "..---",
  3: "...--",
  4: "....-",
  5: ".....",
  6: "-....",
  7: "--...",
  8: "---..",
  9: "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "/": "-..-.",
  "-": "-....-",
  "(": "-.--.",
  ")": "-.--.-"
};

const listeningChallenges = {
  single: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split(""),
  word: ["CODE", "RADIO", "SIGNAL", "WAVE", "TRAIN", "LIGHT", "SOUND", "POWER", "FIELD", "METER"],
  phrase: ["CQ TEST", "GOOD SIGNAL", "SEND CODE", "RADIO WAVE", "CHECK TONE", "COPY THAT", "SHORT WORDS", "CLEAR SOUND"],
  sentence: [
    "THE SIGNAL IS CLEAR",
    "PRACTICE MORSE EVERY DAY",
    "SEND THE MESSAGE AGAIN",
    "A STEADY TONE HELPS LISTENING",
    "COPY SHORT WORDS BEFORE LONG TEXT"
  ]
};

const listeningRecordKey = "morseListeningPractice.records.v1";
const listeningSettingsKey = "morseListeningPractice.settings.v1";
const listeningState = {
  challenge: "",
  level: "single",
  isPlaying: false,
  hasStarted: false,
  questionCount: 0,
  totalQuestions: defaultSessionState.questionCount,
  answeredCount: 0,
  correctCount: 0,
  awaitingNext: false,
  isComplete: false,
  settings: loadListeningSettings()
};

function listeningRoot() {
  return document.querySelector('[data-screen="listening"]');
}

function qsListening(selector) {
  return listeningRoot()?.querySelector(selector) || null;
}

function qsaListening(selector) {
  const root = listeningRoot();
  return root ? [...root.querySelectorAll(selector)] : [];
}

function renderGrid() {
  grid.innerHTML = letters.map((item, index) => `
    <button class="letter-button${index === 0 ? " is-active" : ""}" type="button" data-letter="${item.letter}">
      <span>${item.letter}</span>
      <span>${item.code}</span>
    </button>
  `).join("");
}

function renderMorse(item) {
  track.innerHTML = "";
  [...item.code].forEach((mark, index) => {
    const unit = document.createElement("span");
    unit.className = `morse-unit ${mark === "." ? "dot" : "dash"}`;
    unit.style.animationDelay = `${index * 130}ms`;
    track.appendChild(unit);
  });
}

function selectLetter(letter) {
  current = letters.find((item) => item.letter === letter) || letters[0];
  selectedLetter.textContent = current.letter;
  selectedCode.textContent = current.code;
  selectedMemo.textContent = current.memo;
  if (selectedVideoNote) {
    selectedVideoNote.textContent = `${current.letter} = ${current.code}。動画説明欄の A-Z 符号列に基づきます。`;
  }
  shape.textContent = current.letter;
  shape.dataset.letter = current.letter;
  shape.classList.remove("is-pulsing");
  void shape.offsetWidth;
  shape.classList.add("is-pulsing");
  renderMorse(current);

  document.querySelectorAll(".letter-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.letter === current.letter);
  });
}

function tone(duration, startTime) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 640;
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.22, startTime + 0.012);
  gain.gain.setValueAtTime(0.22, startTime + duration - 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

async function playCurrent() {
  const context = getAudioContext();
  if (!context) return;
  if (context.state === "suspended") {
    await context.resume();
  }

  const unit = 0.09;
  let cursor = context.currentTime + 0.05;
  [...current.code].forEach((mark) => {
    const duration = mark === "." ? unit : unit * 3;
    tone(duration, cursor);
    cursor += duration + unit;
  });
}

function loadListeningSettings() {
  const defaults = {
    speedWpm: 18,
    pitchHz: 650,
    volume: 70,
    letterGapMultiplier: 1,
    wordGapMultiplier: 1
  };
  const read = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || "{}");
    } catch {
      return {};
    }
  };

  try {
    const appSettings = read("morsePractice.settings.v1");
    const legacySettings = read(listeningSettingsKey);
    return {
      ...defaults,
      letterGapMultiplier: Number(legacySettings.letterGapMultiplier) || defaults.letterGapMultiplier,
      wordGapMultiplier: Number(legacySettings.wordGapMultiplier) || defaults.wordGapMultiplier,
      ...appSettings
    };
  } catch {
    return defaults;
  }
}

function saveListeningSettings() {
  localStorage.setItem(listeningSettingsKey, JSON.stringify(listeningState.settings));
}

function refreshListeningSettings() {
  listeningState.settings = loadListeningSettings();
  return listeningState.settings;
}

function getListeningRecords() {
  try {
    const records = JSON.parse(localStorage.getItem(listeningRecordKey) || "[]");
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

function saveListeningRecord(record) {
  const records = [record, ...getListeningRecords()].slice(0, 120);
  localStorage.setItem(listeningRecordKey, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent("morse:listening-record-saved", { detail: record }));
}

function normalizeAnswer(value) {
  return String(value)
    .toUpperCase()
    .replace(/[^A-Z0-9.,?/() -]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function textToMorse(text) {
  return normalizeAnswer(text)
    .split("")
    .map((char) => (char === " " ? "/" : MORSE_CODE[char]))
    .filter(Boolean);
}

function setListeningChallenge() {
  if (listeningState.isComplete) return;
  if (listeningState.questionCount >= listeningState.totalQuestions && listeningState.totalQuestions > 0) {
    finishListeningSession();
    return;
  }

  const bank = listeningChallenges[listeningState.level] || listeningChallenges.single;
  listeningState.challenge = bank[Math.floor(Math.random() * bank.length)];

  listeningState.questionCount += 1;
  listeningState.awaitingNext = false;
  sessionState = saveSessionState({ ...sessionState, currentQuestion: listeningState.questionCount });

  const form = qsListening("[data-listening-form]");
  const result = qsListening("[data-listening-result]");
  const status = qsListening("[data-listening-status]");
  const count = qsListening("[data-listening-question-count]");

  if (form) form.elements.answer.value = "";
  if (result) {
    result.className = "listening-result is-empty";
    result.textContent = "まだ判定していません。";
  }
  if (status) status.textContent = "再生できます";
  if (count) count.textContent = `第${listeningState.questionCount}問 / 全${listeningState.totalQuestions}問`;
  renderListeningSessionSummary();
  focusListeningAnswer();
}

function renderListeningSessionSummary() {
  qsaListening("[data-listening-session-summary]").forEach((node) => {
    node.textContent = `${listeningState.totalQuestions}問中 ${listeningState.answeredCount}問回答 / 正解 ${listeningState.correctCount}問`;
  });
  qsaListening("[data-listening-session-level]").forEach((node) => {
    node.textContent = sessionLevelLabel(listeningState.level);
  });
}

function sessionLevelLabel(level) {
  const labels = {
    single: "1文字",
    word: "短い単語",
    phrase: "複数語の短文",
    sentence: "ある程度長い文章"
  };
  return labels[level] || level;
}

function finishListeningSession() {
  listeningState.isComplete = true;
  listeningState.awaitingNext = false;
  const result = qsListening("[data-listening-result]");
  const status = qsListening("[data-listening-status]");
  const count = qsListening("[data-listening-question-count]");
  if (status) status.textContent = "セッション完了";
  if (count) count.textContent = `完了 / 全${listeningState.totalQuestions}問`;
  if (result) {
    result.className = "listening-result is-correct listening-complete";
    result.innerHTML = `<strong>完了</strong><p>${listeningState.totalQuestions}問中 ${listeningState.correctCount}問正解です。</p>`;
  }
  renderListeningSessionSummary();
  focusListeningAnswer();
}

function scheduleListeningTone(context, startTime, duration) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const attack = Math.min(0.01, duration / 4);
  const release = Math.min(0.02, duration / 3);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(listeningState.settings.pitchHz, startTime);
  const peakGain = Math.max(0.001, Math.min(0.3, (Number(listeningState.settings.volume) || 70) / 100 * 0.3));
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(peakGain, startTime + attack);
  gain.gain.setValueAtTime(peakGain, startTime + Math.max(attack, duration - release));
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.03);
}

async function playListeningChallenge() {
  if (listeningState.isComplete || !listeningState.challenge) {
    focusListeningAnswer();
    return;
  }
  if (listeningState.isPlaying) return;

  const context = getAudioContext();
  if (!context) {
    focusListeningAnswer();
    return;
  }
  if (context.state === "suspended") {
    await context.resume();
  }

  const unit = 1.2 / listeningState.settings.speedWpm;
  const symbols = textToMorse(listeningState.challenge);
  const letterGap = 3 * unit * listeningState.settings.letterGapMultiplier;
  const wordGap = 7 * unit * listeningState.settings.wordGapMultiplier;
  let cursor = context.currentTime + 0.06;

  setListeningPlayback(true);

  symbols.forEach((symbol, index) => {
    if (symbol === "/") {
      cursor += wordGap;
      return;
    }

    [...symbol].forEach((mark, markIndex) => {
      const duration = mark === "." ? unit : unit * 3;
      scheduleListeningTone(context, cursor, duration);
      cursor += duration;
      if (markIndex < symbol.length - 1) cursor += unit;
    });

    if (symbols[index + 1] && symbols[index + 1] !== "/") {
      cursor += letterGap;
    }
  });

  window.setTimeout(() => setListeningPlayback(false), Math.max(0, (cursor - context.currentTime) * 1000));
  focusListeningAnswer();
}

function setListeningPlayback(isPlaying) {
  listeningState.isPlaying = isPlaying;
  const status = qsListening("[data-listening-status]");
  if (status) status.textContent = isPlaying ? "再生中" : "入力して判定できます";
  qsaListening('[data-action="play-listening"], [data-action="replay-listening"], [data-action="next-listening"]').forEach((button) => {
    button.disabled = isPlaying;
  });
}

function checkListeningAnswer(event) {
  event.preventDefault();
  if (listeningState.isComplete || listeningState.awaitingNext || !listeningState.challenge) {
    focusListeningAnswer();
    return;
  }

  const answer = normalizeAnswer(event.currentTarget.elements.answer.value);
  const expected = normalizeAnswer(listeningState.challenge);
  const isCorrect = answer === expected;
  const result = qsListening("[data-listening-result]");
  const record = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    type: "listening",
    level: listeningState.level,
    promptText: expected,
    userAnswer: answer,
    isCorrect,
    settings: { ...listeningState.settings },
    createdAt: new Date().toISOString()
  };

  result.className = `listening-result ${isCorrect ? "is-correct" : "is-wrong"}`;
  result.innerHTML = isCorrect
    ? `<strong>正解</strong><p>${expected}</p>`
    : `<strong>不正解</strong><p>正解: ${expected}</p><p>入力: ${answer || "未入力"}</p>`;

  saveListeningRecord(record);
  appendListeningCard(record);
  renderListeningHistory();
  if (isCorrect) {
    listeningState.answeredCount += 1;
    listeningState.correctCount += 1;
    listeningState.awaitingNext = true;
    renderListeningSessionSummary();
  }
  focusListeningAnswer();
  if (isCorrect) {
    window.setTimeout(() => {
      if (listeningState.answeredCount >= listeningState.totalQuestions) {
        finishListeningSession();
        return;
      }
      setListeningChallenge();
      playListeningChallenge().catch(() => {
        const status = qsListening("[data-listening-status]");
        if (status) status.textContent = "再生ボタンで再生できます";
        focusListeningAnswer();
      });
    }, 650);
  }
}

function appendListeningCard(record) {
  const stack = qsListening("[data-listening-stack]");
  if (!stack) return;

  const card = document.createElement("article");
  card.className = `listening-stack-card ${record.isCorrect ? "is-correct" : "is-wrong"}`;
  card.innerHTML = `
    <span>${record.isCorrect ? "正解" : "不正解"}</span>
    <strong>${record.promptText}</strong>
    <small>入力: ${record.userAnswer || "未入力"}</small>
  `;
  stack.prepend(card);

  while (stack.children.length > 10) {
    stack.lastElementChild.remove();
  }
}

function renderListeningHistory() {
  const records = getListeningRecords();
  const list = qsListening("[data-listening-history]");
  const accuracy = qsListening("[data-listening-accuracy]");
  if (!list || !accuracy) return;

  if (records.length === 0) {
    list.innerHTML = "<li>記録はまだありません。</li>";
    accuracy.textContent = "--";
    return;
  }

  list.innerHTML = records.slice(0, 6).map((record) => `
    <li>
      <span class="${record.isCorrect ? "correct" : "wrong"}">${record.isCorrect ? "正解" : "不正解"}</span>
      <strong>${record.promptText}</strong>
      <small>${record.level}</small>
    </li>
  `).join("");

  const today = new Date().toISOString().slice(0, 10);
  const todayRecords = records.filter((record) => record.createdAt && record.createdAt.slice(0, 10) === today);
  const correctCount = todayRecords.filter((record) => record.isCorrect).length;
  accuracy.textContent = todayRecords.length > 0 ? `${Math.round((correctCount / todayRecords.length) * 100)}%` : "--";
}

function syncListeningSettingsControls() {
  qsaListening("[data-listening-setting]").forEach((input) => {
    const value = listeningState.settings[input.name];
    input.value = value;
    updateListeningOutput(input.name, value);
  });
}

function updateListeningOutput(name, value) {
  const output = qsListening(`[data-listening-output="${name}"]`);
  if (!output) return;
  if (name === "speedWpm") output.textContent = `${value} WPM`;
  else if (name === "pitchHz") output.textContent = `${value} Hz`;
  else output.textContent = `${Number(value).toFixed(2).replace(/0$/, "")}x`;
}

function focusListeningAnswer() {
  const answer = qsListening("#listening-answer");
  if (!answer) return;
  window.requestAnimationFrame(() => answer.focus({ preventScroll: true }));
}

function handleListeningHashStart() {
  if (window.location.hash !== "#listening-practice-title" && window.location.hash !== "#listening-answer") return;
  const root = listeningRoot();
  if (!root) return;
  listeningState.hasStarted = true;
  root.querySelector("[data-listening-app]")?.removeAttribute("hidden");
  if (!listeningState.challenge) setListeningChallenge();
  focusListeningAnswer();
}

async function startListeningPractice(options = {}) {
  const root = listeningRoot();
  if (!root) return;
  const nextLevel = options.level || sessionState.level || listeningState.level;
  const nextTotal = normalizedQuestionCount(options.questionCount || sessionState.questionCount || listeningState.totalQuestions);

  refreshListeningSettings();
  listeningState.level = nextLevel;
  listeningState.totalQuestions = nextTotal;
  listeningState.questionCount = 0;
  listeningState.answeredCount = 0;
  listeningState.correctCount = 0;
  listeningState.awaitingNext = false;
  listeningState.isComplete = false;
  listeningState.challenge = "";
  listeningState.hasStarted = true;
  const stack = qsListening("[data-listening-stack]");
  if (stack) stack.innerHTML = "";
  activateAppScreen("listening");
  setListeningChallenge();
  root.querySelector("[data-listening-practice]")?.scrollIntoView({ block: "start", behavior: "smooth" });
  focusListeningAnswer();
  try {
    const context = getAudioContext();
    if (context?.state === "suspended") await context.resume();
    await playListeningChallenge();
  } catch {
    const status = qsListening("[data-listening-status]");
    if (status) status.textContent = "再生ボタンで再生できます";
    focusListeningAnswer();
  }
}

function initListeningPractice() {
  const root = listeningRoot();
  if (!root) return;
  root.dataset.listeningReady = "true";

  syncListeningSettingsControls();
  renderListeningHistory();

  qsaListening('input[name="listeningLevelMain"]').forEach((input) => {
    input.addEventListener("change", () => {
      listeningState.level = input.value;
      setListeningChallenge();
      if (listeningState.hasStarted) {
        playListeningChallenge().catch(() => focusListeningAnswer());
      }
    });
  });

  const listeningFormElement = qsListening("[data-listening-form]");
  if (listeningFormElement) listeningFormElement.addEventListener("submit", checkListeningAnswer);

  qsaListening("[data-listening-setting]").forEach((input) => {
    input.addEventListener("input", () => {
      listeningState.settings[input.name] = Number(input.value);
      saveListeningSettings();
      updateListeningOutput(input.name, listeningState.settings[input.name]);
    });
  });

  root.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action === "start-listening") startListeningPractice();
    if (action === "play-listening" || action === "replay-listening") playListeningChallenge();
    if (action === "next-listening") {
      if (listeningState.awaitingNext || listeningState.isComplete) return;
      setListeningChallenge();
      if (listeningState.hasStarted) playListeningChallenge().catch(() => focusListeningAnswer());
    }
  });
  window.addEventListener("hashchange", handleListeningHashStart);
  handleListeningHashStart();
}

window.MorsePracticeListening = {
  getRecords: getListeningRecords,
  getCurrentChallenge: () => listeningState.challenge,
  getSettings: () => ({ ...listeningState.settings })
};
window.MorsePracticeStartListening = startListeningPractice;

renderGrid();
renderMorse(current);
initListeningPractice();

grid.addEventListener("click", (event) => {
  const button = event.target.closest(".letter-button");
  if (button) {
    selectLetter(button.dataset.letter);
  }
});

playButton.addEventListener("click", playCurrent);

(() => {
  const SETTINGS_KEY = "morsePractice.settings.v1";
  const PROGRESS_KEY = "morsePractice.progress.v1";
  const LISTENING_RECORDS_KEY = "morseListeningPractice.records.v1";

  const defaultSettings = {
    speedWpm: 18,
    pitchHz: 600,
    volume: 70,
    level: "single",
    targetSet: "letters",
    customTargets: "",
    keyingDotThresholdMs: 240,
    theme: "system",
  };

  const defaultProgress = {
    attempts: [],
    currentStreak: 0,
    bestStreak: 0,
    updatedAt: null,
  };

  const readJson = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);
      return value ? { ...fallback, ...JSON.parse(value) } : { ...fallback };
    } catch {
      return { ...fallback };
    }
  };

  const writeJson = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const getSettings = () => readJson(SETTINGS_KEY, defaultSettings);

  const applyTheme = (theme) => {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolvedTheme = theme === "system" ? (systemDark ? "dark" : "light") : theme;
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.themePreference = theme || "system";
    document.documentElement.style.colorScheme = resolvedTheme;
    const isDark = resolvedTheme === "dark";
    document.querySelectorAll("[data-theme-toggle-label]").forEach((node) => {
      node.textContent = isDark ? "Dark" : "Light";
    });
    document.querySelectorAll("[data-action=\"toggle-theme\"]").forEach((button) => {
      button.setAttribute("aria-pressed", String(isDark));
      button.setAttribute("aria-label", isDark ? "ライトモードに切り替え" : "ダークモードに切り替え");
    });
  };

  const saveSettings = (nextSettings) => {
    const settings = { ...defaultSettings, ...getSettings(), ...nextSettings };
    writeJson(SETTINGS_KEY, settings);
    applyTheme(settings.theme);
    window.dispatchEvent(new CustomEvent("morse-settings-change", { detail: settings }));
    return settings;
  };

  const getProgress = () => {
    const progress = readJson(PROGRESS_KEY, defaultProgress);
    return {
      ...defaultProgress,
      ...progress,
      attempts: Array.isArray(progress.attempts) ? progress.attempts : [],
    };
  };

  const getListeningRecords = () => {
    try {
      const records = JSON.parse(localStorage.getItem(LISTENING_RECORDS_KEY) || "[]");
      return Array.isArray(records) ? records : [];
    } catch {
      return [];
    }
  };

  const normalizeAttempt = (attempt) => {
    const expected = String(attempt.expected ?? attempt.prompt ?? "").trim().toUpperCase();
    const answer = String(attempt.answer ?? "").trim().toUpperCase();
    const correct = typeof attempt.correct === "boolean" ? attempt.correct : answer === expected;

    return {
      id: attempt.id || crypto.randomUUID(),
      createdAt: attempt.createdAt || new Date().toISOString(),
      mode: attempt.mode || "unknown",
      level: attempt.level || getSettings().level,
      promptType: attempt.promptType || "text",
      prompt: String(attempt.prompt ?? expected),
      expected,
      answer,
      correct,
      settingsSnapshot: attempt.settingsSnapshot || getSettings(),
      source: attempt.source || PROGRESS_KEY,
    };
  };

  const normalizeListeningRecord = (record) => ({
    id: record.id || `listening-${record.createdAt || crypto.randomUUID()}`,
    createdAt: record.createdAt || new Date().toISOString(),
    mode: "listening",
    level: record.level || "unknown",
    promptType: "morse-audio",
    prompt: String(record.promptText ?? ""),
    expected: String(record.promptText ?? "").trim().toUpperCase(),
    answer: String(record.userAnswer ?? "").trim().toUpperCase(),
    correct: Boolean(record.isCorrect),
    settingsSnapshot: record.settings || {},
    source: LISTENING_RECORDS_KEY,
  });

  const saveProgress = (progress) => {
    const nextProgress = { ...progress, updatedAt: new Date().toISOString() };
    writeJson(PROGRESS_KEY, nextProgress);
    window.dispatchEvent(new CustomEvent("morse-progress-change", { detail: nextProgress }));
    return nextProgress;
  };

  const recordAttempt = (attempt) => {
    const progress = getProgress();
    const normalized = normalizeAttempt(attempt);
    const currentStreak = normalized.correct ? progress.currentStreak + 1 : 0;
    const bestStreak = Math.max(progress.bestStreak, currentStreak);

    return saveProgress({
      attempts: [normalized, ...progress.attempts].slice(0, 500),
      currentStreak,
      bestStreak,
    });
  };

  const getAllAttempts = () => {
    const progressAttempts = getProgress().attempts.map((attempt) => ({
      ...attempt,
      source: attempt.source || PROGRESS_KEY,
    }));
    const listeningAttempts = getListeningRecords().map(normalizeListeningRecord);
    const seen = new Set();

    return [...progressAttempts, ...listeningAttempts]
      .filter((attempt) => {
        const key = `${attempt.source}:${attempt.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const calculateStreaks = (attempts) => {
    const chronological = [...attempts].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    let current = 0;
    let best = 0;

    chronological.forEach((attempt) => {
      current = attempt.correct ? current + 1 : 0;
      best = Math.max(best, current);
    });

    return { current, best };
  };

  const summarizeProgress = () => {
    const attempts = getAllAttempts();
    const total = attempts.length;
    const correct = attempts.filter((attempt) => attempt.correct).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const streaks = calculateStreaks(attempts);
    const weakMap = new Map();

    attempts.forEach((attempt) => {
      const key = attempt.expected || attempt.prompt;
      if (!key) return;
      const item = weakMap.get(key) || { key, correct: 0, wrong: 0, total: 0 };
      item.total += 1;
      if (attempt.correct) item.correct += 1;
      else item.wrong += 1;
      weakMap.set(key, item);
    });

    return {
      total,
      correct,
      accuracy,
      currentStreak: streaks.current,
      bestStreak: streaks.best,
      weakItems: [...weakMap.values()]
        .filter((item) => item.wrong > 0)
        .sort((a, b) => b.wrong - a.wrong || b.total - a.total || a.key.localeCompare(b.key))
        .slice(0, 8),
      recentAttempts: attempts.slice(0, 12),
    };
  };

  const clearProgress = () => {
    localStorage.removeItem(LISTENING_RECORDS_KEY);
    return saveProgress({ ...defaultProgress, attempts: [] });
  };

  window.MorsePracticeStore = {
    keys: {
      settings: SETTINGS_KEY,
      progress: PROGRESS_KEY,
      listeningRecords: LISTENING_RECORDS_KEY,
    },
    defaults: { settings: defaultSettings, progress: defaultProgress },
    getSettings,
    saveSettings,
    getProgress,
    getAllAttempts,
    recordAttempt,
    clearProgress,
    summarizeProgress,
    applyTheme,
  };

  const qs = (selector, parent = document) => parent.querySelector(selector);
  const qsa = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const form = qs("[data-settings-form]");

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[char]));

  const formatDate = (iso) => {
    if (!iso) return "-";
    return new Intl.DateTimeFormat("ja-JP", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  };

  const modeLabel = (mode) => {
    const labels = { listening: "リスニング", keying: "打鍵", unknown: "未分類" };
    return labels[mode] || mode;
  };

  const setText = (selector, value) => {
    const node = qs(selector);
    if (node) node.textContent = value;
  };

  const updateSettingOutputs = (settings) => {
    setText('[data-output="speedWpm"]', `${settings.speedWpm} WPM`);
    setText('[data-output="pitchHz"]', `${settings.pitchHz} Hz`);
    setText('[data-output="volume"]', `${settings.volume}%`);
    setText('[data-output="keyingDotThresholdMs"]', `${settings.keyingDotThresholdMs} ms`);
    const customField = qs("[data-custom-target-field]");
    if (customField) customField.hidden = settings.targetSet !== "custom";
  };

  const syncSettingsForm = () => {
    if (!form) return;
    const settings = getSettings();
    applyTheme(settings.theme);

    Object.entries(settings).forEach(([key, value]) => {
      const input = form.elements[key];
      if (!input) return;
      if (input instanceof RadioNodeList) {
        const radio = qsa(`input[name="${key}"]`).find((node) => node.value === value);
        if (radio) radio.checked = true;
      } else {
        input.value = value;
      }
    });

    updateSettingOutputs(settings);
  };

  const attemptItemHtml = (attempt) => `
    <div class="result-item">
      <div>
        <strong>${escapeHtml(attempt.expected || attempt.prompt)}</strong>
        <div class="result-meta">
          ${formatDate(attempt.createdAt)} / ${escapeHtml(modeLabel(attempt.mode))} / 回答: ${escapeHtml(attempt.answer || "-")}
        </div>
      </div>
      <span class="status-pill ${attempt.correct ? "correct" : "wrong"}">${attempt.correct ? "正解" : "不正解"}</span>
    </div>
  `;

  const renderSummary = () => {
    const summary = summarizeProgress();
    setText('[data-stat="total"]', String(summary.total));
    setText('[data-stat="accuracy"]', `${summary.accuracy}%`);
    setText('[data-stat="currentStreak"]', String(summary.currentStreak));
    setText('[data-stat="bestStreak"]', String(summary.bestStreak));

    const weakList = qs('[data-list="weak-items"]');
    if (weakList) {
      weakList.innerHTML = summary.weakItems.length
        ? summary.weakItems.map((item) => `
          <div class="result-item">
            <div>
              <strong>${escapeHtml(item.key)}</strong>
              <div class="result-meta">不正解 ${item.wrong} 回 / 練習 ${item.total} 回</div>
            </div>
            <span class="status-pill wrong">要復習</span>
          </div>
        `).join("")
        : '<p class="result-meta">まだ不正解の記録がありません。</p>';
    }

    const recentList = qs('[data-list="recent-attempts"]');
    if (recentList) {
      recentList.innerHTML = summary.recentAttempts.length
        ? summary.recentAttempts.slice(0, 6).map(attemptItemHtml).join("")
        : '<p class="result-meta">リスニング・打鍵練習から記録されると、ここに表示されます。</p>';
    }

    const tbody = qs("[data-history-table]");
    if (tbody) {
      tbody.innerHTML = summary.recentAttempts.length
        ? summary.recentAttempts.map((attempt) => `
          <tr>
            <td>${formatDate(attempt.createdAt)}</td>
            <td>${escapeHtml(modeLabel(attempt.mode))}</td>
            <td>${escapeHtml(attempt.expected || attempt.prompt)}</td>
            <td>${escapeHtml(attempt.answer || "-")}</td>
            <td>${attempt.correct ? "正解" : "不正解"}</td>
          </tr>
        `).join("")
        : '<tr><td colspan="5">まだ記録がありません。</td></tr>';
    }
  };

  const renderSchema = () => {
    const schema = qs("[data-schema]");
    if (!schema) return;
    schema.textContent = `window.MorsePracticeStore.recordAttempt({
  mode: "listening",
  level: "single",
  promptType: "morse-audio",
  prompt: ".-",
  expected: "A",
  answer: "A",
  correct: true
});`;
  };

  qsa("[data-profile-view]").forEach((button) => {
    button.addEventListener("click", () => {
      qsa("[data-profile-view]").forEach((tab) => tab.classList.remove("is-active"));
      qsa(".profile-view").forEach((view) => view.classList.remove("is-active"));
      button.classList.add("is-active");
      const profileView = qs(`#${button.dataset.profileView}`);
      if (profileView) profileView.classList.add("is-active");
      renderSummary();
    });
  });

  if (form) form.addEventListener("input", () => {
    const formData = new FormData(form);
    const settings = saveSettings({
      speedWpm: Number(formData.get("speedWpm")),
      pitchHz: Number(formData.get("pitchHz")),
      volume: Number(formData.get("volume")),
      level: String(formData.get("level")),
      targetSet: String(formData.get("targetSet")),
      customTargets: String(formData.get("customTargets") || "").toUpperCase(),
      keyingDotThresholdMs: Number(formData.get("keyingDotThresholdMs")),
      theme: String(formData.get("theme")),
    });
    updateSettingOutputs(settings);
  });

  document.addEventListener("click", (event) => {
    const actionElement = event.target.closest("[data-action]");
    const action = actionElement ? actionElement.dataset.action : "";
    if (!action) return;

    if (action === "reset-settings") {
      saveSettings(defaultSettings);
      syncSettingsForm();
    }

    if (action === "toggle-theme") {
      const current = getSettings();
      const resolved = document.documentElement.dataset.theme || "light";
      const nextTheme = resolved === "dark" ? "light" : "dark";
      saveSettings({ ...current, theme: nextTheme });
      syncSettingsForm();
    }

    if (action === "clear-progress" && confirm("この端末の練習記録を消去します。設定は残します。")) {
      clearProgress();
      renderSummary();
    }

    if (action === "sample-correct") {
      recordAttempt({
        mode: "listening",
        level: getSettings().level,
        promptType: "morse-audio",
        prompt: ".-",
        expected: "A",
        answer: "A",
        correct: true,
      });
      renderSummary();
    }

    if (action === "sample-wrong") {
      recordAttempt({
        mode: "keying",
        level: getSettings().level,
        promptType: "text",
        prompt: "B",
        expected: "-...",
        answer: "-.-.",
        correct: false,
      });
      renderSummary();
    }
  });

  syncSettingsForm();
  renderSummary();
  renderSchema();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    applyTheme(getSettings().theme);
  });
})();

const keyingEls = {
  target: document.querySelector("#keying-target"),
  answer: document.querySelector("#keying-answer"),
  pad: document.querySelector("#keying-pad"),
  input: document.querySelector("#keying-input"),
  message: document.querySelector("#keying-message"),
  meta: document.querySelector("#keying-session-meta"),
  complete: document.querySelector("#keying-complete"),
  completeSummary: document.querySelector("#keying-complete-summary"),
  check: document.querySelector("#keying-check"),
  clear: document.querySelector("#keying-clear"),
  next: document.querySelector("#keying-next"),
  reset: document.querySelector("#keying-reset"),
  retry: document.querySelector("[data-keying-retry]")
};

let keyingTarget = letters[0];
let keyingInput = "";
let pressStartedAt = 0;
let keyingIndex = 0;
let returnKeyIsDown = false;
let keyingSession = {
  active: false,
  level: "beginner",
  total: 1,
  answered: 0,
  correct: 0,
  prompts: [letters[0]],
  currentIndex: 0,
  awaitingNext: false,
  complete: false
};

const keyingLevelLabels = {
  single: "初級",
  word: "A-Z",
  phrase: "0-9",
  sentence: "英数字"
};

function keyingSettings() {
  if (window.MorsePracticeStore && window.MorsePracticeStore.getSettings) {
    return window.MorsePracticeStore.getSettings();
  }
  return { keyingDotThresholdMs: 240, targetSet: "letters", customTargets: "" };
}

function keyingPool(level) {
  const allLetters = letters;
  const beginnerCodes = "ETANIMSO".split("");
  const numbers = "0123456789".split("").map((digit) => ({ letter: digit, code: MORSE_CODE[digit] }));

  if (level === "single") return allLetters.filter((item) => beginnerCodes.includes(item.letter));
  if (level === "phrase") return numbers;
  if (level === "sentence") return allLetters.concat(numbers);
  return allLetters;
}

function makeKeyingPrompts(level, total) {
  const pool = keyingPool(level);
  return Array.from({ length: total }, () => pool[Math.floor(Math.random() * pool.length)]);
}

function normalizedQuestionCount(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 10;
  return Math.min(100, Math.max(1, Math.round(parsed)));
}

function keyingThresholdMs() {
  const settings = keyingSettings();
  const value = Number(settings.keyingDotThresholdMs);
  if (!Number.isFinite(value)) return 240;
  return Math.min(800, Math.max(80, value));
}

function setKeyingTarget(item) {
  keyingTarget = item || letters[0];
  keyingInput = "";
  updateKeying();
}

function renderKeyingSessionMeta() {
  const currentQuestion = Math.min(keyingSession.answered + 1, keyingSession.total);
  document.querySelectorAll("[data-session-summary]").forEach((node) => {
    node.textContent = `第${currentQuestion}問 / ${keyingSession.total}問`;
  });
  if (!keyingEls.meta) return;
  if (!keyingSession.active) {
    keyingEls.meta.textContent = "Home から条件を選ぶと、問題数つきで開始できます。";
    return;
  }
  keyingEls.meta.textContent = `レベル ${keyingLevelLabels[keyingSession.level] || keyingSession.level} / 第${currentQuestion}問 / 全${keyingSession.total}問`;
}

function startKeyingSession(options = {}) {
  const level = options.level || "single";
  const total = normalizedQuestionCount(options.questionCount);
  keyingSession = {
    active: true,
    level,
    total,
    answered: 0,
    correct: 0,
    prompts: makeKeyingPrompts(level, total),
    currentIndex: 0,
    awaitingNext: false,
    complete: false
  };
  if (keyingEls.complete) keyingEls.complete.hidden = true;
  if (keyingEls.check) keyingEls.check.disabled = false;
  if (keyingEls.next) keyingEls.next.disabled = false;
  setKeyingTarget(keyingSession.prompts[0]);
  keyingEls.message.textContent = "打鍵してください。";
  keyingEls.message.classList.remove("is-correct", "is-error");
  renderKeyingSessionMeta();
  activateAppScreen("keying");
}

function finishKeyingSession() {
  keyingSession.complete = true;
  keyingSession.active = false;
  keyingSession.awaitingNext = false;
  if (keyingEls.check) keyingEls.check.disabled = true;
  if (keyingEls.next) keyingEls.next.disabled = true;
  if (keyingEls.complete) keyingEls.complete.hidden = false;
  if (keyingEls.completeSummary) {
    keyingEls.completeSummary.textContent = `${keyingSession.total}問中 ${keyingSession.correct}問正解です。`;
  }
  keyingEls.message.textContent = "セッション完了です。";
  keyingEls.message.classList.toggle("is-correct", keyingSession.correct === keyingSession.total);
  keyingEls.message.classList.toggle("is-error", keyingSession.correct < keyingSession.total);
  renderKeyingSessionMeta();
}

function advanceKeyingQuestion() {
  if (!keyingSession.active || !keyingSession.awaitingNext) return;
  keyingSession.currentIndex += 1;
  keyingSession.awaitingNext = false;
  setKeyingTarget(keyingSession.prompts[keyingSession.currentIndex]);
  keyingEls.message.textContent = "打鍵してください。";
  keyingEls.message.classList.remove("is-correct", "is-error");
  renderKeyingSessionMeta();
}

function updateKeying() {
  if (!keyingEls.target) return;
  keyingEls.target.textContent = keyingTarget.letter;
  keyingEls.answer.textContent = `正解 ${keyingTarget.code}`;
  keyingEls.input.textContent = keyingInput || "未入力";
}

function addKeyingMark(mark) {
  if (keyingSession.complete) return;
  if (keyingSession.awaitingNext) return;
  keyingInput += mark;
  updateKeying();
  keyingEls.message.textContent = mark === "." ? "短点を入力しました。" : "長点を入力しました。";
  keyingEls.message.classList.remove("is-correct", "is-error");
}

function finishKeyPress() {
  if (!pressStartedAt) return;
  const elapsed = Date.now() - pressStartedAt;
  pressStartedAt = 0;
  keyingEls.pad.classList.remove("is-pressed");
  const threshold = keyingThresholdMs();
  addKeyingMark(elapsed <= threshold ? "." : "-");
}

function nextKeyingTarget() {
  if (keyingSession.active) {
    if (keyingSession.awaitingNext) {
      advanceKeyingQuestion();
    } else {
      keyingEls.message.textContent = "先に答え合わせしてください。";
      keyingEls.message.classList.add("is-error");
      keyingEls.message.classList.remove("is-correct");
    }
    return;
  }
  keyingIndex = (keyingIndex + 1) % letters.length;
  keyingTarget = letters[keyingIndex];
  keyingInput = "";
  keyingEls.message.textContent = "次のお題です。";
  updateKeying();
}

function bindKeying() {
  if (!keyingEls.pad) return;
  keyingEls.pad.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    keyingEls.pad.setPointerCapture(event.pointerId);
    pressStartedAt = Date.now();
    keyingEls.pad.classList.add("is-pressed");
  });
  keyingEls.pad.addEventListener("pointerup", (event) => {
    event.preventDefault();
    finishKeyPress();
  });
  keyingEls.pad.addEventListener("pointercancel", () => {
    pressStartedAt = 0;
    keyingEls.pad.classList.remove("is-pressed");
  });
  keyingEls.pad.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
  keyingEls.check.addEventListener("click", () => {
    if (keyingSession.complete) return;
    if (keyingSession.awaitingNext) {
      keyingEls.message.textContent = "次のお題へ進んでください。";
      return;
    }
    if (!keyingInput) {
      keyingEls.message.textContent = "まだ入力がありません。";
      keyingEls.message.classList.add("is-error");
      keyingEls.message.classList.remove("is-correct");
      return;
    }
    const correct = keyingInput === keyingTarget.code;
    keyingEls.message.textContent = correct ? "正解です。" : `違います。${keyingTarget.letter} は ${keyingTarget.code} です。`;
    keyingEls.message.classList.toggle("is-correct", correct);
    keyingEls.message.classList.toggle("is-error", !correct);
    recordProgress("keying", keyingTarget.letter, keyingTarget.code, keyingInput, correct, keyingSession.level);
    if (keyingSession.active) {
      keyingSession.answered += 1;
      if (correct) keyingSession.correct += 1;
      keyingSession.awaitingNext = true;
      renderKeyingSessionMeta();
      if (keyingSession.answered >= keyingSession.total) {
        finishKeyingSession();
      }
    }
  });
  keyingEls.clear.addEventListener("click", () => {
    if (keyingSession.awaitingNext || keyingSession.complete) return;
    keyingInput = "";
    keyingEls.message.textContent = "入力を消しました。";
    updateKeying();
  });
  keyingEls.next.addEventListener("click", nextKeyingTarget);
  keyingEls.reset.addEventListener("click", () => {
    keyingIndex = 0;
    keyingTarget = letters[0];
    keyingInput = "";
    keyingSession.active = false;
    keyingSession.complete = false;
    keyingSession.awaitingNext = false;
    if (keyingEls.complete) keyingEls.complete.hidden = true;
    if (keyingEls.check) keyingEls.check.disabled = false;
    if (keyingEls.next) keyingEls.next.disabled = false;
    keyingEls.message.textContent = "リセットしました。";
    updateKeying();
    renderKeyingSessionMeta();
  });
  if (keyingEls.retry) {
    keyingEls.retry.addEventListener("click", () => {
      startKeyingSession({ level: keyingSession.level, questionCount: keyingSession.total });
    });
  }
  window.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !pressStartedAt && !returnKeyIsDown && window.MorsePracticeShell.getActiveScreen() === "keying") {
      event.preventDefault();
      returnKeyIsDown = true;
      pressStartedAt = Date.now();
      keyingEls.pad.classList.add("is-pressed");
    }
  });
  window.addEventListener("keyup", (event) => {
    if (event.key === "Enter" && window.MorsePracticeShell.getActiveScreen() === "keying") {
      event.preventDefault();
      returnKeyIsDown = false;
      finishKeyPress();
    }
  });
  updateKeying();
  renderKeyingSessionMeta();
}

function recordProgress(mode, prompt, expected, answer, correct, level) {
  if (!window.MorsePracticeStore || !window.MorsePracticeStore.recordAttempt) return;
  window.MorsePracticeStore.recordAttempt({
    mode: mode,
    level: level || "single",
    promptType: mode === "listening" ? "morse-audio" : "text",
    prompt: prompt,
    expected: expected,
    answer: answer,
    correct: correct
  });
}

bindKeying();

window.MorsePracticeKeying = {
  startSession: startKeyingSession
};

function bindPracticeFlow() {
  const flow = document.querySelector("[data-practice-flow]");
  const start = document.querySelector("[data-shell-start]");
  const back = document.querySelector("[data-shell-back]");
  if (!flow || !start) return;

  start.addEventListener("click", () => {
    flow.hidden = false;
    const firstMode = flow.querySelector('input[name="practiceMode"]');
    if (firstMode) firstMode.focus();
  });

  if (back) {
    back.addEventListener("click", () => {
      flow.hidden = true;
      start.focus();
    });
  }

  flow.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(flow);
    const mode = String(formData.get("practiceMode") || "keying");
    const level = String(formData.get("practiceLevel") || "beginner");
    const questionCount = normalizedQuestionCount(formData.get("questionCount"));

    if (mode === "keying") {
      startKeyingSession({ level, questionCount });
      return;
    }

    activateAppScreen("listening");
    if (window.MorsePracticeStartListening) {
      window.MorsePracticeStartListening();
    }
  });
}

bindPracticeFlow();

if (typeof appNavButtons !== "undefined") {
  appNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activateAppScreen(button.dataset.screenTarget);
    });
  });

  window.addEventListener("hashchange", () => {
    const nextScreen = screenFromHash();
    if (nextScreen) {
      activateAppScreen(nextScreen, false);
    }
  });

  document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    const mode = event.target.closest("[data-session-mode]")?.dataset.sessionMode;

    if (action === "open-mode-select") {
      activateAppScreen("mode");
    }

    if (action === "open-home") {
      activateAppScreen("home");
    }

    if (mode) {
      window.MorsePracticeSession.setState({ mode });
      activateAppScreen("session");
    }

    if (action === "back-to-mode") {
      activateAppScreen("mode");
    }

    if (action === "start-session") {
      window.MorsePracticeSession.start(sessionState.mode, selectedSessionLevel(), selectedQuestionCount());
      applySessionToPractice();
      activateAppScreen(sessionState.mode);
    }
  });

  document.querySelectorAll('input[name="sessionLevel"], input[name="sessionQuestionCount"]').forEach((input) => {
    input.addEventListener("input", () => {
      window.MorsePracticeSession.setState({
        level: selectedSessionLevel(),
        questionCount: selectedQuestionCount()
      });
    });
    input.addEventListener("change", () => {
      window.MorsePracticeSession.setState({
        level: selectedSessionLevel(),
        questionCount: selectedQuestionCount()
      });
    });
  });

  renderSessionState();
  activateAppScreen(screenFromHash() || "home", false);
}
