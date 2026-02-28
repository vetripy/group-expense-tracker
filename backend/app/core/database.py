"""Motor async MongoDB connection setup."""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import get_settings


class DatabaseManager:
    """Manages MongoDB connection lifecycle."""

    def __init__(self) -> None:
        self._client: AsyncIOMotorClient | None = None
        self._db: AsyncIOMotorDatabase | None = None

    async def connect(self) -> None:
        """Establish connection to MongoDB."""
        settings = get_settings()
        self._client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000,
        )
        self._db = self._client[settings.MONGODB_DB_NAME]
        # Verify connection
        await self._client.admin.command("ping")

    async def disconnect(self) -> None:
        """Close MongoDB connection."""
        if self._client:
            self._client.close()
            self._client = None
            self._db = None

    @property
    def db(self) -> AsyncIOMotorDatabase:
        """Get database instance. Raises if not connected."""
        if self._db is None:
            raise RuntimeError("Database not connected. Call connect() first.")
        return self._db


# Global database manager instance
database = DatabaseManager()


async def get_database() -> AsyncIOMotorDatabase:
    """FastAPI dependency for database access."""
    return database.db
