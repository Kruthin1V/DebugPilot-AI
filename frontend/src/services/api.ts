import axios from 'axios';

const API_BASE_URL = '/api';

export interface HealthStatus {
  status: string;
  app: string;
  version: string;
  environment: string;
  timestamp: string;
}

export interface ResumeUploadResult {
  filename: string;
  file_size_bytes: number;
  extracted_text: string;
  page_count: number;
}

export interface AnalysisResult {
  ats_score: number;
  job_match_score: number;
  matching_skills: string[];
  missing_skills: string[];
  important_keywords: string[];
  resume_strengths: string[];
  resume_weaknesses: string[];
  improvement_suggestions: string[];
  potential_issues: string[];
  recommended_changes: string[];
}

export interface ImproveBulletResult {
  original_bullet: string;
  improved_bullet: string;
  alternatives: string[];
  improvements_made: string[];
  supported_keywords: string[];
  suggested_keywords: string[];
  warnings: string[];
}

export interface InterviewQuestionItem {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  why_this_is_asked: string;
  expected_topics: string[];
  hint: string;
  sample_answer: string;
  follow_up_question: string;
  is_general: boolean;
}

export interface InterviewQuestionsResult {
  questions: InterviewQuestionItem[];
}

export const checkBackendHealth = async (): Promise<HealthStatus> => {
  const response = await axios.get<HealthStatus>(`${API_BASE_URL}/health`);
  return response.data;
};

export const uploadResumePDF = async (file: File): Promise<ResumeUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post<ResumeUploadResult>(`${API_BASE_URL}/resume/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const analyzeResumeAndJob = async (resumeText: string, jobDescription: string): Promise<AnalysisResult> => {
  const response = await axios.post<AnalysisResult>(`${API_BASE_URL}/analyze`, {
    resume_text: resumeText,
    job_description: jobDescription,
  });
  return response.data;
};

export const improveResumeBullet = async (
  bulletPoint: string,
  jobDescription?: string,
  targetRole?: string
): Promise<ImproveBulletResult> => {
  const response = await axios.post<ImproveBulletResult>(`${API_BASE_URL}/resume/improve`, {
    bullet_point: bulletPoint,
    job_description: jobDescription || undefined,
    target_role: targetRole || undefined,
  });
  return response.data;
};

export const generateInterviewQuestions = async (
  resumeText: string,
  jobDescription: string,
  targetRole?: string,
  difficulty?: string,
  numberOfQuestions?: number,
  questionCategories?: string[]
): Promise<InterviewQuestionsResult> => {
  const response = await axios.post<InterviewQuestionsResult>(`${API_BASE_URL}/interview/questions`, {
    resume_text: resumeText,
    job_description: jobDescription,
    target_role: targetRole || undefined,
    difficulty: difficulty || undefined,
    number_of_questions: numberOfQuestions || undefined,
    question_categories: questionCategories || undefined,
  });
  return response.data;
};
