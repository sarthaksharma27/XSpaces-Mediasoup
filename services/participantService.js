import redis from '../redis/redisClient.js';

export async function joinSpace(spaceId, userId, role = 'listener') {
  await redis.hset(`space:${spaceId}:participants`, userId, role);
}

export async function leaveSpace(spaceId, userId) {
  await redis.hdel(`space:${spaceId}:participants`, userId);
}

// export async function getParticipants(spaceId) {
//   const participants = await redis.hgetall(`space:${spaceId}:participants`);
//   return participants;
// }

// export async function getRole(spaceId, userId) {
//   return await redis.hget(`space:${spaceId}:participants`, userId);
// }
