import achievementVictoryIcon from '../assets/icons/achievement-victory.svg';
import achievementSkillsIcon from '../assets/icons/achievement-skills.svg';
import achievementLevelIcon from '../assets/icons/achievement-level.svg';
import avatarIcon from '../assets/icons/avatar.svg';
import storyImage from '../assets/carousel/story.png';
import multiplayerImage from '../assets/carousel/multiplayer.png';
import coopRaidsImage from '../assets/carousel/co-op-raids.png';
import type { Achievement, GameMode, Player, SystemStats } from './types';

export const FRAMEWORK_LABEL = 'VUE (TYPESCRIPT)';

export const achievements: Achievement[] = [
  {
    id: 'first-victory',
    title: 'First Victory',
    unlockedAt: 'Unlocked 2h ago',
    iconUrl: achievementVictoryIcon,
  },
  {
    id: 'skills-awakened',
    title: 'Skills Awakened',
    unlockedAt: 'Unlocked 1d ago',
    iconUrl: achievementSkillsIcon,
  },
  {
    id: 'level-10',
    title: 'Level 10 Reached',
    unlockedAt: 'Unlocked 3d ago',
    iconUrl: achievementLevelIcon,
  },
];

export const gameModes: GameMode[] = [
  {
    id: 'story-campaign',
    title: 'STORY CAMPAIGN',
    imageUrl: storyImage,
  },
  {
    id: 'multiplayer',
    title: 'MULTIPLAYER',
    imageUrl: multiplayerImage,
  },
  {
    id: 'co-op-raids',
    title: 'CO-OP RAIDS',
    imageUrl: coopRaidsImage,
  },
];

export const player: Player = {
  name: 'STARLORD_77',
  level: 15,
  avatarUrl: avatarIcon,
  health: 100,
  energy: 85,
  xp: 50,
  maxHealth: 100,
  maxEnergy: 100,
  maxXp: 100,
};

export const systemStats: SystemStats = {
  fps: 60,
  ping: 12,
};
