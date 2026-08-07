import pytest
from backend.app.rag.prompt_builder import PromptBuilder

def test_prompt_builder_load_system():
    # Attempt to build prompt, which should resolve file path
    pb = PromptBuilder()
    sys_prompt = pb.build_system_prompt()
    assert "ShopSmart AI" in sys_prompt
    assert "STRICT GROUNDING RULES" in sys_prompt

def test_prompt_builder_user_interpolation():
    pb = PromptBuilder()
    user_prompt = pb.build_user_prompt(
        user_question="I need a laptop",
        intent="product_recommendation",
        applied_filters='{"category": "Laptops"}',
        retrieved_context="Context text",
        conversation_context="History text",
        maximum_recommendations=3
    )
    assert "I need a laptop" in user_prompt
    assert "Context text" in user_prompt
    assert "History text" in user_prompt
    assert "3" in user_prompt
