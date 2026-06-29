import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MaintenanceLog, StorageConfig, StorageMode } from '../types';

const STORAGE_KEYS = {
  CONFIG: 'fleet_manager_config',
  LOCAL_LOGS: 'fleet_manager_logs',
};

// Default configuration reading from environment variables
const DEFAULT_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const DEFAULT_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseClient: SupabaseClient | null = null;

// Initialize Supabase Client if credentials are provided
export const getSupabaseClient = (url?: string, key?: string): SupabaseClient | null => {
  const finalUrl = url || DEFAULT_URL;
  const finalKey = key || DEFAULT_KEY;

  if (!finalUrl || !finalKey || finalUrl.includes('YOUR_SUPABASE_PROJECT_URL')) {
    supabaseClient = null;
    return null;
  }

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(finalUrl, finalKey, {
        auth: {
          persistSession: false, // Mobile doesn't need standard web cookie session persistence for anonymous client
        },
      });
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      supabaseClient = null;
    }
  }
  return supabaseClient;
};

// Retrieve configuration (mode, credentials)
export const getStorageConfig = async (): Promise<StorageConfig> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure we merge defaults if not saved
      return {
        supabaseUrl: parsed.supabaseUrl || DEFAULT_URL,
        supabaseKey: parsed.supabaseKey || DEFAULT_KEY,
        mode: parsed.mode || (DEFAULT_URL && DEFAULT_KEY ? 'cloud' : 'local'),
      };
    }
  } catch (error) {
    console.error('Error reading storage config:', error);
  }

  return {
    supabaseUrl: DEFAULT_URL,
    supabaseKey: DEFAULT_KEY,
    mode: DEFAULT_URL && DEFAULT_KEY ? 'cloud' : 'local',
  };
};

// Save storage config
export const saveStorageConfig = async (config: StorageConfig): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    // Force re-initialization of client on next get
    supabaseClient = null;
    if (config.mode === 'cloud') {
      getSupabaseClient(config.supabaseUrl, config.supabaseKey);
    }
  } catch (error) {
    console.error('Error saving storage config:', error);
    throw error;
  }
};

// Fetch all logs
export const fetchLogs = async (): Promise<MaintenanceLog[]> => {
  const config = await getStorageConfig();

  if (config.mode === 'cloud') {
    const client = getSupabaseClient(config.supabaseUrl, config.supabaseKey);
    if (client) {
      try {
        const { data, error } = await client
          .from('fleet_logs')
          .select('*')
          .order('log_date', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Supabase fetch error, falling back to local logs:', error);
        // Fallback to local logs on fetch error so app remains functional
      }
    }
  }

  // Local fallback / Local Mode
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.LOCAL_LOGS);
    if (raw) {
      const logs: MaintenanceLog[] = JSON.parse(raw);
      // Sort local logs by date descending
      return logs.sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());
    }
  } catch (error) {
    console.error('Error reading local logs:', error);
  }
  return [];
};

// Add a log
export const addLog = async (
  log: Omit<MaintenanceLog, 'id' | 'created_at'>
): Promise<MaintenanceLog> => {
  const config = await getStorageConfig();
  const timestamp = new Date().toISOString();

  if (config.mode === 'cloud') {
    const client = getSupabaseClient(config.supabaseUrl, config.supabaseKey);
    if (client) {
      try {
        const { data, error } = await client
          .from('fleet_logs')
          .insert([log])
          .select();

        if (error) throw error;
        if (data && data[0]) {
          return data[0];
        }
      } catch (error) {
        console.error('Supabase insert failed, saving locally:', error);
      }
    }
  }

  // Local Save
  const localLog: MaintenanceLog = {
    ...log,
    id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    created_at: timestamp,
  };

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.LOCAL_LOGS);
    const existing: MaintenanceLog[] = raw ? JSON.parse(raw) : [];
    existing.push(localLog);
    await AsyncStorage.setItem(STORAGE_KEYS.LOCAL_LOGS, JSON.stringify(existing));
    return localLog;
  } catch (error) {
    console.error('Failed to save log locally:', error);
    throw error;
  }
};

// Delete a log
export const deleteLog = async (id: string): Promise<void> => {
  const config = await getStorageConfig();

  if (config.mode === 'cloud' && !id.startsWith('local-')) {
    const client = getSupabaseClient(config.supabaseUrl, config.supabaseKey);
    if (client) {
      try {
        const { error } = await client.from('fleet_logs').delete().eq('id', id);
        if (error) throw error;
        return;
      } catch (error) {
        console.error('Supabase delete error:', error);
      }
    }
  }

  // Local Delete
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.LOCAL_LOGS);
    if (raw) {
      const existing: MaintenanceLog[] = JSON.parse(raw);
      const filtered = existing.filter((log) => log.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.LOCAL_LOGS, JSON.stringify(filtered));
    }
  } catch (error) {
    console.error('Failed to delete log locally:', error);
    throw error;
  }
};

// Sync Local Logs to Cloud (manual action)
export const syncLocalToCloud = async (): Promise<{ syncedCount: number; errors: any[] }> => {
  const config = await getStorageConfig();
  if (config.mode !== 'cloud') {
    throw new Error('Please switch to Cloud Sync Mode before syncing.');
  }

  const client = getSupabaseClient(config.supabaseUrl, config.supabaseKey);
  if (!client) {
    throw new Error('Supabase client not initialized. Check your configurations.');
  }

  const raw = await AsyncStorage.getItem(STORAGE_KEYS.LOCAL_LOGS);
  if (!raw) return { syncedCount: 0, errors: [] };

  const localLogs: MaintenanceLog[] = JSON.parse(raw);
  if (localLogs.length === 0) return { syncedCount: 0, errors: [] };

  let syncedCount = 0;
  const errors: any[] = [];
  const successfulIds: string[] = [];

  // Upload logs to Supabase
  for (const log of localLogs) {
    try {
      // Strip local temporary id and date timestamp to let Supabase auto-generate
      const { plate_number, log_date, mileage, maintenance_notes } = log;
      const { error } = await client.from('fleet_logs').insert([
        { plate_number, log_date, mileage, maintenance_notes },
      ]);

      if (error) {
        errors.push(error);
      } else {
        syncedCount++;
        if (log.id) successfulIds.push(log.id);
      }
    } catch (e) {
      errors.push(e);
    }
  }

  // Remove successfully synced logs from local storage
  if (successfulIds.length > 0) {
    const remaining = localLogs.filter((log) => !log.id || !successfulIds.includes(log.id));
    await AsyncStorage.setItem(STORAGE_KEYS.LOCAL_LOGS, JSON.stringify(remaining));
  }

  return { syncedCount, errors };
};
