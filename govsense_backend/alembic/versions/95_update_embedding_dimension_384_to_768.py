"""Update embedding vector dimension from 384 to 768.

Required when switching embedding model from all-MiniLM-L6-v2 (384 dims)
to intfloat/multilingual-e5-base (768 dims).

Also merges migration heads "94" and "e55302644c51".
"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "95"
down_revision: tuple[str, ...] = ("94", "e55302644c51")
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

OLD_DIM = 384
NEW_DIM = 768

# All tables and their embedding columns that need updating
TABLES_WITH_EMBEDDINGS = [
    "user_memories",
    "documents",
    "chunks",
    "govsense_docs_documents",
    "govsense_docs_chunks",
]

# HNSW indexes that reference embedding columns — must be dropped before
# ALTER TYPE and recreated after (PostgreSQL drops them automatically on
# type change, so we only need to recreate).
VECTOR_INDEXES = [
    ("document_vector_index", "documents"),
    ("chucks_vector_index", "chunks"),
    ("govsense_docs_documents_vector_index", "govsense_docs_documents"),
    ("govsense_docs_chunks_vector_index", "govsense_docs_chunks"),
    ("user_memories_vector_index", "user_memories"),
]


def upgrade() -> None:
    """Change embedding columns from vector(384) to vector(768).

    WARNING: This sets all existing embeddings to NULL. Documents will need
    to be re-indexed after this migration.
    """
    # 1. Drop HNSW indexes (they become invalid after type change)
    for index_name, _ in VECTOR_INDEXES:
        op.execute(f"DROP INDEX IF EXISTS {index_name}")

    # 2. Alter column type from vector(384) to vector(768)
    for table in TABLES_WITH_EMBEDDINGS:
        op.execute(
            f"ALTER TABLE {table} "
            f"ALTER COLUMN embedding TYPE vector({NEW_DIM}) "
            f"USING NULL::vector({NEW_DIM})"
        )

    # 3. Recreate HNSW indexes with new dimension
    for index_name, table in VECTOR_INDEXES:
        op.execute(
            f"CREATE INDEX IF NOT EXISTS {index_name} "
            f"ON {table} USING hnsw (embedding public.vector_cosine_ops)"
        )


def downgrade() -> None:
    """Revert embedding columns back to vector(384)."""
    for index_name, _ in VECTOR_INDEXES:
        op.execute(f"DROP INDEX IF EXISTS {index_name}")

    for table in TABLES_WITH_EMBEDDINGS:
        op.execute(
            f"ALTER TABLE {table} "
            f"ALTER COLUMN embedding TYPE vector({OLD_DIM}) "
            f"USING NULL::vector({OLD_DIM})"
        )

    for index_name, table in VECTOR_INDEXES:
        op.execute(
            f"CREATE INDEX IF NOT EXISTS {index_name} "
            f"ON {table} USING hnsw (embedding public.vector_cosine_ops)"
        )
