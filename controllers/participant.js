// import { joinSpace, leaveSpace } from '../services/participantService.js';

// export async function join(req, res) {
//   const spaceId = req.params.id;
//   console.log(spaceId);
  
//   const userId = req.user.id;
//   const role = req.body.role || 'listener';
//   await joinSpace(spaceId, userId, role);
//   res.status(200).send(`User ${userId} joined as ${role}`);
// }

// export async function leave(req, res) {
//   const spaceId = req.params.id;
//   const userId = req.user.id;
//   await leaveSpace(spaceId, userId);
//   res.status(200).send(`User ${userId} left the space`);
// }

// export async function getParticipantsList(req, res) {
//   const spaceId = req.params.id;
//   const participants = await getParticipants(spaceId);
//   res.status(200).json(participants);
// }
