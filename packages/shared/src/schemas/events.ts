import { z } from 'zod';

export const CardColorSchema = z.enum(['red', 'blue', 'green', 'yellow']);

export const CardTypeSchema = z.enum([
  'number',
  'skip',
  'reverse',
  'draw2',
  'wild',
  'wild4',
]);

export const CardValueSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
  z.literal(8),
  z.literal(9),
]);

export const CardSchema = z.object({
  id: z.string(),
  type: CardTypeSchema,
  color: CardColorSchema.optional(),
  value: CardValueSchema.optional(),
});

export const GameRulesConfigSchema = z.object({
  allowDrawAndPlay: z.boolean().default(true),
  wd4ChallengeEnabled: z.boolean().default(true),
  unoPenaltyCards: z.number().int().min(1).max(5).default(2),
  drawCardPenaltyOnCatchUno: z.number().int().min(1).max(5).default(2),
  turnTimeoutSeconds: z.number().int().min(10).max(120).default(30),
});

export const RoomSettingsSchema = z.object({
  maxPlayers: z.number().int().min(2).max(4).default(4),
  minPlayers: z.number().int().min(2).max(4).default(2),
  isPrivate: z.boolean().default(true),
  rules: GameRulesConfigSchema.default({
    allowDrawAndPlay: true,
    wd4ChallengeEnabled: true,
    unoPenaltyCards: 2,
    drawCardPenaltyOnCatchUno: 2,
    turnTimeoutSeconds: 30,
  }),
});

export const CreateRoomSchema = z.object({
  playerName: z.string().trim().min(1, 'Player name is required').max(20, 'Name must be 20 characters or fewer'),
  avatar: z.string().default('cat'),
  settings: RoomSettingsSchema.partial().optional(),
});

export const JoinRoomSchema = z.object({
  roomCode: z.string().trim().min(4, 'Room code must be at least 4 characters').max(10).toUpperCase(),
  playerName: z.string().trim().min(1, 'Player name is required').max(20, 'Name must be 20 characters or fewer'),
  avatar: z.string().default('cat'),
});

export const ReconnectRoomSchema = z.object({
  roomId: z.string().min(1),
  playerId: z.string().min(1),
  reconnectToken: z.string().min(1),
});

export const SetReadySchema = z.object({
  isReady: z.boolean(),
});

export const PlayCardSchema = z.object({
  cardId: z.string().min(1),
  chosenColor: CardColorSchema.optional(),
});

export const PlayDrawnCardSchema = z.object({
  play: z.boolean(),
  chosenColor: CardColorSchema.optional(),
});

export const ChooseColorSchema = z.object({
  color: CardColorSchema,
});

export const CatchUnoSchema = z.object({
  targetPlayerId: z.string().min(1),
});

export const ChallengeWd4Schema = z.object({
  challenge: z.boolean(),
});

export const AddAiPlayerSchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
});

export const RemoveAiPlayerSchema = z.object({
  playerId: z.string().min(1),
});

export const KickPlayerSchema = z.object({
  targetPlayerId: z.string().min(1),
});
