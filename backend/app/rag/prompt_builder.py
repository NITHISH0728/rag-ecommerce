import os
from typing import Dict, Any
from backend.app.core.config import settings

class PromptBuilder:
    def __init__(self, prompt_dir: str = "./backend/prompts"):
        self.prompt_dir = prompt_dir

    def _read_prompt_file(self, filename: str) -> str:
        candidates = [
            os.path.join(self.prompt_dir, filename),
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "prompts", filename),
            os.path.join("./backend/prompts", filename),
            os.path.join("./prompts", filename),
            os.path.join("..", "prompts", filename)
        ]
        
        for path in candidates:
            if os.path.exists(path):
                with open(path, "r", encoding="utf-8") as f:
                    return f.read()
                    
        raise FileNotFoundError(f"Prompt file not found: {filename}")


    def build_system_prompt(self) -> str:
        return self._read_prompt_file("shopping_assistant_system.txt")

    def build_user_prompt(
        self,
        user_question: str,
        intent: str,
        applied_filters: str,
        retrieved_context: str,
        conversation_context: str,
        maximum_recommendations: int = 5
    ) -> str:
        template = self._read_prompt_file("shopping_assistant_user.txt")
        return template.format(
            user_question=user_question,
            intent=intent,
            applied_filters=applied_filters,
            retrieved_context=retrieved_context,
            conversation_context=conversation_context,
            maximum_recommendations=maximum_recommendations
        )

    def build_query_analysis_prompt(self, user_message: str) -> str:
        template = self._read_prompt_file("query_analysis.txt")
        return f"{template}\n\nUser Message: {user_message}"
