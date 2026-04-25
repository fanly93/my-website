import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.user_llm_config import UserLLMConfig
from app.schemas.llm_config import LLMConfigRequest, LLMConfigResponse
from app.schemas.user import UserProfile, UserUpdate
from app.services.user import update_user

router = APIRouter(prefix="/users", tags=["users"])

UPLOADS_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_SIZE = 5 * 1024 * 1024  # 5 MB


@router.get("/me", response_model=UserProfile)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserProfile)
async def patch_me(
    body: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updates = {}

    if body.username is not None:
        if body.username.strip() == "":
            raise HTTPException(status_code=422, detail="用户名不得为空")
        updates["username"] = body.username.strip()

    if updates:
        current_user = await update_user(db, current_user, **updates)
    return current_user


@router.post("/me/avatar", response_model=UserProfile)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=422, detail="仅支持 JPEG / PNG / GIF / WebP 格式")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=422, detail="文件大小不得超过 5 MB")

    suffix = Path(file.filename or "avatar").suffix or ".jpg"
    filename = f"{uuid.uuid4().hex}{suffix}"
    UPLOADS_DIR.mkdir(exist_ok=True)
    (UPLOADS_DIR / filename).write_bytes(content)

    avatar_url = f"/uploads/{filename}"
    current_user = await update_user(db, current_user, avatar_url=avatar_url)
    return current_user


# ── LLM config ────────────────────────────────────────────────────────────────

_DEFAULT_BASE_URLS: dict[str, str] = {
    "deepseek": "https://api.deepseek.com/v1",
    "dashscope": "https://dashscope.aliyuncs.com/compatible-mode/v1",
    "openai": "https://api.openai.com/v1",
}


def _mask_key(api_key: str) -> str:
    return f"****{api_key[-4:]}" if len(api_key) >= 4 else "****"


_PRESET_MODELS: dict[str, set[str]] = {
    "deepseek": {"deepseek-chat", "deepseek-reasoner"},
    "dashscope": {"qwen-plus", "qwen-max", "qwen3-235b-a22b"},
    "openai": {"gpt-4.1", "gpt-4o", "o4-mini"},
}


def _config_to_response(cfg: UserLLMConfig) -> LLMConfigResponse:
    try:
        custom_models: list[str] = json.loads(cfg.custom_models or "[]")
    except Exception:
        custom_models = []
    # Backfill: if active model is custom and not yet tracked, include it at front
    if cfg.model not in _PRESET_MODELS.get(cfg.provider, set()) and cfg.model not in custom_models:
        custom_models = [cfg.model, *custom_models]
    return LLMConfigResponse(
        provider=cfg.provider,
        api_key_hint=_mask_key(cfg.api_key),
        base_url=cfg.base_url,
        model=cfg.model,
        custom_models=custom_models,
    )


@router.get("/me/llm-config", response_model=LLMConfigResponse)
async def get_llm_config(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UserLLMConfig).where(
            UserLLMConfig.user_id == current_user.id,
            UserLLMConfig.is_active == True,  # noqa: E712
        )
    )
    cfg = result.scalar_one_or_none()
    if not cfg:
        raise HTTPException(status_code=404, detail="尚未配置 LLM")
    return _config_to_response(cfg)


@router.get("/me/llm-configs", response_model=list[LLMConfigResponse])
async def get_all_llm_configs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UserLLMConfig).where(UserLLMConfig.user_id == current_user.id)
    )
    return [_config_to_response(cfg) for cfg in result.scalars().all()]


@router.put("/me/llm-config", response_model=LLMConfigResponse)
async def put_llm_config(
    body: LLMConfigRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    resolved_base_url = (body.base_url or "").strip() or _DEFAULT_BASE_URLS.get(body.provider, "")
    new_key = (body.api_key or "").strip()

    # Upsert config for this specific provider
    result = await db.execute(
        select(UserLLMConfig).where(
            UserLLMConfig.user_id == current_user.id,
            UserLLMConfig.provider == body.provider,
        )
    )
    cfg = result.scalar_one_or_none()

    if cfg:
        if new_key:
            cfg.api_key = new_key
        presets = _PRESET_MODELS.get(body.provider, set())
        # Build accumulated custom models list:
        # 1. backfill the previously-active model (in case it predates this column)
        # 2. add the incoming model if it's non-preset
        try:
            saved_custom: list[str] = json.loads(cfg.custom_models or "[]")
        except Exception:
            saved_custom = []
        if cfg.model not in presets and cfg.model not in saved_custom:
            saved_custom.insert(0, cfg.model)
        if body.model not in presets and body.model not in saved_custom:
            saved_custom.append(body.model)
        cfg.custom_models = json.dumps(saved_custom, ensure_ascii=False)
        cfg.base_url = resolved_base_url
        cfg.model = body.model
        cfg.updated_at = datetime.now(timezone.utc)
    else:
        if not new_key:
            raise HTTPException(status_code=422, detail="首次配置必须提供 API Key")
        initial_custom: list[str] = []
        if body.model not in _PRESET_MODELS.get(body.provider, set()):
            initial_custom = [body.model]
        cfg = UserLLMConfig(
            user_id=current_user.id,
            provider=body.provider,
            api_key=new_key,
            base_url=resolved_base_url,
            model=body.model,
            custom_models=json.dumps(initial_custom, ensure_ascii=False),
        )
        db.add(cfg)

    # Mark this provider active, deactivate others
    all_result = await db.execute(
        select(UserLLMConfig).where(UserLLMConfig.user_id == current_user.id)
    )
    for other in all_result.scalars().all():
        other.is_active = other.provider == body.provider

    await db.commit()
    await db.refresh(cfg)
    return _config_to_response(cfg)
