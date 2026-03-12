import AuditLog from "../models/AuditLog.js";

export const createAuditLog = async ({
  actor,
  action,
  entityType,
  entityId,
  details,
  ipAddress,
}) => {
  return await AuditLog.create({
    actor,
    action,
    entityType,
    entityId,
    details,
    ipAddress,
  });
};
