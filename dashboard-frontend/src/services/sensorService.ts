// src/services/sensorService.ts
export function getSensorStatus(sensorType: string, value: string): string {
  const type = sensorType.toLowerCase();
  const val = value.toLowerCase();

  // Office / Area A — PIR Motion
  if (type.includes('pir') || type.includes('motion')) {
    if (
      val.includes('motion_detected') ||
      val.includes('motion detected') ||
      val.includes('detected') ||
      val.includes('active') ||
      val === '1'
    ) {
      return 'Motion Detected';
    }
    return 'No Motion';
  }

  // Office / Area A dan Warehouse / Area B — Door Reed
  if (type.includes('reed') || type.includes('door')) {
    if (
      val.includes('open') ||
      val.includes('opened') ||
      val.includes('door_open') ||
      val === '1'
    ) {
      return 'Door Open';
    }
    if (
      val.includes('closed') ||
      val.includes('close') ||
      val.includes('door_closed') ||
      val === '0'
    ) {
      return 'Door Closed';
    }
    return value;
  }

  // Office / Area A — Vibration
  if (type.includes('vibration') || type.includes('vibrate')) {
    if (
      val.includes('abnormal') ||
      val.includes('abnormal_vibration') ||
      val.includes('detected') ||
      val.includes('alert') ||
      val === '1'
    ) {
      return 'Abnormal Vibration';
    }
    return 'Normal';
  }

  // Warehouse / Area B — RFID
  if (type.includes('rfid') || type.includes('access')) {
    if (
      val.includes('unauthorized') ||
      val.includes('denied') ||
      val.includes('invalid') ||
      val.includes('expired') ||
      val.includes('access_denied')
    ) {
      return 'Unauthorized';
    }
    if (
      val.includes('authorized') ||
      val.includes('granted') ||
      val.includes('valid') ||
      val.includes('access_granted')
    ) {
      return 'Authorized';
    }
    return value;
  }

  // Warehouse / Area B — Alarm Module: LED, buzzer, LCD
  if (
    type.includes('alarm') ||
    type.includes('led') ||
    type.includes('buzzer') ||
    type.includes('lcd')
  ) {
    if (
      val.includes('danger') ||
      val.includes('alert') ||
      val.includes('alarm') ||
      val.includes('red') ||
      val.includes('flood')
    ) {
      return 'Alert';
    }
    if (val.includes('warning') || val.includes('yellow')) {
      return 'Warning';
    }
    if (
      val.includes('normal') ||
      val.includes('green') ||
      val.includes('safe')
    ) {
      return 'Normal';
    }
    return value;
  }

  // Fallback — kembalikan value asli jika tidak ada yang cocok
  return value;
}

// -------------------------------------------------------
// Menentukan warna teks berdasarkan status sensor.
// Merah  = bahaya/terbuka/tidak sah
// Kuning = peringatan
// Hijau  = normal/aman
// -------------------------------------------------------
export function getStatusColor(status: string): string {
  const s = status.toLowerCase();

  if (
    s.includes('abnormal') ||
    s.includes('unauthorized') ||
    s.includes('alert') ||
    s.includes('danger') ||
    s.includes('open')
  ) {
    return '#D9534F'; // merah
  }

  if (s.includes('warning')) {
    return '#F0AD4E'; // kuning
  }

  return '#2E8B57'; // hijau
}