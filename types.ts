
export enum Framework {
  QBCORE = 'QBCore',
  ESX = 'ESX',
  VRP = 'vRP',
  VRPEX = 'vRPex',
  CREATIVE = 'Creative',
  STANDALONE = 'Standalone'
}

export enum ResourceType {
  PLUGIN = 'Plugin',
  BASE = 'Full Server Base',
  UI = 'NUI Resource',
  UTILITY = 'Utility Script'
}

export interface FiveMFile {
  path: string;
  name: string;
  content: string;
  language: 'lua' | 'javascript' | 'html' | 'css' | 'sql' | 'json';
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
}

export interface GeneratedResource {
  name: string;
  description: string;
  structure: string; 
  files: FiveMFile[];
  instructions: string;
  recommendations?: Recommendation[];
}

export interface GenerationState {
  loading: boolean;
  error: string | null;
  result: GeneratedResource | null;
  isImported?: boolean;
}

export interface RepoTemplate {
  id: string;
  name: string;
  owner: string;
  repo: string;
  framework: Framework;
  description: string;
}
