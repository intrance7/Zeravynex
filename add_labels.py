import json
import subprocess

with open('issues.json', 'r', encoding='utf-8') as f:
    issues = json.load(f)

for issue in issues:
    number = issue['number']
    title = issue['title'].lower()
    
    new_labels = []
    if any(word in title for word in ['vite', 'playwright', 'react', 'zustand', 'frontend', 'component', 'tooltip', 'chart', 'skeleton', '404', 'formatting', 'keyboard', 'fuzzy search', 'copybutton', 'eslint', 'accessibility', 'favicon', 'theme', 'illustrations']):
        new_labels.append('frontend')
    if any(word in title for word in ['database', 'pytest', 'structlog', 'endpoint', 'seeder', 'celery', 'middleware', 'oauth2', 'prometheus', 'backend', 'api']):
        new_labels.append('backend')
    if any(word in title for word in ['test', 'pytest', 'playwright']):
        new_labels.append('testing')
    if any(word in title for word in ['optimize', 'implement', 'add ', 'create', 'set up']):
        new_labels.append('enhancement')
    if any(word in title for word in ['fix', 'error boundary']):
        new_labels.append('bug')
    if 'performance' in title or 'optimize' in title:
        new_labels.append('performance')
    if 'documentation' in title or 'guide' in title or 'readme' in title:
        new_labels.append('documentation')
    
    if new_labels:
        # Create labels if they don't exist (gh issue edit creates them if they don't exist? Wait, it might error if label doesn't exist, but maybe not.)
        # Actually, gh doesn't auto-create labels using issue edit.
        # So we might need to create labels first.
        pass

    # Print what would be done
    print(f"Issue #{number}: {issue['title']} -> {new_labels}")
