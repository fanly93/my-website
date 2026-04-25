from pydantic import BaseModel


class LLMConfigRequest(BaseModel):
    provider: str  # deepseek | dashscope | openai
    api_key: str | None = None  # None or empty = keep existing key
    base_url: str | None = None
    model: str


class LLMConfigResponse(BaseModel):
    provider: str
    api_key_hint: str  # e.g. "****1234"
    base_url: str
    model: str
    custom_models: list[str] = []

    model_config = {"from_attributes": True}
