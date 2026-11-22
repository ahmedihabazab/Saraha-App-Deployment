import { client } from "../DB/redis.connection.js";

export function getJwtIdPatternBase(userId){
  return `User::${userId}::RevokeTokenId`
}

export function getJwtIdPattern(userId , jwtid) {
  return `User::${userId}::RevokeTokenId::${jwtid}`
}

export function getEmailKey(email , subject) {
  return `User::${email}::${subject}`
}

export function getSendOtpTRialsKey(email , subject) {
  return `User::${email}::${subject}::Send OTP TRIALs`
}

export function getSendOtpBanKey(email , subject) {
  return `User::${email}::${subject}::Send OTP Ban`
}

export async function setValueCashed({
  key,
  value,
  options = { expiration: { type: "EX", value: 30 } },
} = {}) {
  if (typeof value === "object") {
    value = JSON.stringify(value);
  }
  if (!options.expiration.type) {
    options.expiration.type = "EX";
  }
  return await client.set(key, value, options);
}

export async function getValueCashed(key) {
  let result;
  try {
    result = await client.get(key);
    return JSON.parse(result);
  } catch (error) {
    return result;
  }
}

export async function ttl(key) {
  return client.ttl(key);
}

export async function isExists(keys) {
  return client.exists(keys);
}

export async function updateValue({
  key,
  value,
  options = { expiration: { type: "EX", value: 30 } },
} = {}) {
  const isKeyExists = await isExists(key);
  if (!isKeyExists) {
    return 0;
  }
  return setValueCashed({ key, value, options });
}

export async function delKey(keys) {
  return await client.del(keys)
}

export async function getAllKeys(prefix) {
  return await client.keys(`${prefix}*`) 
}

export async function incrKey({key , increamentBy = 1}) {
  return await client.incrBy(key ,increamentBy) 
}

export async function expireKey({key , ttl}) {
  return await client.expire(key ,ttl) 
}