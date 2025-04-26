import Redis from 'ioredis';

const redis = new Redis({
  host: 'localhost',  
  port: 6379,         
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

export default redis;
