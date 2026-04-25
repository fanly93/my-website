from typing import AsyncGenerator

from openai import AsyncOpenAI


async def stream_chat(
    messages: list[dict],
    system_prompt: str,
    credentials: dict,
) -> AsyncGenerator[str, None]:
    """Yield LLM response tokens. credentials must contain api_key, base_url, model."""
    client = AsyncOpenAI(
        api_key=credentials["api_key"],
        base_url=credentials["base_url"],
    )
    model = credentials["model"]
    full_messages = [{"role": "system", "content": system_prompt}, *messages]

    async with client.chat.completions.stream(
        model=model,
        messages=full_messages,  # type: ignore[arg-type]
    ) as stream:
        async for event in stream:
            if event.type == "content.delta":
                yield event.delta
