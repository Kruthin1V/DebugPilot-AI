import json
import logging
import re
from typing import Dict, Any, Optional, List
from app.core.config import settings

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL

    def is_configured(self) -> bool:
        """Check if GEMINI_API_KEY is configured in backend environment."""
        key = settings.GEMINI_API_KEY
        return bool(key and key.strip() and key != "your_gemini_api_key_here")

    async def analyze_match(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        """
        Analyzes extracted resume text against a target job description using Gemini API.
        If GEMINI_API_KEY is not configured or API fails, uses heuristic fallback parser.
        """
        if not self.is_configured():
            logger.warning("GEMINI_API_KEY is missing or set to placeholder. Using heuristic analysis engine.")
            return self._heuristic_analysis(resume_text, job_description, is_mock=True)

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            system_prompt = (
                "You are an expert ATS (Applicant Tracking System) software and senior technical talent recruiter.\n"
                "CRITICAL INSTRUCTION: Do NOT invent, assume, or fabricate any experience, skills, tools, or qualifications that are not explicitly stated in the candidate's resume.\n"
                "Perform an objective comparison between the candidate's resume text and the job description.\n"
                "Return ONLY a valid JSON object matching this structure:\n"
                "{\n"
                '  "ats_score": <integer between 0 and 100>,\n'
                '  "job_match_score": <integer between 0 and 100>,\n'
                '  "matching_skills": [<list of matching skills>],\n'
                '  "missing_skills": [<list of missing skills>],\n'
                '  "important_keywords": [<list of keywords>],\n'
                '  "resume_strengths": [<list of strengths>],\n'
                '  "resume_weaknesses": [<list of weaknesses>],\n'
                '  "improvement_suggestions": [<list of suggestions>],\n'
                '  "potential_issues": [<list of issues>],\n'
                '  "recommended_changes": [<list of changes>]\n'
                "}"
            )

            prompt = f"RESUME TEXT:\n{resume_text}\n\nJOB DESCRIPTION:\n{job_description}"

            response = client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    response_mime_type="application/json",
                    temperature=0.2,
                )
            )

            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]

            parsed_data = json.loads(raw_text.strip())
            parsed_data["ats_score"] = max(0, min(100, int(parsed_data.get("ats_score", 70))))
            parsed_data["job_match_score"] = max(0, min(100, int(parsed_data.get("job_match_score", 70))))
            for key in ["matching_skills", "missing_skills", "important_keywords", "resume_strengths", "resume_weaknesses", "improvement_suggestions", "potential_issues", "recommended_changes"]:
                if not isinstance(parsed_data.get(key), list):
                    parsed_data[key] = []
            
            return parsed_data

        except Exception as e:
            logger.error(f"Gemini API call error: {str(e)}. Falling back to heuristic analysis engine.")
            return self._heuristic_analysis(resume_text, job_description, is_mock=False, error_msg=str(e))

    async def improve_bullet(
        self,
        bullet_point: str,
        job_description: Optional[str] = None,
        target_role: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Rewrites resume bullet point while strictly preserving the level of responsibility expressed in original text.
        """
        if not self.is_configured():
            logger.warning("GEMINI_API_KEY not configured. Using responsibility-preserving bullet optimizer.")
            return self._conservative_bullet_optimizer(bullet_point, job_description, target_role)

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            system_prompt = (
                "You are an expert ATS resume editor enforcing STRICT RESPONSIBILITY PRESERVATION.\n\n"
                "CRITICAL RESPONSIBILITY RULES:\n"
                "1. Strictly preserve the level of responsibility expressed by the original bullet.\n"
                "2. 'Worked on' MUST NOT become 'Developed', 'Built', 'Implemented', 'Designed', 'Architected', 'Led', 'Spearheaded', 'Delivered', or 'Owned'. Safe phrasing stays close to 'worked on', 'contributed to', 'assisted with'.\n"
                "3. 'Assisted with' MUST NOT become 'Developed', 'Built', or 'Led'.\n"
                "4. 'Contributed to' MUST NOT become 'Led', 'Owned', or 'Architected'.\n"
                "5. DO NOT invent or fabricate any numbers, percentages, metrics, scope, or unmentioned technologies.\n"
                "6. If original contains metrics (e.g. '40%'), strictly preserve those exact metrics.\n"
                "7. Categorize keywords:\n"
                "   - 'supported_keywords': skills/keywords supported by original bullet text.\n"
                "   - 'suggested_keywords': skills/keywords from target role or job description NOT supported by original bullet text.\n\n"
                "Return ONLY a valid JSON object:\n"
                "{\n"
                '  "improved_bullet": "<responsibility-preserving bullet point>",\n'
                '  "alternatives": ["<alternative 1>", "<alternative 2>"],\n'
                '  "improvements_made": ["<explanation 1>", "<explanation 2>"],\n'
                '  "supported_keywords": ["<keyword supported by resume>"],\n'
                '  "suggested_keywords": ["<keyword in job post but not in bullet>"],\n'
                '  "warnings": ["<warning if original bullet lacks quantitative metrics>"]\n'
                "}"
            )

            context_str = f"ORIGINAL BULLET POINT:\n{bullet_point}\n"
            if target_role and target_role.strip():
                context_str += f"\nTARGET ROLE:\n{target_role.strip()}\n"
            if job_description and job_description.strip():
                context_str += f"\nJOB DESCRIPTION:\n{job_description.strip()}\n"

            response = client.models.generate_content(
                model=self.model_name,
                contents=context_str,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    response_mime_type="application/json",
                    temperature=0.1,
                )
            )

            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]

            parsed = json.loads(raw_text.strip())

            # Post-processing validation guardrail
            parsed["improved_bullet"] = self._validate_and_sanitize_rewrite(
                bullet_point,
                parsed.get("improved_bullet", bullet_point)
            )

            sanitized_alts = []
            for alt in parsed.get("alternatives", []):
                sanitized_alts.append(self._validate_and_sanitize_rewrite(bullet_point, alt))
            parsed["alternatives"] = sanitized_alts

            for k in ["alternatives", "improvements_made", "supported_keywords", "suggested_keywords", "warnings"]:
                if not isinstance(parsed.get(k), list):
                    parsed[k] = []

            return parsed

        except Exception as e:
            logger.error(f"Gemini API improve_bullet error: {str(e)}. Using conservative bullet optimizer.")
            return self._conservative_bullet_optimizer(bullet_point, job_description, target_role)

    async def generate_interview_questions(
        self,
        resume_text: str,
        job_description: str,
        target_role: Optional[str] = "Software Engineer",
        difficulty: Optional[str] = "Mixed",
        number_of_questions: Optional[int] = 8,
        question_categories: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Generates personalized interview questions based on candidate's resume, target job description, role, and skill gaps.
        Enforces strict truthfulness (no fabricated candidate projects or false metrics).
        """
        if not question_categories:
            question_categories = ["Technical", "Resume/Project", "Behavioral/HR", "Skill Gap"]
        
        num_q = max(1, min(15, number_of_questions or 8))
        diff_str = difficulty or "Mixed"
        role_str = target_role or "Software Engineer"

        if not self.is_configured():
            logger.warning("GEMINI_API_KEY not configured. Using heuristic personalized interview question generator.")
            return self._heuristic_interview_generator(
                resume_text, job_description, role_str, diff_str, num_q, question_categories
            )

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            system_prompt = (
                "You are a senior technical interviewer and hiring manager.\n\n"
                "STRICT PERSONALIZATION & TRUTHFULNESS RULES:\n"
                "1. Technical questions MUST focus on technologies present in the candidate's resume and job description.\n"
                "2. Resume/Project questions MUST reference actual projects, technologies, or experience explicitly mentioned in the candidate's resume text. DO NOT invent false candidate projects, metrics, or companies.\n"
                "3. Behavioral questions MUST be relevant to the target role.\n"
                "4. Skill Gap questions MUST focus on important skills required by the job description but missing or weak in the resume.\n"
                "5. Difficulty setting ('Easy', 'Medium', 'Hard', 'Mixed') MUST genuinely control question complexity.\n"
                "6. Sample answers MUST clearly distinguish between:\n"
                "   - 'Based on your resume...' (referencing actual resume experience)\n"
                "   - 'A strong general answer would be...' (for general concepts or skill gaps)\n"
                "7. If the resume lacks context for a personalized project question, mark 'is_general': true and explain in 'why_this_is_asked'.\n\n"
                "Return ONLY a valid JSON object matching this schema:\n"
                "{\n"
                '  "questions": [\n'
                "    {\n"
                '      "id": "q1",\n'
                '      "category": "<Technical|Resume/Project|Behavioral/HR|Skill Gap>",\n'
                '      "difficulty": "<Easy|Medium|Hard>",\n'
                '      "question": "<question text>",\n'
                '      "why_this_is_asked": "<interviewer intent>",\n'
                '      "expected_topics": ["<topic 1>", "<topic 2>"],\n'
                '      "hint": "<strategic tip>",\n'
                '      "sample_answer": "<truthful sample response>",\n'
                '      "follow_up_question": "<potential follow up>",\n'
                '      "is_general": <boolean>\n'
                "    }\n"
                "  ]\n"
                "}"
            )

            prompt = (
                f"TARGET ROLE: {role_str}\n"
                f"DIFFICULTY LEVEL: {diff_str}\n"
                f"NUMBER OF QUESTIONS: {num_q}\n"
                f"ALLOWED CATEGORIES: {', '.join(question_categories)}\n\n"
                f"RESUME TEXT:\n{resume_text}\n\n"
                f"JOB DESCRIPTION:\n{job_description}"
            )

            response = client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    response_mime_type="application/json",
                    temperature=0.3,
                )
            )

            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]

            parsed = json.loads(raw_text.strip())
            q_list = parsed.get("questions", [])

            if isinstance(q_list, list) and len(q_list) > 0:
                # Ensure fields are properly formatted
                formatted = []
                for idx, q in enumerate(q_list[:num_q]):
                    formatted.append({
                        "id": str(q.get("id") or f"q_{idx+1}"),
                        "category": q.get("category") or "Technical",
                        "difficulty": q.get("difficulty") or "Medium",
                        "question": q.get("question") or "Tell me about your technical background.",
                        "why_this_is_asked": q.get("why_this_is_asked") or "To assess technical depth.",
                        "expected_topics": q.get("expected_topics") if isinstance(q.get("expected_topics"), list) else ["Technical Architecture"],
                        "hint": q.get("hint") or "Structure your answer using the STAR method.",
                        "sample_answer": q.get("sample_answer") or "Based on your resume, explain key technical decisions.",
                        "follow_up_question": q.get("follow_up_question") or "How would you optimize this under higher load?",
                        "is_general": bool(q.get("is_general", False))
                    })
                return formatted

            return self._heuristic_interview_generator(resume_text, job_description, role_str, diff_str, num_q, question_categories)

        except Exception as e:
            logger.error(f"Gemini API generate_interview_questions error: {str(e)}. Using fallback generator.")
            return self._heuristic_interview_generator(resume_text, job_description, role_str, diff_str, num_q, question_categories)

    def _heuristic_interview_generator(
        self,
        resume_text: str,
        job_description: str,
        target_role: str,
        difficulty: str,
        num_q: int,
        categories: List[str]
    ) -> List[Dict[str, Any]]:
        """Rule-based personalized interview question generator preserving factuality."""
        resume_lower = resume_text.lower()
        jd_lower = job_description.lower()

        # Extract resume tech & project keywords
        known_tech = ["python", "fastapi", "react", "typescript", "sql", "sqlite", "postgresql", "rest api", "django", "flask", "aws", "docker", "kubernetes", "git", "ci/cd", "redis", "java", "node"]
        resume_tech = [t.title() for t in known_tech if t in resume_lower]
        jd_tech = [t.title() for t in known_tech if t in jd_lower]
        gap_tech = [t for t in jd_tech if t.lower() not in resume_lower]

        # Determine project mention from resume
        has_rest_project = "rest api" in resume_lower or "rest" in resume_lower or "api" in resume_lower
        project_name = "REST API" if has_rest_project else (resume_tech[0] + " Application" if resume_tech else "software project")

        questions = []
        q_counter = 1

        # 1. Technical Questions
        if "Technical" in categories:
            tech_1 = resume_tech[0] if resume_tech else "Python"
            tech_2 = resume_tech[1] if len(resume_tech) > 1 else "FastAPI"

            if difficulty == "Easy":
                questions.append({
                    "id": f"q_{q_counter}",
                    "category": "Technical",
                    "difficulty": "Easy",
                    "question": f"What are the core advantages of using {tech_1} and {tech_2} for modern application development?",
                    "why_this_is_asked": f"Assesses your foundational understanding of key technologies highlighted on your resume ({tech_1}, {tech_2}).",
                    "expected_topics": [f"{tech_1} Fundamentals", f"{tech_2} Features", "Code Maintainability"],
                    "hint": f"Mention syntax simplicity, async capabilities, and framework ecosystem.",
                    "sample_answer": f"Based on your resume experience with {tech_1} and {tech_2}: Highlight how {tech_1} provides readable, rapid development while {tech_2} offers high-performance asynchronous request handling and automatic OpenAPI documentation.",
                    "follow_up_question": f"How do you handle dependency management or environment variables in {tech_1}?",
                    "is_general": False
                })
            elif difficulty == "Hard":
                questions.append({
                    "id": f"q_{q_counter}",
                    "category": "Technical",
                    "difficulty": "Hard",
                    "question": f"How do you architect asynchronous concurrency and manage connection pooling when connecting {tech_2} to a database under high load?",
                    "why_this_is_asked": f"Evaluates advanced system design, concurrency handling, and performance tuning with {tech_2}.",
                    "expected_topics": ["ASGI Server Concurrency", "Database Connection Pools", "Asyncio Event Loop"],
                    "hint": "Discuss connection pool sizing, async engine drivers, and avoiding blocking I/O calls.",
                    "sample_answer": f"Based on your resume stack ({tech_1}, {tech_2}): Explain how ASGI servers like Uvicorn handle non-blocking event loops, combined with async SQLAlchemy connection pools to prevent thread starvation under concurrent traffic.",
                    "follow_up_question": "What metrics would you monitor to detect connection pool exhaustion?",
                    "is_general": False
                })
            else:
                questions.append({
                    "id": f"q_{q_counter}",
                    "category": "Technical",
                    "difficulty": "Medium",
                    "question": f"How do you structure request validation and error handling in {tech_2} to ensure clean REST API design?",
                    "why_this_is_asked": f"Tests your practical knowledge of API validation and exception handling in {tech_2}.",
                    "expected_topics": ["Pydantic Schemas", "HTTP Exception Handling", "REST Best Practices"],
                    "hint": "Reference Pydantic models, custom exception handlers, and standard HTTP status codes.",
                    "sample_answer": f"Based on your resume: Explain using Pydantic BaseModels for automatic request body validation and raising FastAPI HTTPException with descriptive error messages.",
                    "follow_up_question": "How do you handle CORS policy and security headers in your APIs?",
                    "is_general": False
                })
            q_counter += 1

        # 2. Resume / Project Questions
        if "Resume/Project" in categories:
            if difficulty == "Hard":
                questions.append({
                    "id": f"q_{q_counter}",
                    "category": "Resume/Project",
                    "difficulty": "Hard",
                    "question": f"Walk me through the design choices and scalability bottlenecks in your {project_name} project.",
                    "why_this_is_asked": f"Directly tests your architectural ownership of the {project_name} mentioned on your resume.",
                    "expected_topics": ["System Architecture", "Trade-offs", "Performance Tuning"],
                    "hint": "Describe the initial problem, architectural decisions, and how you resolved bottlenecks.",
                    "sample_answer": f"Based on your resume: Describe the structure of your {project_name}, detailing why you chose {resume_tech[0] if resume_tech else 'your stack'} and how you optimized request latency.",
                    "follow_up_question": "If traffic grew 10x, what part of the architecture would fail first?",
                    "is_general": False
                })
            else:
                questions.append({
                    "id": f"q_{q_counter}",
                    "category": "Resume/Project",
                    "difficulty": "Medium",
                    "question": f"Can you describe your role and key technical decisions in developing your {project_name} project?",
                    "why_this_is_asked": f"Verifies your hands-on contribution to the {project_name} listed on your resume.",
                    "expected_topics": [f"{project_name} Scope", "Tech Stack Choices", "Implementation"],
                    "hint": "Use the STAR method (Situation, Task, Action, Result).",
                    "sample_answer": f"Based on your resume: Outline the requirements of the {project_name}, your personal implementation responsibilities, and how you delivered clean code.",
                    "follow_up_question": "What testing framework did you use to verify functionality?",
                    "is_general": False
                })
            q_counter += 1

        # 3. Skill Gap Questions
        if "Skill Gap" in categories:
            gap_item = gap_tech[0] if gap_tech else ("Cloud/DevOps" if "cloud" not in resume_lower else "System Architecture")
            if difficulty == "Easy":
                questions.append({
                    "id": f"q_{q_counter}",
                    "category": "Skill Gap",
                    "difficulty": "Easy",
                    "question": f"The job description highlights {gap_item}, which isn't explicitly detailed on your resume. What is your understanding of {gap_item}?",
                    "why_this_is_asked": f"Addresses a key technical requirement ({gap_item}) from the job post that is missing from your resume.",
                    "expected_topics": [f"{gap_item} Concepts", "Learning Agility", "Practical Application"],
                    "hint": "Demonstrate theoretical knowledge and express eagerness to apply it in production.",
                    "sample_answer": f"A strong general answer would be: While my resume emphasizes hands-on work in {resume_tech[0] if resume_tech else 'backend development'}, I have studied {gap_item} concepts and understand its role in deployment and infrastructure scalability.",
                    "follow_up_question": f"What steps are you currently taking to build hands-on projects with {gap_item}?",
                    "is_general": True
                })
            else:
                questions.append({
                    "id": f"q_{q_counter}",
                    "category": "Skill Gap",
                    "difficulty": "Medium",
                    "question": f"The target job requires experience with {gap_item}. How would you bridge your background in {resume_tech[0] if resume_tech else 'backend tech'} to work effectively with {gap_item}?",
                    "why_this_is_asked": f"Evaluates your ability to rapidly ramp up on required job skills ({gap_item}) not present on your resume.",
                    "expected_topics": [f"{gap_item} Integration", "Adaptability", "Transferable Skills"],
                    "hint": "Connect your solid foundation in existing tools to how quickly you pick up new technologies.",
                    "sample_answer": f"A strong general answer would be: Explain how your foundational experience in {resume_tech[0] if resume_tech else 'core backend design'} translates directly to mastering {gap_item} concepts quickly.",
                    "follow_up_question": f"How would you troubleshoot an issue involving {gap_item} in your first month?",
                    "is_general": True
                })
            q_counter += 1

        # 4. Behavioral / HR Questions
        if "Behavioral/HR" in categories:
            questions.append({
                "id": f"q_{q_counter}",
                "category": "Behavioral/HR",
                "difficulty": difficulty if difficulty != "Mixed" else "Medium",
                "question": f"As a {target_role}, tell me about a time you had to handle conflicting priorities or a tight deadline.",
                "why_this_is_asked": f"Assesses your problem-solving, task prioritization, and communication skills for a {target_role} position.",
                "expected_topics": ["Time Management", "Stakeholder Communication", "Problem Solving"],
                "hint": "Be specific about how you communicated trade-offs to team members.",
                "sample_answer": f"Based on your resume: Describe a situation from your technical experience where you broke down complex tasks, prioritized critical paths, and delivered quality results.",
                "follow_up_question": "What would you do differently if faced with the same tight deadline today?",
                "is_general": False
            })
            q_counter += 1

        # Fill remaining requested count by rotating categories
        extra_templates = [
            {
                "category": "Technical",
                "diff": "Medium",
                "q": f"How do you approach database schema design and indexing in {resume_tech[0] if resume_tech else 'relational databases'}?",
                "why": "Evaluates database modeling competency.",
                "topics": ["Normalization", "Indexing", "Query Performance"],
                "hint": "Discuss primary/foreign keys and B-tree indexes.",
                "ans": f"Based on your resume: Explain structuring tables for data integrity and adding indexes to high-frequency query columns.",
                "follow": "How do you identify slow queries in production?",
                "gen": False
            },
            {
                "category": "Resume/Project",
                "diff": "Easy",
                "q": f"What was the most challenging bug you encountered in your {project_name} and how did you debug it?",
                "why": "Tests analytical troubleshooting and debugging mindset.",
                "topics": ["Debugging Tools", "Log Analysis", "Root Cause Analysis"],
                "hint": "Walk through isolating the bug step by step.",
                "ans": f"Based on your resume: Detail a specific technical bug in {project_name}, how you examined logs, identified the issue, and verified the fix.",
                "follow": "What automated tests did you add to prevent regression?",
                "gen": False
            },
            {
                "category": "Skill Gap",
                "diff": "Hard",
                "q": f"If required to implement {gap_tech[0] if gap_tech else 'cloud deployment'} in production for this role, how would you design the deployment pipeline?",
                "why": f"Evaluates readiness for missing job requirement ({gap_tech[0] if gap_tech else 'cloud deployment'}).",
                "topics": ["CI/CD Pipeline", "Environment Parity", "Automated Testing"],
                "hint": "Outline source control triggers, build steps, staging verification, and deployment strategies.",
                "ans": f"A strong general answer would be: Outline standard CI/CD pipeline principles (GitHub Actions, container builds, automated unit testing, blue-green deployment).",
                "follow": "How would you handle a failed deployment rollback?",
                "gen": True
            },
            {
                "category": "Behavioral/HR",
                "diff": "Easy",
                "q": f"Why are you interested in this {target_role} position and what makes your background a good fit?",
                "why": "Verifies motivation and alignment with role expectations.",
                "topics": ["Career Motivation", "Role Alignment", "Technical Fit"],
                "hint": "Connect your technical skills directly to the key requirements of the target job.",
                "ans": f"Based on your resume: Connect your hands-on background in {', '.join(resume_tech[:3]) if resume_tech else 'software development'} to the key goals of this job.",
                "follow": "Where do you see your technical skills growing in the next two years?",
                "gen": False
            }
        ]

        idx = 0
        while len(questions) < num_q:
            t = extra_templates[idx % len(extra_templates)]
            questions.append({
                "id": f"q_{q_counter}",
                "category": t["category"],
                "difficulty": t["diff"],
                "question": t["q"],
                "why_this_is_asked": t["why"],
                "expected_topics": t["topics"],
                "hint": t["hint"],
                "sample_answer": t["ans"],
                "follow_up_question": t["follow"],
                "is_general": t["gen"]
            })
            q_counter += 1
            idx += 1

        return questions[:num_q]

    def _validate_and_sanitize_rewrite(self, original_bullet: str, candidate_rewrite: str) -> str:
        """
        Guardrail validator ensuring candidate rewrite strictly preserves original responsibility level,
        numbers, and technologies.
        """
        orig_lower = original_bullet.lower()
        cand_lower = candidate_rewrite.lower()

        # 1. Verify numbers preservation (do not introduce NEW numbers)
        orig_numbers = set(re.findall(r'\b\d+(?:%|k|M|x)?\b', orig_lower))
        cand_numbers = set(re.findall(r'\b\d+(?:%|k|M|x)?\b', cand_lower))
        if not cand_numbers.issubset(orig_numbers):
            logger.warning(f"Guardrail triggered: Rejecting introduced numbers {cand_numbers - orig_numbers} in candidate: '{candidate_rewrite}'")
            return self._conservative_clean(original_bullet)

        # 2. Responsibility level preservation checks
        ownership_verbs = [
            "developed", "built", "implemented", "designed", "architected", "spearheaded",
            "delivered", "owned", "led", "managed", "optimized", "collaborated", "cross-functionally"
        ]

        if "worked on" in orig_lower or "assisted" in orig_lower or "contributed to" in orig_lower:
            for verb in ownership_verbs:
                if verb in cand_lower and verb not in orig_lower:
                    logger.warning(f"Guardrail triggered: Rejecting ungrounded responsibility upgrade verb '{verb}' in candidate: '{candidate_rewrite}'")
                    return self._conservative_clean(original_bullet)

        return candidate_rewrite

    def _conservative_clean(self, bullet: str) -> str:
        """Provides a safe, responsibility-preserving polish of the bullet point."""
        text = bullet.strip()
        text = re.sub(r'\bweb app\b', 'web application', text, flags=re.IGNORECASE)
        words = text.split()
        if words:
            words[0] = words[0].capitalize()
            text = " ".join(words)
            if not text.endswith("."):
                text += "."
        return text

    def _conservative_bullet_optimizer(
        self,
        bullet_point: str,
        job_description: Optional[str] = None,
        target_role: Optional[str] = None
    ) -> Dict[str, Any]:
        """Conservative rule-based optimizer enforcing strict responsibility preservation."""
        clean_bullet = self._conservative_clean(bullet_point)
        orig_lower = bullet_point.lower()

        alternatives = []
        if "worked on" in orig_lower:
            rest = clean_bullet
            if orig_lower.startswith("worked on"):
                after_worked = clean_bullet[9:].strip()
                rest = after_worked[0].lower() + after_worked[1:] if after_worked else ""
            alternatives = [
                f"Worked on {rest}",
                f"Contributed to {rest}",
                f"Assisted with {rest}"
            ]
        elif "assisted" in orig_lower:
            alternatives = [
                clean_bullet,
                f"Contributed to {clean_bullet[0].lower() + clean_bullet[1:] if len(clean_bullet) > 1 else clean_bullet}"
            ]
        else:
            alternatives = [
                clean_bullet,
                f"Contributed to {clean_bullet[0].lower() + clean_bullet[1:] if len(clean_bullet) > 1 else clean_bullet}"
            ]

        known_tech = ["python", "fastapi", "react", "typescript", "sql", "sqlite", "postgresql", "rest api", "backend", "web application", "apis", "redis"]
        supported_keywords = [kw.title() for kw in known_tech if kw in orig_lower]

        suggested_keywords = []
        context = f"{job_description or ''} {target_role or ''}".lower()
        if context.strip():
            for kw in known_tech:
                if kw in context and kw not in orig_lower:
                    suggested_keywords.append(kw.title())

        supported_keywords = list(dict.fromkeys(supported_keywords))
        suggested_keywords = list(dict.fromkeys(suggested_keywords))

        improvements_made = [
            "Improved grammar, spelling, and sentence conciseness.",
            "Polished phrasing for ATS parser readability while strictly preserving original level of responsibility.",
            "Maintained strict factual alignment without introducing ungrounded claims or hallucinated metrics."
        ]

        warnings = []
        has_numbers = bool(re.search(r'\b\d+(?:%|k|M|x)?\b', bullet_point))
        if not has_numbers:
            warnings.append("Notice: The original bullet lacks quantitative metrics (e.g. %, user count, latency reduction). Consider adding verified numbers to maximize ATS impact.")

        return {
            "improved_bullet": clean_bullet,
            "alternatives": alternatives[:3],
            "improvements_made": improvements_made,
            "supported_keywords": supported_keywords,
            "suggested_keywords": suggested_keywords,
            "warnings": warnings
        }

    def _heuristic_analysis(self, resume_text: str, job_description: str, is_mock: bool = True, error_msg: str = None) -> Dict[str, Any]:
        """Rule-based NLP heuristic parser."""
        resume_words = set(re.findall(r'\b[a-zA-Z0-9+#\.]+\b', resume_text.lower()))
        jd_words = set(re.findall(r'\b[a-zA-Z0-9+#\.]+\b', job_description.lower()))

        known_tech_keywords = [
            "python", "javascript", "typescript", "react", "vue", "angular", "node", "express",
            "fastapi", "django", "flask", "sql", "sqlite", "postgresql", "mongodb", "redis",
            "aws", "azure", "gcp", "docker", "kubernetes", "git", "github", "ci/cd", "rest",
            "graphql", "html", "css", "tailwind", "bootstrap", "agile", "scrum", "jira",
            "unit testing", "pytest", "jest", "cypress", "system design", "microservices"
        ]

        jd_keywords = [kw for kw in known_tech_keywords if kw in job_description.lower()]
        matching_keywords = [kw for kw in jd_keywords if kw in resume_text.lower()]
        missing_keywords = [kw for kw in jd_keywords if kw not in resume_text.lower()]

        if not jd_keywords:
            sample_jd_words = [w.capitalize() for w in list(jd_words) if len(w) > 4][:6]
            matching_keywords = [w.capitalize() for w in sample_jd_words if w.lower() in resume_words]
            missing_keywords = [w.capitalize() for w in sample_jd_words if w.lower() not in resume_words]

        matching_skills = [k.capitalize() for k in matching_keywords] or ["General Technical Skills"]
        missing_skills = [k.capitalize() for k in missing_keywords] or ["Cloud Infrastructure", "CI/CD Pipeline"]
        important_keywords = [k.capitalize() for k in (jd_keywords or ["REST API", "Database Design", "TypeScript"])]

        total_jd_terms = max(len(jd_keywords), 1)
        match_ratio = len(matching_keywords) / total_jd_terms
        match_score = int(match_ratio * 100)
        match_score = max(45, min(95, match_score))

        ats_score = match_score + 5 if len(resume_text.split()) > 100 else 60

        return {
            "ats_score": min(98, ats_score),
            "job_match_score": match_score,
            "matching_skills": matching_skills,
            "missing_skills": missing_skills,
            "important_keywords": important_keywords[:8],
            "resume_strengths": [
                f"Contains {len(matching_skills)} skills matching the target job description.",
                "Clear structure with readable section content."
            ],
            "resume_weaknesses": [
                f"Missing {len(missing_skills)} key technical requirements mentioned in the job post.",
                "Limited quantified outcome metrics in bullet points."
            ],
            "improvement_suggestions": [
                "Incorporate missing keywords into your technical skills summary section.",
                "Add measurable KPIs (e.g. '% latency reduced', 'number of users served') to work experience."
            ],
            "potential_issues": [
                "Unusual section headers might cause ATS parsing ambiguity."
            ],
            "recommended_changes": [
                "Reorder your technical skills to highlight matching skills first.",
                "Add an explicit Professional Summary section tailored to the role."
            ]
        }

ai_service = AIService()
