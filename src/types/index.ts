export interface MaintenanceLog {
  id?: string;
  created_at?: string;
  plate_number: string;
  log_date: string; // YYYY-MM-DD
  mileage: number;
  maintenance_notes: string;
}

export type StorageMode = 'local' | 'cloud';

export interface StorageConfig {
  supabaseUrl: string;
  supabaseKey: string;
  mode: StorageMode;
}
