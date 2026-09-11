/**
 * mock-data.js
 * Static demo content used when Firebase/Groq are not configured.
 * All arrays are treated as read-only seed data; user activity is layered
 * on top of this in localStorage by firestore.js's demo adapter.
 */

const MOCK = {
  editions: ["Java", "Bedrock"],
  versions: ["1.20", "1.20.4", "1.21", "1.21.4"],

  categories: {
    myth: ["Combat", "Mobs", "Redstone", "Survival", "Village", "Nether", "End", "Items", "Physics", "Rare", "Bedrock", "Java"],
    secret: ["Hidden Mechanics", "Rare Interactions", "Mob Behavior", "World Generation", "Items", "Redstone", "Structures"]
  },

  myths: [
    { id: "m1", title: "Can a creeper destroy obsidian?", category: "Combat", difficulty: "Easy", edition: "Java", version: "1.21", status: "FALSE" },
    { id: "m2", title: "Can a boat survive lava?", category: "Physics", difficulty: "Easy", edition: "Bedrock", version: "1.21+", status: "TRUE" },
    { id: "m3", title: "Do villagers avoid zombies wearing armor?", category: "Village", difficulty: "Medium", edition: "Java", version: "1.20.4", status: "VERSION DEPENDENT" },
    { id: "m4", title: "Can you outrun a warden by placing sand?", category: "Mobs", difficulty: "Hard", edition: "Java", version: "1.20", status: "UNTESTED" },
    { id: "m5", title: "Does a redstone clock desync across chunk borders?", category: "Redstone", difficulty: "Hard", edition: "Java", version: "1.21", status: "INCONCLUSIVE" },
    { id: "m6", title: "Can piglins be bribed with gold nuggets instead of ingots?", category: "Nether", difficulty: "Easy", edition: "Bedrock", version: "1.20.4", status: "FALSE" },
    { id: "m7", title: "Do end crystals chain-explode through obsidian?", category: "End", difficulty: "Medium", edition: "Java", version: "1.21", status: "UNTESTED" },
    { id: "m8", title: "Can a totem of undying survive a warden's sonic boom?", category: "Rare", difficulty: "Hard", edition: "Java", version: "1.21.4", status: "TRUE" }
  ],

  challenges: [
    { id: "c1", title: "Survive one night with no crafting table", difficulty: "Easy", time: "10 min", rules: "No crafting table may be placed. Punch-only tool tier allowed.", reward: "40 XP" },
    { id: "c2", title: "Build a base using one block type only", difficulty: "Medium", time: "45 min", rules: "Every placed block (except light sources) must be the same type.", reward: "70 XP" },
    { id: "c3", title: "Defeat a Ravager using only a bow", difficulty: "Hard", time: "20 min", rules: "Melee weapons are banned. Arrows and the environment only.", reward: "100 XP" },
    { id: "c4", title: "Find a Mangrove Swamp within 5 minutes", difficulty: "Medium", time: "5 min", rules: "Timer starts on world load. F3 coordinates allowed, map is not.", reward: "60 XP" },
    { id: "c5", title: "Locate a Woodland Mansion with no map", difficulty: "Hard", time: "60 min", rules: "No cartography table items. Compass and exploring only.", reward: "120 XP" }
  ],

  secrets: [
    { id: "s1", title: "Allays copy note block pitch to nearby jukeboxes", category: "Mob Behavior", level: "Obscure", edition: "Java", version: "1.21", status: "TRUE" },
    { id: "s2", title: "Sculk sensors ignore vibrations from sneaking players", category: "Hidden Mechanics", level: "Common", edition: "Java", version: "1.20", status: "TRUE" },
    { id: "s3", title: "Lightning striking a pig spawns a zombified piglin, not a zombie", category: "Rare Interactions", level: "Rare", edition: "Bedrock", version: "1.21.4", status: "TRUE" },
    { id: "s4", title: "Bamboo can grow through a two-block gap without breaking", category: "World Generation", level: "Obscure", edition: "Java", version: "1.20.4", status: "UNTESTED" },
    { id: "s5", title: "A comparator can read the fullness of a decorated pot", category: "Redstone", level: "Common", edition: "Java", version: "1.21", status: "TRUE" }
  ],

  mobs: ["Iron Golem", "Warden", "Ravager", "Wither", "Ender Dragon", "Piglin Brute", "Evoker", "Vindicator", "Breeze", "Elder Guardian"],
  arenas: ["Superflat Arena", "Nether Bastion Courtyard", "End Island", "Ocean Monument Chamber", "Village Square"],

  trending: [
    { id: "t1", title: "Can a Warden be trapped in a 1x1 hole?", views: 18400, tests: 342, likes: 2210, saves: 980 },
    { id: "t2", title: "Every mob tiny — the addon breakdown", views: 15200, tests: 210, likes: 1870, saves: 760 },
    { id: "t3", title: "Iron Golem vs Warden: the real numbers", views: 12100, tests: 188, likes: 1540, saves: 640 },
    { id: "t4", title: "Does TNT duping still work in 1.21?", views: 9800, tests: 143, likes: 1120, saves: 410 }
  ],

  addons: [
    { id: "a1", name: "Mini Mobs Reborn", creator: "BlockSmithy", edition: "Bedrock", versions: ["1.20", "1.20.4"], description: "Scales down hostile and passive mob hitboxes and models.", source: "MCPEDL", url: "https://mcpedl.com/" },
    { id: "a2", name: "Scaled Fauna", creator: "PixelWard", edition: "Java", versions: ["1.20.4", "1.21"], description: "Datapack that resizes mobs using display-entity scaling.", source: "Modrinth", url: "https://modrinth.com/" },
    { id: "a3", name: "Compact Creatures", creator: "Rootbeer Studios", edition: "Java", versions: ["1.21"], description: "Fabric mod adding a config-driven mob size multiplier.", source: "CurseForge", url: "https://www.curseforge.com/" },
    { id: "a4", name: "Tiny Terrors Add-On", creator: "Voxel Forge", edition: "Bedrock", versions: ["1.21", "1.21.4"], description: "Behavior pack reworking mob AI and scale for miniature combat.", source: "MCPEDL", url: "https://mcpedl.com/" }
  ]
};

const AI_KEYWORD_MAP = {
  tiny: ["tiny mobs", "small mobs", "mini mobs", "mob size", "scaled mobs"],
  small: ["tiny mobs", "small mobs", "mini mobs", "mob size", "scaled mobs"],
  giant: ["giant mobs", "large mobs", "mob scale", "boss mobs"],
  huge: ["giant mobs", "large mobs", "mob scale", "boss mobs"],
  fly: ["flying mobs", "hover mobs", "levitation mod", "wing addon"],
  swim: ["swimming mobs", "aquatic ai", "water mob addon"],
  fire: ["fire mobs", "flame addon", "burning mechanics"],
  lava: ["lava mechanics", "fire resistance addon", "nether physics"]
};

if (typeof module !== "undefined") module.exports = { MOCK, AI_KEYWORD_MAP };
