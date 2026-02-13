"""Add TTHC (Thủ tục hành chính) tables for administrative procedure management

Revision ID: 96
Revises: 95
"""

from collections.abc import Sequence

from alembic import op
from app.config import config

# revision identifiers, used by Alembic.
revision: str = "96"
down_revision: str | None = "95"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# Get embedding dimension from config
EMBEDDING_DIM = config.embedding_model_instance.dimension


def upgrade() -> None:
    """Create tthc_procedures and tthc_chunks tables with vector indexes."""

    # Create tthc_procedures table
    op.execute(
        f"""
        CREATE TABLE IF NOT EXISTS tthc_procedures (
            id SERIAL PRIMARY KEY,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            name VARCHAR(500) NOT NULL,
            code VARCHAR(100),
            content_hash VARCHAR NOT NULL,
            deadline VARCHAR(500),
            location VARCHAR(500),
            method TEXT,
            legal_basis TEXT,
            form_attachments JSONB,
            fee VARCHAR(500),
            result VARCHAR(500),
            subjects VARCHAR(500),
            implementing_agency VARCHAR(500),
            content TEXT NOT NULL,
            embedding vector({EMBEDDING_DIM}),
            updated_at TIMESTAMP WITH TIME ZONE,
            search_space_id INTEGER NOT NULL REFERENCES searchspaces(id) ON DELETE CASCADE,
            created_by_id UUID REFERENCES "user"(id) ON DELETE SET NULL
        );
        """
    )

    # Create indexes for tthc_procedures
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_tthc_procedures_name ON tthc_procedures(name);
        CREATE INDEX IF NOT EXISTS ix_tthc_procedures_code ON tthc_procedures(code);
        CREATE INDEX IF NOT EXISTS ix_tthc_procedures_content_hash ON tthc_procedures(content_hash);
        CREATE INDEX IF NOT EXISTS ix_tthc_procedures_updated_at ON tthc_procedures(updated_at);
        CREATE INDEX IF NOT EXISTS ix_tthc_procedures_search_space_id ON tthc_procedures(search_space_id);
        """
    )

    # Create tthc_chunks table
    op.execute(
        f"""
        CREATE TABLE IF NOT EXISTS tthc_chunks (
            id SERIAL PRIMARY KEY,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            content TEXT NOT NULL,
            embedding vector({EMBEDDING_DIM}),
            procedure_id INTEGER NOT NULL REFERENCES tthc_procedures(id) ON DELETE CASCADE
        );
        """
    )

    # Create indexes for tthc_chunks
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_tthc_chunks_procedure_id ON tthc_chunks(procedure_id);
        """
    )

    # Create HNSW vector indexes for similarity search
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS tthc_procedures_vector_index
        ON tthc_procedures USING hnsw (embedding public.vector_cosine_ops);
        """
    )

    op.execute(
        """
        CREATE INDEX IF NOT EXISTS tthc_chunks_vector_index
        ON tthc_chunks USING hnsw (embedding public.vector_cosine_ops);
        """
    )

    # Add TTHC permissions to existing roles
    op.execute(
        """
        UPDATE searchspaceroles
        SET permissions = permissions || '["tthc:create", "tthc:read", "tthc:update"]'::jsonb
        WHERE name = 'Editor'
          AND NOT permissions @> '["tthc:read"]';
        """
    )

    op.execute(
        """
        UPDATE searchspaceroles
        SET permissions = permissions || '["tthc:read"]'::jsonb
        WHERE name = 'Viewer'
          AND NOT permissions @> '["tthc:read"]';
        """
    )


def downgrade() -> None:
    """Remove TTHC tables and indexes."""
    # Remove TTHC permissions from roles
    op.execute(
        """
        UPDATE searchspaceroles
        SET permissions = (
            SELECT jsonb_agg(elem)
            FROM jsonb_array_elements(permissions) AS elem
            WHERE elem::text NOT LIKE '"tthc:%"'
        )
        WHERE permissions @> '["tthc:read"]';
        """
    )

    # Drop vector indexes
    op.execute("DROP INDEX IF EXISTS tthc_chunks_vector_index")
    op.execute("DROP INDEX IF EXISTS tthc_procedures_vector_index")

    # Drop regular indexes
    op.execute("DROP INDEX IF EXISTS ix_tthc_chunks_procedure_id")
    op.execute("DROP INDEX IF EXISTS ix_tthc_procedures_search_space_id")
    op.execute("DROP INDEX IF EXISTS ix_tthc_procedures_updated_at")
    op.execute("DROP INDEX IF EXISTS ix_tthc_procedures_content_hash")
    op.execute("DROP INDEX IF EXISTS ix_tthc_procedures_code")
    op.execute("DROP INDEX IF EXISTS ix_tthc_procedures_name")

    # Drop tables (chunks first due to FK)
    op.execute("DROP TABLE IF EXISTS tthc_chunks")
    op.execute("DROP TABLE IF EXISTS tthc_procedures")
