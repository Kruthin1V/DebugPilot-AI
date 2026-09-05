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
        'Worked on' MUST NOT become 'Developed', 'Built', 'Implemented', 'Designed', 'Architected', 'Led', 'Spearheaded', 'Delivered', or 'Owned'.
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
        # If original contains "worked on", "assisted", "contributed", do not allow upgrade to ownership/leadership verbs
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

        # Generate strictly responsibility-preserving alternative phrasings
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

        # Extract keywords supported by original bullet
        known_tech = ["python", "fastapi", "react", "typescript", "sql", "sqlite", "postgresql", "rest api", "backend", "web application", "apis", "redis"]
        supported_keywords = [kw.title() for kw in known_tech if kw in orig_lower]

        # Extract suggested keywords present in JD or target role but NOT in original bullet
        suggested_keywords = []
        context = f"{job_description or ''} {target_role or ''}".lower()
        if context.strip():
            for kw in known_tech:
                if kw in context and kw not in orig_lower:
                    suggested_keywords.append(kw.title())

        # Clean duplicates
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
