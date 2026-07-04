// src/services/api.ts
const API_URL = "http://localhost:8000/api";

export const getOfficeSensors = async () => {
  const res = await fetch(`${API_URL}/office/sensors`);
  return res.json();
};

export const getOfficeAlerts = async () => {
  const res = await fetch(`${API_URL}/office/alerts`);
  return res.json();
};

export const getWarehouseDoor = async () => {
  const res = await fetch(`${API_URL}/warehouse/door`);
  return res.json();
};

export const getWarehouseSecurity = async () => {
  const res = await fetch(`${API_URL}/warehouse/security-devices`);
  return res.json();
};

export const getWarehouseRFID = async () => {
  const res = await fetch(`${API_URL}/warehouse/rfid`);
  return res.json();
};

export const getWarehouseAlerts = async () => {
  const res = await fetch(`${API_URL}/warehouse/alerts`);
  return res.json();
};

export const getAttackHistory = async () => {
  const res = await fetch(`${API_URL}/cyber-attacks`);
  return res.json();
};

export const getMitigation = async () => {
  const res = await fetch(`${API_URL}/mitigation`);
  return res.json();
};

export const getAlerts = async () => {
  const res = await fetch(`${API_URL}/alerts`);
  return res.json();
};

export const loadDashboardData = async () => {
  const [
    alerts,
    officeSensors,
    officeAlerts,
    warehouseDoor,
    warehouseSecurity,
    warehouseRFID,
    warehouseAlerts,
    attackHistory,
    mitigation,
  ] = await Promise.all([
    getAlerts(),
    getOfficeSensors(),
    getOfficeAlerts(),
    getWarehouseDoor(),
    getWarehouseSecurity(),
    getWarehouseRFID(),
    getWarehouseAlerts(),
    getAttackHistory(),
    getMitigation(),
  ]);

  return {
    alerts,
    officeSensors,
    officeAlerts,
    warehouseDoor,
    warehouseSecurity,
    warehouseRFID,
    warehouseAlerts,
    attackHistory,
    mitigation,
  };
};