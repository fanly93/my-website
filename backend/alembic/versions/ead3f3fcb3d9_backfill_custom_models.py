"""backfill_custom_models

Revision ID: ead3f3fcb3d9
Revises: afcc90689f85
Create Date: 2026-04-25 02:08:06.303356

"""
import json
from typing import Sequence, Union

from alembic import op
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = 'ead3f3fcb3d9'
down_revision: Union[str, None] = 'afcc90689f85'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_PRESETS: dict[str, set[str]] = {
    "deepseek": {"deepseek-chat", "deepseek-reasoner"},
    "dashscope": {"qwen-plus", "qwen-max", "qwen3-235b-a22b"},
    "openai": {"gpt-4.1", "gpt-4o", "o4-mini"},
}


def upgrade() -> None:
    bind = op.get_bind()
    rows = bind.execute(
        text("SELECT id, provider, model, custom_models FROM user_llm_configs")
    ).fetchall()
    for id_, provider, model, custom_models_json in rows:
        try:
            custom_models: list[str] = json.loads(custom_models_json or "[]")
        except Exception:
            custom_models = []
        if model not in _PRESETS.get(provider, set()) and model not in custom_models:
            custom_models.insert(0, model)
            bind.execute(
                text("UPDATE user_llm_configs SET custom_models = :cm WHERE id = :id"),
                {"cm": json.dumps(custom_models, ensure_ascii=False), "id": id_},
            )


def downgrade() -> None:
    pass
