import { createClient } from '@/lib/supabase/server';

// ==================== PROFILES ====================

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getProfileByUsername(username: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateProfile(userId: string, updates: {
  username?: string;
  role?: string;
  coins?: number;
  team_id?: string | null;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getAllProfiles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function addCoins(userId: string, amount: number) {
  const supabase = await createClient();
  
  // First get current coins
  const { data: profile, error: getError } = await supabase
    .from('profiles')
    .select('coins')
    .eq('id', userId)
    .single();
  
  if (getError) throw getError;
  
  const newCoins = (profile?.coins || 0) + amount;
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ coins: newCoins, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ==================== TEAMS ====================

export async function createTeam(data: {
  name: string;
  tag: string;
  owner_id: string;
}) {
  const supabase = await createClient();
  const { data: team, error } = await supabase
    .from('teams')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  
  // Update owner's team_id
  await updateProfile(data.owner_id, { team_id: team.id });
  
  return team;
}

export async function getTeam(teamId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      owner:profiles!teams_owner_id_fkey(id, username, email),
      members:profiles!profiles_team_id_fkey(id, username, email, role)
    `)
    .eq('id', teamId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getTeamByName(name: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('name', name)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getAllTeams() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      owner:profiles!teams_owner_id_fkey(id, username),
      members:profiles!profiles_team_id_fkey(id, username)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function updateTeam(teamId: string, updates: {
  name?: string;
  tag?: string;
  logo_url?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('teams')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', teamId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteTeam(teamId: string) {
  const supabase = await createClient();
  
  // First remove team_id from all members
  await supabase
    .from('profiles')
    .update({ team_id: null })
    .eq('team_id', teamId);
  
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', teamId);
  
  if (error) throw error;
}

// ==================== SCRIMS ====================

export async function createScrim(data: {
  title: string;
  date: string;
  time: string;
  map: string;
  mode: string;
  max_teams: number;
  room_id?: string;
  room_password?: string;
  created_by: string;
}) {
  const supabase = await createClient();
  const { data: scrim, error } = await supabase
    .from('scrims')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return scrim;
}

export async function getScrim(scrimId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('scrims')
    .select(`
      *,
      slots(
        *,
        team:teams(id, name, tag, logo_url),
        registered_by:profiles!slots_registered_by_fkey(id, username)
      ),
      results(*)
    `)
    .eq('id', scrimId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getAllScrims(status?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('scrims')
    .select(`
      *,
      slots(
        *,
        team:teams(id, name, tag)
      )
    `)
    .order('date', { ascending: true })
    .order('time', { ascending: true });
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

export async function updateScrim(scrimId: string, updates: {
  title?: string;
  date?: string;
  time?: string;
  map?: string;
  mode?: string;
  max_teams?: number;
  status?: string;
  room_id?: string;
  room_password?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('scrims')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', scrimId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteScrim(scrimId: string) {
  const supabase = await createClient();
  
  // Delete slots first
  await supabase.from('slots').delete().eq('scrim_id', scrimId);
  // Delete results
  await supabase.from('results').delete().eq('scrim_id', scrimId);
  
  const { error } = await supabase
    .from('scrims')
    .delete()
    .eq('id', scrimId);
  
  if (error) throw error;
}

// ==================== SLOTS ====================

export async function registerTeamForScrim(data: {
  scrim_id: string;
  team_id: string;
  registered_by: string;
}) {
  const supabase = await createClient();
  
  // Check if team is already registered
  const { data: existingSlot } = await supabase
    .from('slots')
    .select('*')
    .eq('scrim_id', data.scrim_id)
    .eq('team_id', data.team_id)
    .single();
  
  if (existingSlot) {
    throw new Error('Team is already registered for this scrim');
  }
  
  // Get current slot count
  const { count } = await supabase
    .from('slots')
    .select('*', { count: 'exact', head: true })
    .eq('scrim_id', data.scrim_id);
  
  // Get scrim max_teams
  const { data: scrim } = await supabase
    .from('scrims')
    .select('max_teams')
    .eq('id', data.scrim_id)
    .single();
  
  if (scrim && count !== null && count >= scrim.max_teams) {
    throw new Error('Scrim is full');
  }
  
  const slotNumber = (count || 0) + 1;
  
  const { data: slot, error } = await supabase
    .from('slots')
    .insert({ ...data, slot_number: slotNumber })
    .select(`
      *,
      team:teams(id, name, tag)
    `)
    .single();
  
  if (error) throw error;
  return slot;
}

export async function unregisterTeamFromScrim(scrimId: string, teamId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('slots')
    .delete()
    .eq('scrim_id', scrimId)
    .eq('team_id', teamId);
  
  if (error) throw error;
}

export async function getScrimSlots(scrimId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('slots')
    .select(`
      *,
      team:teams(id, name, tag, logo_url)
    `)
    .eq('scrim_id', scrimId)
    .order('slot_number', { ascending: true });
  
  if (error) throw error;
  return data;
}

// ==================== RESULTS ====================

export async function saveResults(scrimId: string, results: {
  team_id: string;
  placement: number;
  kills: number;
  points: number;
}[]) {
  const supabase = await createClient();
  
  // Delete existing results for this scrim
  await supabase.from('results').delete().eq('scrim_id', scrimId);
  
  // Insert new results
  const resultsWithScrimId = results.map(r => ({ ...r, scrim_id: scrimId }));
  
  const { data, error } = await supabase
    .from('results')
    .insert(resultsWithScrimId)
    .select(`
      *,
      team:teams(id, name, tag)
    `);
  
  if (error) throw error;
  
  // Update scrim status
  await updateScrim(scrimId, { status: 'COMPLETED' });
  
  return data;
}

export async function getResults(scrimId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('results')
    .select(`
      *,
      team:teams(id, name, tag)
    `)
    .eq('scrim_id', scrimId)
    .order('placement', { ascending: true });
  
  if (error) throw error;
  return data;
}

// ==================== CASE REWARDS ====================

export async function getCaseRewards() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('case_rewards')
    .select('*')
    .order('probability', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createCaseReward(data: {
  name: string;
  rarity: string;
  coins: number;
  probability: number;
  image_url?: string;
}) {
  const supabase = await createClient();
  const { data: reward, error } = await supabase
    .from('case_rewards')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return reward;
}

export async function updateCaseReward(rewardId: string, updates: {
  name?: string;
  rarity?: string;
  coins?: number;
  probability?: number;
  image_url?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('case_rewards')
    .update(updates)
    .eq('id', rewardId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteCaseReward(rewardId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('case_rewards')
    .delete()
    .eq('id', rewardId);
  
  if (error) throw error;
}

// ==================== SYSTEM CONFIG ====================

export async function getSystemConfig(key: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', key)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data?.value;
}

export async function setSystemConfig(key: string, value: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('system_config')
    .upsert({ key, value, updated_at: new Date().toISOString() })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ==================== AUDIT LOGS ====================

export async function createAuditLog(data: {
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
}) {
  const supabase = await createClient();
  const { data: log, error } = await supabase
    .from('audit_logs')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return log;
}

export async function getAuditLogs(limit = 100) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      user:profiles(id, username)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
}
