import os
import tempfile
from pathlib import Path
import pytest
from app.core.storage import LocalStorageProvider, get_storage_provider


def test_local_storage_save_and_get():
    with tempfile.TemporaryDirectory() as temp_dir:
        provider = LocalStorageProvider(base_dir=temp_dir)
        
        # Test saving raw bytes
        payload = b"MZ\x90\x00DummyPortableExecutable"
        saved_path = provider.save_file(payload, "samples/test_sample.exe")
        
        assert Path(saved_path).exists()
        assert provider.exists("samples/test_sample.exe")
        
        # Test retrieving
        retrieved_path = provider.get_file_path("samples/test_sample.exe")
        assert retrieved_path is not None
        assert Path(retrieved_path).read_bytes() == payload
        
        # Test deletion
        assert provider.delete_file("samples/test_sample.exe")
        assert not provider.exists("samples/test_sample.exe")


def test_get_storage_provider_default():
    provider = get_storage_provider()
    assert isinstance(provider, LocalStorageProvider)
