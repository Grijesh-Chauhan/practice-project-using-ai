"""initial schema: users tickets comments

Revision ID: f4566dfd7331
Revises:
Create Date: 2026-07-27 00:06:48.660730

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "f4566dfd7331"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create users, tickets, and comments tables with indexes."""
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_table(
        "tickets",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("priority", sa.String(length=20), nullable=False),
        sa.Column(
            "status",
            sa.String(length=20),
            server_default="Open",
            nullable=False,
        ),
        sa.Column("assigned_to", sa.Integer(), nullable=True),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["assigned_to"], ["users.id"]),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("tickets", schema=None) as batch_op:
        batch_op.create_index("idx_tickets_assigned_to", ["assigned_to"], unique=False)
        batch_op.create_index("idx_tickets_created_by", ["created_by"], unique=False)
        batch_op.create_index("idx_tickets_status", ["status"], unique=False)

    op.create_table(
        "comments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("ticket_id", sa.Integer(), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["ticket_id"], ["tickets.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("comments", schema=None) as batch_op:
        batch_op.create_index("idx_comments_ticket_id", ["ticket_id"], unique=False)


def downgrade() -> None:
    """Drop comments, tickets, and users tables."""
    with op.batch_alter_table("comments", schema=None) as batch_op:
        batch_op.drop_index("idx_comments_ticket_id")

    op.drop_table("comments")
    with op.batch_alter_table("tickets", schema=None) as batch_op:
        batch_op.drop_index("idx_tickets_status")
        batch_op.drop_index("idx_tickets_created_by")
        batch_op.drop_index("idx_tickets_assigned_to")

    op.drop_table("tickets")
    op.drop_table("users")
