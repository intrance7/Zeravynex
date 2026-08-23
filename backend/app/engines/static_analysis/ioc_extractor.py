import re
from typing import Dict, List, Set, Union
from pathlib import Path

# Regular expressions for IOC extraction
URL_REGEX = re.compile(r"https?://[^\s<>\"'{}|\\^`\[\]]+", re.IGNORECASE)
IPV4_REGEX = re.compile(r"\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b")
DOMAIN_REGEX = re.compile(r"\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b")
EMAIL_REGEX = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")
REGISTRY_REGEX = re.compile(r"(?:HKLM|HKCU|HKEY_LOCAL_MACHINE|HKEY_CURRENT_USER|HKEY_CLASSES_ROOT|HKEY_USERS)\\[a-zA-Z0-9_\\.-]+", re.IGNORECASE)
FILE_PATH_REGEX = re.compile(r"(?:[a-zA-Z]:\\|\%[\w_]+\%\\)[a-zA-Z0-9_\\.-]+\.\w{2,4}", re.IGNORECASE)
MUTEX_REGEX = re.compile(r"(?:Global\\|Local\\)[a-zA-Z0-9_.-]+", re.IGNORECASE)

# Filtering patterns for standard clean noise / schema references
URL_WHITELIST = {"http://schemas.microsoft.com", "http://www.w3.org", "http://ns.adobe.com"}
IP_WHITELIST = {"0.0.0.0", "127.0.0.1", "255.255.255.255", "1.1.1.1", "8.8.8.8"}
DOMAIN_WHITELIST = {"microsoft.com", "w3.org", "schema.org", "adobe.com"}


class IOCExtractor:
    """Extracts Indicators of Compromise (IOCs) such as IPs, URLs, Domains, Registry Keys, and Mutexes."""

    @classmethod
    def extract_iocs(cls, strings_list: List[str]) -> Dict[str, List[str]]:
        urls: Set[str] = set()
        ips: Set[str] = set()
        domains: Set[str] = set()
        emails: Set[str] = set()
        registry_keys: Set[str] = set()
        file_paths: Set[str] = set()
        mutexes: Set[str] = set()

        text_block = "\n".join(strings_list)

        # Extract URLs
        for match in URL_REGEX.findall(text_block):
            clean_url = match.rstrip(".,;:!)\"']")
            if not any(clean_url.startswith(wl) for wl in URL_WHITELIST):
                urls.add(clean_url)

        # Extract IPv4 Addresses
        for match in IPV4_REGEX.findall(text_block):
            if match not in IP_WHITELIST and not match.startswith("192.168.") and not match.startswith("10."):
                ips.add(match)

        # Extract Domains
        for match in DOMAIN_REGEX.findall(text_block):
            dom_lower = match.lower()
            # Ensure proper domain matching (exact match or subdomain match with preceding dot)
            is_whitelisted = any(
                dom_lower == wl or dom_lower.endswith("." + wl)
                for wl in DOMAIN_WHITELIST
            )
            if not is_whitelisted and len(match) > 4:
                domains.add(match)

        # Extract Emails
        for match in EMAIL_REGEX.findall(text_block):
            emails.add(match)

        # Extract Registry Keys
        for match in REGISTRY_REGEX.findall(text_block):
            registry_keys.add(match)

        # Extract File Paths
        for match in FILE_PATH_REGEX.findall(text_block):
            file_paths.add(match)

        # Extract Mutexes
        for match in MUTEX_REGEX.findall(text_block):
            mutexes.add(match)

        return {
            "urls": sorted(list(urls)),
            "ip_addresses": sorted(list(ips)),
            "domains": sorted(list(domains)),
            "emails": sorted(list(emails)),
            "registry_keys": sorted(list(registry_keys)),
            "file_paths": sorted(list(file_paths)),
            "mutexes": sorted(list(mutexes))
        }
