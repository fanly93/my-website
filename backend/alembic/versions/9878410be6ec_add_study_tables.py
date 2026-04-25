"""add_study_tables

Revision ID: 9878410be6ec
Revises: ead3f3fcb3d9
Create Date: 2026-04-25 12:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = '9878410be6ec'
down_revision: Union[str, None] = 'ead3f3fcb3d9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'study_logs',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('date', sa.Date, nullable=False),
        sa.Column('duration_minutes', sa.Integer, nullable=False, server_default='0'),
        sa.Column('checked_in', sa.Boolean, nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint('user_id', 'date', name='uq_study_logs_user_date'),
    )

    op.create_table(
        'daily_goals',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('estimated_minutes', sa.Integer, nullable=False, server_default='0'),
        sa.Column('completed', sa.Boolean, nullable=False, server_default='0'),
        sa.Column('date', sa.Date, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_daily_goals_user_date', 'daily_goals', ['user_id', 'date'])

    op.create_table(
        'user_achievements',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('achievement_id', sa.String(50), nullable=False),
        sa.Column('unlocked_at', sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint('user_id', 'achievement_id', name='uq_user_achievements_user_achievement'),
    )


def downgrade() -> None:
    op.drop_table('user_achievements')
    op.drop_index('ix_daily_goals_user_date', table_name='daily_goals')
    op.drop_table('daily_goals')
    op.drop_table('study_logs')
