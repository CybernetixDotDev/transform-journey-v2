const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const ts = require("typescript");

const projectRoot = path.resolve(__dirname, "..");
const originalResolveFilename = Module._resolveFilename;
const originalLoad = Module._load;
const asyncStorage = new Map();

require.extensions[".ts"] = function compileTypeScript(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;

  module._compile(output, filename);
};

Module._resolveFilename = function resolveAlias(request, parent, isMain, options) {
  if (request.startsWith("@/")) {
    const mappedRequest = path.join(projectRoot, "src", request.slice(2));
    return originalResolveFilename.call(
      this,
      mappedRequest,
      parent,
      isMain,
      options,
    );
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};

Module._load = function loadWithMocks(request, parent, isMain) {
  if (request === "@react-native-async-storage/async-storage") {
    return {
      __esModule: true,
      default: {
        getItem: async (key) => asyncStorage.get(key) ?? null,
        removeItem: async (key) => {
          asyncStorage.delete(key);
        },
        setItem: async (key, value) => {
          asyncStorage.set(key, value);
        },
      },
    };
  }

  return originalLoad.call(this, request, parent, isMain);
};

const {
  calculateArchetype,
  createInitialPlayerState,
} = require("@/engine/soulScanEngine");
const { completeRitual } = require("@/engine/ritualEngine");
const { completeTrialDay } = require("@/engine/trialEngine");
const { completeQuest } = require("@/engine/questEngine");
const { canEnterRoom } = require("@/engine/unlockEngine");
const { rooms } = require("@/content/rooms");
const {
  clearPlayerState,
  loadPlayerState,
  savePlayerState,
} = require("@/storage/persistence");
const { usePlayerStore } = require("@/state/usePlayerStore");

const expectedStatIds = [
  "clarity",
  "courage",
  "selfWorth",
  "boundaries",
  "emotionalRegulation",
  "compassion",
  "creativity",
  "discipline",
  "intuition",
  "presence",
];

const acceptanceTests = [];

function test(name, fn) {
  acceptanceTests.push({ fn, name });
}

function resetStore() {
  usePlayerStore.setState({
    hasHydrated: false,
    playerState: null,
  });
}

function getRoom(roomId) {
  const room = rooms.find((candidate) => candidate.id === roomId);
  assert.ok(room, `Expected room ${roomId} to exist.`);
  return room;
}

test("Soul Scan creates a valid player state", () => {
  const archetypeId = calculateArchetype([
    { archetypeScores: { seer: 3, healer: 1 } },
    { archetypeScores: { seer: 2, architect: 2 } },
  ]);
  const playerState = createInitialPlayerState(archetypeId);

  assert.equal(archetypeId, "seer");
  assert.equal(playerState.archetypeId, "seer");
  assert.equal(playerState.currentDay, 1);
  assert.equal(playerState.ascensionPoints, 0);
  assert.deepEqual(playerState.unlockedRooms, ["threshold-chamber"]);
  assert.deepEqual(Object.keys(playerState.stats).sort(), expectedStatIds.sort());
});

test("Completing a trial ritual advances the day", () => {
  const playerState = createInitialPlayerState("seer");
  const updatedPlayerState = completeTrialDay(playerState, 1);

  assert.equal(updatedPlayerState.currentDay, 2);
  assert.ok(updatedPlayerState.completedRituals.includes("breath-of-arrival"));
  assert.ok(updatedPlayerState.unlockedRooms.includes("hall-of-echoes"));
});

test("Completing a trial boss advances the day", () => {
  const dayTwo = completeTrialDay(createInitialPlayerState("seer"), 1);
  const dayThree = completeTrialDay(dayTwo, 2);
  const dayFour = completeTrialDay(dayThree, 3);
  const dayFive = completeTrialDay(dayFour, 4);
  const daySix = completeTrialDay(dayFive, 5);
  const daySeven = completeTrialDay(daySix, 6);

  assert.equal(daySix.currentDay, 6);
  assert.equal(daySeven.currentDay, 7);
  assert.ok(daySeven.defeatedBosses.includes("ghost"));
});

test("Locked rooms block ritual completion when guarded by unlock state", () => {
  const playerState = createInitialPlayerState("seer");
  const childhoodRoom = getRoom("childhood-room");
  const guardedPlayerState = canEnterRoom(playerState, childhoodRoom)
    ? completeRitual(playerState, "first-memory")
    : playerState;

  assert.equal(canEnterRoom(playerState, childhoodRoom), false);
  assert.equal(guardedPlayerState, playerState);
  assert.equal(guardedPlayerState.completedRituals.includes("first-memory"), false);
});

test("Duplicate ritual completion is prevented", () => {
  const playerState = createInitialPlayerState("seer");
  const once = completeRitual(playerState, "breath-of-arrival");
  const twice = completeRitual(once, "breath-of-arrival");

  assert.equal(
    twice.completedRituals.filter((ritualId) => ritualId === "breath-of-arrival")
      .length,
    1,
  );
  assert.equal(twice.ascensionPoints, once.ascensionPoints);
});

test("Quest completion persists rewards", async () => {
  asyncStorage.clear();
  resetStore();

  const playerState = {
    ...createInitialPlayerState("seer"),
    activeQuests: ["arrive-at-threshold"],
  };

  usePlayerStore.setState({ hasHydrated: true, playerState });
  await usePlayerStore.getState().completeQuest("arrive-at-threshold");

  const updatedPlayerState = usePlayerStore.getState().playerState;
  const reloadedPlayerState = await loadPlayerState();

  assert.ok(updatedPlayerState.completedQuests.includes("arrive-at-threshold"));
  assert.equal(updatedPlayerState.activeQuests.includes("arrive-at-threshold"), false);
  assert.ok(updatedPlayerState.ascensionPoints > playerState.ascensionPoints);
  assert.deepEqual(reloadedPlayerState, updatedPlayerState);
});

test("Journal entry creation persists", async () => {
  asyncStorage.clear();
  resetStore();

  const playerState = createInitialPlayerState("seer");

  usePlayerStore.setState({ hasHydrated: true, playerState });
  await usePlayerStore
    .getState()
    .createJournalEntry("I am willing to arrive.", "Acceptance test prompt");

  const updatedPlayerState = usePlayerStore.getState().playerState;
  const reloadedPlayerState = await loadPlayerState();

  assert.equal(updatedPlayerState.journalEntries.length, 1);
  assert.equal(updatedPlayerState.journalEntries[0].response, "I am willing to arrive.");
  assert.deepEqual(reloadedPlayerState, updatedPlayerState);
});

test("Reloaded state remains consistent", async () => {
  asyncStorage.clear();

  const playerState = completeTrialDay(createInitialPlayerState("seer"), 1);

  await savePlayerState(playerState);
  const reloadedPlayerState = await loadPlayerState();

  assert.deepEqual(reloadedPlayerState, playerState);

  await clearPlayerState();
  assert.equal(await loadPlayerState(), null);
});

(async () => {
  for (const acceptanceTest of acceptanceTests) {
    try {
      await acceptanceTest.fn();
      console.log(`PASS ${acceptanceTest.name}`);
    } catch (error) {
      console.error(`FAIL ${acceptanceTest.name}`);
      console.error(error);
      process.exit(1);
    }
  }
})();
