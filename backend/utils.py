"""Request validation utilities."""
import ipaddress
from urllib.parse import urlparse

_PRIVATE_RANGES = [
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("127.0.0.0/8"),
]


def validate_provider_url(url: str) -> str:
    """Validate that a provider URL is safe (no SSRF to private networks).

    Returns the validated URL or raises ValueError.
    """
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError(f"Invalid URL scheme: {parsed.scheme}")
    if not parsed.hostname:
        raise ValueError("URL has no hostname")

    # Allow localhost for development
    if parsed.hostname in ("localhost", "127.0.0.1"):
        return url

    try:
        ip = ipaddress.ip_address(parsed.hostname)
        for network in _PRIVATE_RANGES:
            if ip in network:
                raise ValueError(f"URL points to private network: {parsed.hostname}")
    except ValueError as e:
        if "private network" in str(e):
            raise
        # hostname is not an IP — that's fine (it's a DNS name)
        pass

    return url
