export type Achievement = {
  id: string;
  title: string;
  unlockedAt: string;
  iconUrl: string;
};

export type GameMode = {
  id: string;
  title: string;
  imageUrl: string;
};

export type Player = {
  name: string;
  level: number;
  avatarUrl: string;
  health: number;
  energy: number;
  xp: number;
  maxHealth: number;
  maxEnergy: number;
  maxXp: number;
};

export type SystemStats = {
  fps: number;
  ping: number;
};
