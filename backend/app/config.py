from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./app.db"
    jwt_secret: str = "dev-secret-change-in-production"
    jwt_access_expire_minutes: int = 15
    jwt_refresh_expire_days: int = 7

    # LLM provider selection
    default_provider: str = "deepseek"  # deepseek | dashscope | openai
    default_model: str = "deepseek-chat"

    # DeepSeek
    deepseek_api_key: str = ""
    deepseek_base_url: str = "https://api.deepseek.com/v1"

    # DashScope (Alibaba)
    dashscope_api_key: str = ""
    dashscope_base_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"

    # OpenAI
    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # ignore extra env vars (tavily, openweather, etc.)
    )

    def get_llm_credentials(self) -> tuple[str, str, str]:
        """Return (api_key, base_url, model) for the active provider."""
        provider = self.default_provider.lower()
        if provider == "deepseek":
            key = self.deepseek_api_key
            # Normalise: ensure /v1 suffix
            base = self.deepseek_base_url.rstrip("/")
            if not base.endswith("/v1"):
                base += "/v1"
            return key, base, self.default_model
        if provider == "dashscope":
            return self.dashscope_api_key, self.dashscope_base_url, self.default_model
        if provider == "openai":
            return self.openai_api_key, self.openai_base_url, self.default_model
        raise ValueError(f"Unknown provider: {provider}")


settings = Settings()
