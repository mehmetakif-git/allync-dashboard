import { supabase } from '../supabase';

export interface WebsiteMilestone {
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

export interface WebsiteProject {
  id: string;
  company_id?: string | null;
  project_name?: string | null;
  project_type: string; // 'e-commerce' | 'corporate' | 'personal'
  domain?: string | null;
  email?: string | null;
  estimated_completion?: string | null;
  overall_progress?: number | null;
  status?: string | null; // 'active' | 'paused' | 'completed' | 'cancelled'
  last_update?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Get all projects for a company
export async function getWebsiteProjectsByCompany(companyId: string) {
  const { data, error } = await supabase
    .from('website_projects')
    .select(`
      *,
      milestones:website_milestones(*)
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Get project by ID with milestones
export async function getWebsiteProjectById(projectId: string) {
  const { data, error } = await supabase
    .from('website_projects')
    .select(`
      *,
      milestones:website_milestones(*)
    `)
    .eq('id', projectId)
    .single();

  if (error) throw error;
  return data;
}

// Create new project
export async function createWebsiteProject(project: Omit<WebsiteProject, 'id' | 'created_at' | 'updated_at' | 'last_update'>) {
  const { data, error } = await supabase
    .from('website_projects')
    .insert([project])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update project
export async function updateWebsiteProject(projectId: string, updates: Partial<WebsiteProject>) {
  const { data, error } = await supabase
    .from('website_projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Create milestone
export async function createWebsiteMilestone(milestone: Omit<WebsiteMilestone, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('website_milestones')
    .insert([milestone])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update milestone
export async function updateWebsiteMilestone(milestoneId: string, updates: Partial<WebsiteMilestone>) {
  const { data, error } = await supabase
    .from('website_milestones')
    .update(updates)
    .eq('id', milestoneId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete milestone
export async function deleteWebsiteMilestone(milestoneId: string) {
  const { error } = await supabase
    .from('website_milestones')
    .delete()
    .eq('id', milestoneId);

  if (error) throw error;
}
// Get ALL website projects (for Super Admin)
export async function getAllWebsiteProjects() {
  const { data, error } = await supabase
    .from('website_projects')
    .select(`
      *,
      company:companies(id, name),
      milestones:website_milestones(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all website projects:', error);
    throw error;
  }
  
  return data;
}

// Update project and milestones (for Super Admin)
export async function updateWebsiteProjectWithMilestones(
  projectId: string, 
  projectData: Partial<WebsiteProject>,
  milestones: Partial<WebsiteMilestone>[]
) {
  // Update project
  const { data: project, error: projectError } = await supabase
    .from('website_projects')
    .update(projectData)
    .eq('id', projectId)
    .select()
    .single();

  if (projectError) {
    console.error('Error updating website project:', projectError);
    throw projectError;
  }

  // Delete old milestones
  await supabase
    .from('website_milestones')
    .delete()
    .eq('project_id', projectId);

  // Insert new milestones
  if (milestones.length > 0) {
    const { error: milestonesError } = await supabase
      .from('website_milestones')
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