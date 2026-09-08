import re
from urllib.parse import urlparse

def analyze_url_heuristics(url: str) -> dict:
    """
    Performs basic heuristic analysis on a given URL to determine if it is likely phishing or malicious.
    """
    indicators = []
    score = 0
    
    try:
        parsed = urlparse(url)
        domain = parsed.netloc
        path = parsed.path
        
        # Check if domain is an IP address
        if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$", domain):
            indicators.append("IP address used instead of a domain name (High Risk)")
            score += 40
            
        # Check domain length
        if len(domain) > 30:
            indicators.append(f"Unusually long domain name ({len(domain)} chars)")
            score += 15
            
        # Check for multiple subdomains (e.g., login.paypal.com.secure.update.domain.com)
        parts = domain.split('.')
        if len(parts) > 4:
            indicators.append("Multiple subdomains detected, often used to spoof legitimate sites")
            score += 20
            
        # Check for suspicious keywords in domain or path
        suspicious_keywords = ["login", "secure", "account", "update", "verify", "banking", "webscr", "confirm", "free", "admin"]
        found_keywords = [kw for kw in suspicious_keywords if kw in domain.lower() or kw in path.lower()]
        if found_keywords:
            indicators.append(f"Suspicious keywords found in URL: {', '.join(found_keywords)}")
            score += 15 * len(found_keywords)
            
        # Check for HTTP instead of HTTPS (minor flag)
        if parsed.scheme == "http":
            indicators.append("Connection is unencrypted (HTTP)")
            score += 5
            
        # Check for URL shortening services
        shorteners = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "ow.ly"]
        if any(shortener in domain for shortener in shorteners):
            indicators.append("URL shortening service detected (commonly masks malicious links)")
            score += 30
            
    except Exception as e:
        indicators.append(f"Failed to parse URL correctly: {str(e)}")
        score += 50
        
    # Cap score at 100
    score = min(score, 100)
    
    # Determine Verdict
    if score >= 60:
        verdict = "PHISHING"
        severity = "HIGH"
    elif score >= 30:
        verdict = "SUSPICIOUS"
        severity = "MEDIUM"
    else:
        verdict = "CLEAN"
        severity = "LOW"
        if not indicators:
            indicators.append("No immediate threats detected by heuristics.")
            
    return {
        "url": url,
        "score": score,
        "verdict": verdict,
        "severity": severity,
        "indicators": indicators
    }
