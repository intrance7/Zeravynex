import os
import json
import logging
from typing import Optional, Any, Dict
from collections import OrderedDict

logger = logging.getLogger("zeravynex.cache")


class InMemoryLRUCache:
    """Fallback in-memory LRU cache when Redis is not available or disabled."""

    def __init__(self, capacity: int = 500):
        self.capacity = capacity
        self.cache: OrderedDict[str, str] = OrderedDict()

    def get(self, key: str) -> Optional[str]:
        if key not in self.cache:
            return None
        self.cache.move_to_end(key)
        return self.cache[key]

    def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)
        return True

    def delete(self, key: str) -> bool:
        if key in self.cache:
            del self.cache[key]
            return True
        return False

    def ping(self) -> bool:
        return True


class CacheManager:
    """Unified cache interface managing Redis or in-memory fallback."""

    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url or os.environ.get("REDIS_URL")
        self.client = None
        self.is_redis = False

        if self.redis_url:
            try:
                import redis
                client = redis.from_url(self.redis_url, decode_responses=True)
                client.ping()
                self.client = client
                self.is_redis = True
            except Exception:
                self.client = InMemoryLRUCache()
                self.is_redis = False
        else:
            self.client = InMemoryLRUCache()
            self.is_redis = False

    def get_report(self, sha256: str) -> Optional[Dict[str, Any]]:
        """Retrieves cached JSON analysis report for a given SHA256 hash."""
        key = f"zeravynex:report:{sha256.lower()}"
        try:
            val = self.client.get(key)
            if val:
                return json.loads(val)
        except Exception:
            pass
        return None

    def set_report(self, sha256: str, report: Dict[str, Any], ttl_seconds: int = 86400) -> bool:
        """Caches JSON analysis report for a given SHA256 hash (default 24h TTL)."""
        key = f"zeravynex:report:{sha256.lower()}"
        try:
            payload = json.dumps(report)
            if self.is_redis:
                return bool(self.client.set(key, payload, ex=ttl_seconds))
            else:
                return bool(self.client.set(key, payload))
        except Exception:
            return False

    def invalidate_report(self, sha256: str) -> bool:
        """Removes a report from cache."""
        key = f"zeravynex:report:{sha256.lower()}"
        try:
            return bool(self.client.delete(key))
        except Exception:
            return False


# Global singleton cache instance
_cache_instance: Optional[CacheManager] = None

def get_cache() -> CacheManager:
    """Returns the singleton CacheManager instance."""
    global _cache_instance
    if _cache_instance is None:
        _cache_instance = CacheManager()
    return _cache_instance
