import { supabase } from '../supabase';

export interface MobileAppMilestone {
  id: string;
  project_id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'pending' | 'blocked';
  progress: number;
  notes?: string;
  completed_date?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface MobileAppProject {
  id: string;
  company_id?: string | null;
  project_name?: string | null;
  platform: string; // 'android' | 'ios' | 'both'
  app_name: string;
  package_name?: string | null;
  bundle_id?: string | null;
  play_store_status?: string | null;
  play_store_url?: string | null;
  app_store_status?: string | null;
  app_store_url?: string | null;
  estimated_completion?: string | null;
  overall_progress?: number | null;
  status?: string | null;
  last_update?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Get all projects for a company
export async function getMobileAppProjectsByCompany(companyId: string) {
  const { data, error } = await supabase
    .from('mobile_app_projects')
    .select(`
      *,
      milestones:mobile_app_milestones(*)
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Get project by ID with milestones
export async function getMobileAppProjectById(projectId: string) {
  const { data, error } = await supabase
    .from('mobile_app_projects')
    .select(`
      *,
      milestones:mobile_app_milestones(*)
    `)
    .eq('id', projectId)
    .single();

  if (error) throw error;
  return data;
}

// Create new project
export async function createMobileAppProject(project: Omit<MobileAppProject, 'id' | 'created_at' | 'updated_at' | 'last_update'>) {
  const { data, error } = await supabase
    .from('mobile_app_projects')
    .insert([project])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update project
export async function updateMobileAppProject(projectId: string, updates: Partial<MobileAppProject>) {
  const { data, error } = await supabase
    .from('mobile_app_projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update milestones (bulk update)
export async function updateMobileAppMilestones(projectId: string, milestones: Partial<MobileAppMilestone>[]) {
  // Delete existing milestones
  await supabase
    .from('mobile_app_milestones')
    .delete()
    .eq('project_id', projectId);

  // Insert new milestones
  const { data, error } = await supabase
    .from('mobile_app_milestones')
    .insert(milestones.map(m => ({ ...m, project_id: projectId })))
    .select();

  if (error) throw error;
  return data;
}
// Get ALL mobile app projects (for Super Admin)
export async function getAllMobileAppProjects() {
  const { data, error } = await supabase
    .from('mobile_app_projects')
    .select(`
      *,
      company:companies(id, name),
      milestones:mobile_app_milestones(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all mobile app projects:', error);
    throw error;
  }
  
  return data;
}

// Update project and milestones (for Super Admin)
export async function updateMobileAppProjectWithMilestones(
  projectId: string,
  projectData: Partial<MobileAppProject>,
  milestones: Partial<MobileAppMilestone>[]
) {
  // Update project
  const { data: project, error: projectError } = await supabase
    .from('mobile_app_projects')
    .update(projectData)
    .eq('id', projectId)
    .select()
    .single();

  if (projectError) {
    console.error('Error updating mobile app project:', projectError);
    throw projectError;
  }

  // Delete old milestones
  await supabase
    .from('mobile_app_milestones')
    .delete()
    .eq('project_id', projectId);

  // Insert new milestones
  if (milestones.length > 0) {
    const { error: milestonesError } = await supabase
      .from('mobile_app_milestones')
      .insert(milestones.map((m, index) => ({
        project_id: projectId,
        title: m.title,
        status: m.status,
        progress: m.progress,
        notes: m.notes,
        completed_date: m.completed_date,
        display_order: index
      })));

    if (milestonesError) {
      console.error('Error updating milestones:', milestonesError);
      throw milestonesError;
    }
  }

  return project;
}