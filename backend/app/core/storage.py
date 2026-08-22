import os
import shutil
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional, BinaryIO, Union


class StorageProvider(ABC):
    """Abstract Base Class for Sample & Artifact Storage."""

    @abstractmethod
    def save_file(self, file_obj: Union[BinaryIO, bytes, str, Path], destination_name: str) -> str:
        """Saves a file and returns its storage URI or local path."""
        pass

    @abstractmethod
    def get_file_path(self, identifier: str) -> Optional[str]:
        """Returns a readable local filesystem path for the requested identifier/key."""
        pass

    @abstractmethod
    def delete_file(self, identifier: str) -> bool:
        """Deletes a file from storage."""
        pass

    @abstractmethod
    def exists(self, identifier: str) -> bool:
        """Checks if a file exists in storage."""
        pass


class LocalStorageProvider(StorageProvider):
    """Local filesystem storage provider for standalone development and offline usage."""

    def __init__(self, base_dir: Optional[Union[str, Path]] = None):
        if base_dir is None:
            base_dir = os.environ.get("SAMPLES_DIR", "./samples")
        self.base_dir = Path(base_dir).resolve()
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def save_file(self, file_obj: Union[BinaryIO, bytes, str, Path], destination_name: str) -> str:
        target_path = self.base_dir / destination_name
        target_path.parent.mkdir(parents=True, exist_ok=True)

        if isinstance(file_obj, (str, Path)):
            src_path = Path(file_obj)
            if src_path.resolve() != target_path.resolve():
                shutil.copy2(src_path, target_path)
        elif isinstance(file_obj, bytes):
            with open(target_path, "wb") as f:
                f.write(file_obj)
        else:
            with open(target_path, "wb") as f:
                shutil.copyfileobj(file_obj, f)

        return str(target_path)

    def get_file_path(self, identifier: str) -> Optional[str]:
        target = self.base_dir / identifier
        if target.exists():
            return str(target)
        # Check absolute path
        abs_target = Path(identifier)
        if abs_target.exists():
            return str(abs_target)
        return None

    def delete_file(self, identifier: str) -> bool:
        target = self.base_dir / identifier
        if not target.exists():
            target = Path(identifier)
        if target.exists() and target.is_file():
            try:
                target.unlink()
                return True
            except OSError:
                return False
        return False

    def exists(self, identifier: str) -> bool:
        target = self.base_dir / identifier
        if target.exists():
            return True
        return Path(identifier).exists()


class S3StorageProvider(StorageProvider):
    """S3-compatible storage provider (AWS S3, MinIO, Ceph, Cloudflare R2)."""

    def __init__(
        self,
        bucket_name: Optional[str] = None,
        endpoint_url: Optional[str] = None,
        aws_access_key_id: Optional[str] = None,
        aws_secret_access_key: Optional[str] = None,
        region_name: Optional[str] = None,
        temp_download_dir: Optional[str] = None
    ):
        import boto3
        from botocore.exceptions import ClientError

        self.bucket_name = bucket_name or os.environ.get("S3_BUCKET_NAME", "zeravynex-samples")
        self.endpoint_url = endpoint_url or os.environ.get("S3_ENDPOINT_URL")
        self.temp_download_dir = Path(temp_download_dir or os.environ.get("TEMP_DOWNLOAD_DIR", "./tmp_samples")).resolve()
        self.temp_download_dir.mkdir(parents=True, exist_ok=True)

        session = boto3.session.Session()
        self.s3_client = session.client(
            service_name="s3",
            endpoint_url=self.endpoint_url,
            aws_access_key_id=aws_access_key_id or os.environ.get("AWS_ACCESS_KEY_ID", "minioadmin"),
            aws_secret_access_key=aws_secret_access_key or os.environ.get("AWS_SECRET_ACCESS_KEY", "minioadmin"),
            region_name=region_name or os.environ.get("AWS_REGION", "us-east-1")
        )

        # Ensure bucket exists
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
        except ClientError:
            try:
                self.s3_client.create_bucket(Bucket=self.bucket_name)
            except Exception:
                pass

    def save_file(self, file_obj: Union[BinaryIO, bytes, str, Path], destination_name: str) -> str:
        if isinstance(file_obj, (str, Path)):
            with open(file_obj, "rb") as f:
                self.s3_client.upload_fileobj(f, self.bucket_name, destination_name)
        elif isinstance(file_obj, bytes):
            from io import BytesIO
            self.s3_client.upload_fileobj(BytesIO(file_obj), self.bucket_name, destination_name)
        else:
            self.s3_client.upload_fileobj(file_obj, self.bucket_name, destination_name)

        return f"s3://{self.bucket_name}/{destination_name}"

    def get_file_path(self, identifier: str) -> Optional[str]:
        # Download from S3 to local temp directory for analysis
        key = identifier.replace(f"s3://{self.bucket_name}/", "")
        local_dest = self.temp_download_dir / Path(key).name
        try:
            self.s3_client.download_file(self.bucket_name, key, str(local_dest))
            return str(local_dest)
        except Exception:
            return None

    def delete_file(self, identifier: str) -> bool:
        key = identifier.replace(f"s3://{self.bucket_name}/", "")
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=key)
            return True
        except Exception:
            return False

    def exists(self, identifier: str) -> bool:
        from botocore.exceptions import ClientError
        key = identifier.replace(f"s3://{self.bucket_name}/", "")
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=key)
            return True
        except ClientError:
            return False


def get_storage_provider() -> StorageProvider:
    """Factory method to instantiate the configured storage provider."""
    backend_type = os.environ.get("STORAGE_BACKEND", "local").lower()
    if backend_type == "s3":
        try:
            return S3StorageProvider()
        except Exception as e:
            print(f"[Warning] Failed to initialize S3StorageProvider ({e}). Falling back to LocalStorageProvider.")
            return LocalStorageProvider()
    return LocalStorageProvider()
