import pytest
from app.core.cache import CacheManager, InMemoryLRUCache, get_cache


def test_in_memory_lru_cache():
    cache = InMemoryLRUCache(capacity=2)
    cache.set("k1", "v1")
    cache.set("k2", "v2")
    
    assert cache.get("k1") == "v1"
    assert cache.get("k2") == "v2"
    
    # Exceed capacity
    cache.set("k3", "v3")
    assert cache.get("k1") is None # Evicted
    assert cache.get("k2") == "v2"
    assert cache.get("k3") == "v3"


def test_cache_manager_report_operations():
    cache_mgr = CacheManager(redis_url=None) # Forces in-memory fallback
    
    sha256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    dummy_report = {
        "metadata": {"file_name": "clean.exe"},
        "risk_analysis": {"risk_score": 0.0, "verdict": "CLEAN"}
    }
    
    # Store report
    assert cache_mgr.set_report(sha256, dummy_report)
    
    # Retrieve report
    cached = cache_mgr.get_report(sha256)
    assert cached is not None
    assert cached["risk_analysis"]["verdict"] == "CLEAN"
    
    # Invalidate
    assert cache_mgr.invalidate_report(sha256)
    assert cache_mgr.get_report(sha256) is None
