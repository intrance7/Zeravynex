# Zeravynex — Professional Frontend UX/UI Transformation & Product Feature Prompt

## ROLE

Act as a **senior product designer, senior frontend engineer, UX architect, and cybersecurity SaaS product engineer**.

You are working on **Zeravynex**, an AI-assisted malware analysis platform.

Your job is NOT to make the existing frontend look slightly better.

Your job is to transform it into a **premium, original, production-quality cybersecurity SaaS product** with a distinctive visual identity, excellent UX, thoughtful interactions, and a feature architecture capable of supporting the future Zeravynex backend.

Think like you are building a product that could realistically compete for attention alongside modern security platforms.

---

# 1. FIRST: INSPECT THE EXISTING PROJECT

Before changing anything:

1. Inspect the complete repository.
2. Inspect `frontend/`.
3. Inspect `backend/`.
4. Inspect the existing routes.
5. Inspect the current components.
6. Inspect the current styling system.
7. Inspect package.json and installed dependencies.
8. Inspect existing authentication/payment-related code.
9. Inspect existing API contracts.
10. Inspect README/docs/notes.
11. Determine what is already implemented.
12. Preserve working functionality.

DO NOT blindly replace the frontend.

DO NOT initialize another frontend project.

DO NOT delete existing functionality simply because you would architect it differently.

First understand the current system.

---

# 2. PRODUCT VISION

Zeravynex should feel like:

> **A modern malware investigation workstation built for security researchers, SOC analysts, students, and security engineers.**

It should NOT feel like:

* A generic admin dashboard
* A template from a UI library
* A crypto dashboard
* A hacker-themed landing page
* A basic college project
* A clone of VirusTotal
* A clone of ANY.RUN

Use industry products for feature inspiration, but create an original Zeravynex design language.

---

# 3. RESEARCH-DRIVEN UX

Use the following products as research references for feature patterns and UX ideas:

* ANY.RUN
* Google Threat Intelligence / VirusTotal
* Hybrid Analysis
* Joe Sandbox

Study their public interfaces, workflows, reports, investigation concepts, search/filter patterns, threat visualization, pricing structure, and analyst workflows.

Use the research to determine:

* What makes malware-analysis products easy to use
* What information analysts need immediately
* How analysis results should be organized
* How complex technical information can be presented clearly
* What premium features users expect
* How a cybersecurity SaaS should structure its workspace

DO NOT copy their branding, layouts, text, colors, logos, or visual identity.

Zeravynex must have its own identity.

---

# 4. DESIGN DIRECTION

Create a distinctive visual system.

## Overall aesthetic

Use:

* Dark-first interface
* Premium enterprise security aesthetic
* High information density
* Excellent spacing
* Strong typography
* Subtle borders
* Controlled contrast
* Data visualization
* Technical details
* Micro-interactions
* Smooth transitions
* Clear hierarchy

Avoid:

* Excessive neon
* Excessive glow
* Hacker rain animations
* Random gradients everywhere
* Giant meaningless hero sections
* Generic glassmorphism
* Overuse of cards
* Excessive rounded corners
* Stock illustrations
* Template-looking layouts

The application should look like a **real security product**, not a Dribbble concept.

---

# 5. CREATE A ZERAVYNEX DESIGN LANGUAGE

Define reusable design tokens.

Create a coherent system for:

* Colors
* Typography
* Spacing
* Radius
* Shadows
* Borders
* Icons
* Buttons
* Badges
* Tables
* Tabs
* Charts
* Tooltips
* Modals
* Drawers
* Command palette
* Toasts
* Empty states
* Loading states
* Error states

Use a small number of meaningful colors.

Severity should be immediately recognizable:

```text
Critical
High
Medium
Low
Benign
Unknown
```

Do not use color alone to communicate severity.

Use:

* icon
* label
* color
* optional numeric score

---

# 6. LANDING PAGE

Create a premium public-facing landing page.

It should immediately communicate:

> **Understand what a suspicious file is doing — before it becomes an incident.**

Design sections such as:

## Hero

Include:

* Strong headline
* Short technical value proposition
* Primary CTA: Analyze a Sample
* Secondary CTA: Explore Platform
* Product preview / animated analysis visualization

Do NOT make the hero generic.

Create a visually interesting representation of malware analysis:

```text
Sample
  ↓
Static Analysis
  ↓
Behavior
  ↓
IOCs
  ↓
Threat Intelligence
  ↓
AI Explanation
  ↓
Verdict
```

Use subtle motion.

---

# 7. PRODUCT PREVIEW

Create a realistic interactive product preview showing:

```text
Threat Score
87 / 100

CRITICAL

Detection Confidence
94%

MITRE Techniques
T1059
T1055
T1547

IOCs
12

YARA Matches
7
```

The preview should look like the actual Zeravynex product.

Do not use meaningless fake dashboard graphics.

---

# 8. NAVIGATION

Create a professional application shell.

Suggested navigation:

```text
Overview
Analyze
Investigations
Samples
Threat Intelligence
Threat Graph
Reports
Collections
API
Usage
Billing
Settings
```

Not every backend feature needs to be functional immediately.

If functionality does not exist yet:

* create the UI
* define the route
* create the data contract
* show a meaningful coming-soon state

Do not create dead links.

---

# 9. GLOBAL SEARCH / COMMAND PALETTE

Implement a global command/search experience.

Keyboard shortcut:

```text
Ctrl + K
```

Allow searching:

* SHA256
* MD5
* IP
* Domain
* URL
* Sample name
* Investigation
* Report
* IOC

Example:

```text
Search Zeravynex...

8f4a...91c2
192.168.1.10
example.com
invoice.exe
```

Results should be grouped:

```text
Samples
IOCs
Investigations
Reports
Threat Actors
```

This should feel like a real analyst workstation.

---

# 10. DASHBOARD

Do NOT make a generic KPI dashboard.

Create an analyst-oriented dashboard.

Sections:

### Threat Overview

```text
Samples analyzed
Malicious
Suspicious
Benign
Critical findings
```

### Recent Investigations

Show:

* Sample
* Verdict
* Score
* Analyst
* Time
* Status

### Threat Activity

Visualize:

* malware families
* severity distribution
* detection trends
* top IOCs
* MITRE techniques

### Quick Actions

```text
Analyze File
Analyze URL
Search IOC
New Investigation
```

---

# 11. ANALYSIS WORKSPACE

This is the most important part of the frontend.

Create a professional analysis workspace.

When a user opens a sample:

```text
┌──────────────────────────────────────────────────────┐
│ suspicious.exe                          CRITICAL 87 │
│ SHA256: 8f4a...91c2                                  │
├────────────┬─────────────────────────────────────────┤
│ Overview   │                                         │
│ Static     │             ANALYSIS CONTENT            │
│ Imports    │                                         │
│ Sections   │                                         │
│ Strings    │                                         │
│ IOCs       │                                         │
│ YARA       │                                         │
│ MITRE      │                                         │
│ Threat Intel│                                        │
│ AI Report  │                                         │
└────────────┴─────────────────────────────────────────┘
```

Use a sticky sample header.

---

# 12. ANALYSIS OVERVIEW

The first screen should answer:

> Is this malicious?

> Why?

> What did it do?

> What should I investigate next?

Display:

### Verdict

```text
CRITICAL

87 / 100
```

### Confidence

```text
94%
```

### Key findings

```text
Process Injection
Persistence Indicator
Suspicious Network API
Packed Section
C2 Indicator
```

### Top IOCs

Show the most important indicators.

### MITRE ATT&CK

Show the most relevant techniques.

### AI Summary

Provide an expandable analyst summary.

---

# 13. PE STATIC ANALYSIS UI

Create a professional technical view.

Sections:

### PE Metadata

* Architecture
* Entry point
* Image base
* Timestamp
* Subsystem
* Compiler clues
* File size
* Hashes

### Sections

Create a sortable table:

```text
.text
.rdata
.data
.rsrc
.reloc
```

Columns:

```text
Name
Virtual Size
Raw Size
Entropy
Permissions
Risk
```

Entropy should have visual representation.

---

# 14. IMPORT / API ANALYSIS

Create categorized API analysis.

Categories:

```text
Process
Memory
Network
Registry
File System
Cryptography
Persistence
Anti-Analysis
```

Show:

```text
KERNEL32.dll

VirtualAlloc
WriteProcessMemory
CreateRemoteThread
```

Add:

* search
* filter
* expand/collapse
* severity indicators

---

# 15. IOC CENTER

Create a dedicated IOC interface.

IOC types:

```text
IP
Domain
URL
Hash
Email
Registry
File Path
Mutex
```

Every IOC should support:

```text
Copy
Search
Pivot
Add to Investigation
Export
```

Add contextual threat badges.

---

# 16. MITRE ATT&CK VIEW

Create an interactive MITRE ATT&CK visualization.

Show:

```text
Initial Access
Execution
Persistence
Privilege Escalation
Defense Evasion
Credential Access
Discovery
Command & Control
Exfiltration
```

Each technique should be clickable.

When clicked, show:

* Technique ID
* Technique name
* Evidence
* Related APIs
* Related IOCs
* Confidence
* Source

---

# 17. THREAT GRAPH

Create a visually impressive Threat Graph.

Nodes:

```text
Sample
Hash
Domain
IP
URL
IOC
Malware Family
Threat Actor
Technique
Campaign
CVE
```

Example:

```text
             Malware
                │
        ┌───────┴───────┐
        ▼               ▼
      Domain            Hash
        │
        ▼
        IP
        │
        ▼
       C2
```

Allow:

* zoom
* pan
* node selection
* relationship highlighting
* expand node
* collapse node
* search within graph

The graph should become one of Zeravynex's signature features.

---

# 18. INVESTIGATIONS

Introduce an investigation workspace.

Users should be able to create:

```text
Investigation:
Operation Nightfall
```

Add:

* samples
* IOCs
* notes
* tags
* reports
* MITRE techniques
* threat actors

Provide a timeline.

Example:

```text
10:31 Sample uploaded
10:32 Static analysis completed
10:33 IOC discovered
10:34 Threat intelligence pivot
10:37 MITRE technique identified
10:41 Investigation note added
```

---

# 19. COLLECTIONS

Allow users to organize artifacts into collections.

Examples:

```text
Ransomware Research
APT Samples
University Lab
Incident 2026-014
Phishing Campaign
```

Support:

* tags
* notes
* sample count
* last updated
* sharing status

---

# 20. REPORT EXPERIENCE

Create professional reports.

Report types:

```text
Executive Report
SOC Report
Technical Report
IOC Report
AI Summary
```

Provide:

```text
View
Download PDF
Export JSON
Export STIX
Share
```

Some exports can initially be disabled until backend support exists.

---

# 21. AI ANALYST UX

Do NOT make this a generic ChatGPT screen.

Create a contextual AI analyst.

Example:

```text
Ask about this sample...

"Why was this classified as critical?"
"What persistence mechanisms were found?"
"Summarize the attack chain."
"What should I investigate next?"
```

AI responses should reference actual analysis evidence.

Show evidence citations/links within the interface.

Example:

```text
The sample appears to use process injection.

Evidence:
→ VirtualAlloc
→ WriteProcessMemory
→ CreateRemoteThread

Related technique:
T1055
```

Design the AI as an **investigation assistant**, not a chatbot.

---

# 22. AI ACTIONS

Add quick AI actions:

```text
Explain Verdict
Summarize Sample
Explain IOC
Map to MITRE
Generate SOC Report
Generate Executive Summary
Suggest Investigation Steps
```

---

# 23. THREAT INTELLIGENCE SEARCH

Create a unified threat-intelligence search page.

Input:

```text
Search IP, Domain, URL, Hash, CVE, Malware Family...
```

Results should support:

* reputation
* relationships
* associated samples
* associated malware
* MITRE techniques
* historical observations
* investigation pivots

Keep the UI ready for future external intelligence providers.

---

# 24. SAMPLE HISTORY

Create advanced filtering.

Filters:

```text
Verdict
Date
Malware Family
Architecture
File Type
Risk Score
YARA Match
MITRE Technique
Tag
```

Support:

* sorting
* pagination
* bulk selection
* bulk tagging
* export

---

# 25. AUTHENTICATION

Implement a professional authentication experience.

Preferred architecture:

**Supabase Auth**, unless the existing backend architecture already has an authentication system that should be preserved.

Support:

### Email

* Sign up
* Sign in
* Sign out
* Forgot password
* Reset password
* Email verification

### Social

* Google
* GitHub

Optional future providers:

* Microsoft
* Apple

Do not hardcode secrets.

Use environment variables.

Provide:

```text
.env.example
```

with placeholders only.

---

# 26. AUTH UX

Create a premium auth screen.

Include:

```text
ZERAVYNEX

Analyze.
Understand.
Defend.

[ Continue with Google ]

[ Continue with GitHub ]

──────── OR ────────

Email
Password

[ Sign In ]
```

Also:

```text
Remember me
Forgot password?
Create account
```

The auth experience should feel like a serious SaaS product.

---

# 27. USER PROFILE

Create a profile page.

Include:

* Name
* Avatar
* Email
* Provider
* Account creation date
* Plan
* Usage
* API keys
* Security settings

---

# 28. SECURITY SETTINGS

Include:

```text
Change Password
Active Sessions
Sign Out All Sessions
Two-Factor Authentication
Login History
Connected Accounts
```

If MFA cannot be implemented yet, create the UI architecture without pretending it works.

---

# 29. PRICING SYSTEM

Create a professional pricing page.

Suggested structure:

## Community

Free

For students and individual researchers.

Possible limits:

* Limited analyses
* Public investigations
* Basic reports
* Basic static analysis
* Limited history

## Researcher

Example:

```text
₹499/month
```

Possible features:

* More analyses
* Private samples
* Advanced reports
* AI analysis
* Threat graph
* Extended history
* Export capabilities

## Pro

Example:

```text
₹1,499/month
```

Possible features:

* Higher analysis limits
* Advanced AI
* Threat intelligence
* Advanced reports
* API access
* Collections
* Priority processing

## Team

Custom pricing.

Features:

* Team workspace
* Collaboration
* Shared investigations
* Roles
* Admin controls
* Usage analytics
* SSO-ready architecture

IMPORTANT:

Do not hardcode pricing deeply into components.

Create a pricing configuration/data structure so prices and limits can be changed later.

---

# 30. FREE PLAN SHOULD BE USEFUL

Do not make the free plan useless.

A user should be able to experience Zeravynex before paying.

Use:

```text
Free
↓
Experience product
↓
Reach usage limit
↓
Upgrade
```

This is better UX than blocking everything behind payment.

---

# 31. BILLING UX

Create:

```text
Billing
│
├── Current Plan
├── Usage
├── Payment Method
├── Billing History
├── Invoices
└── Manage Subscription
```

Usage visualization:

```text
Monthly Analysis Usage

██████████████░░░░░░
72 / 100 analyses
```

Add upgrade prompts when appropriate.

Do not aggressively interrupt users.

---

# 32. PAYMENT ARCHITECTURE

Design the frontend for **Razorpay** because the target market includes India.

The frontend must NEVER contain:

```text
Razorpay secret key
```

The architecture should be:

```text
Frontend
   ↓
Backend
   ↓
Razorpay
   ↓
Checkout / Subscription
   ↓
Webhook
   ↓
Backend verifies status
   ↓
Database updates subscription
   ↓
Frontend refreshes entitlement
```

Support future alternatives such as Stripe without tightly coupling the UI to one provider.

Create a generic concept:

```text
PaymentProvider
```

so the frontend doesn't need to know provider-specific internals.

---

# 33. SUBSCRIPTION STATES

Support:

```text
Free
Trial
Active
Past Due
Paused
Canceled
Expired
```

The UI should handle every state.

Do not assume payment success from frontend callbacks alone.

Backend verification is authoritative.

---

# 34. USAGE LIMIT UX

When a user approaches a limit:

```text
You've used 80% of your monthly analyses.

████████████████░░░░

[ View Plans ]
```

When the limit is reached:

```text
You've reached your monthly analysis limit.

Upgrade to continue analyzing private samples.

[ Upgrade Plan ]
```

Do not break the application unexpectedly.

---

# 35. NOTIFICATIONS

Create an in-app notification center.

Notifications:

```text
Analysis completed
Threat detected
Report generated
Subscription updated
Usage limit approaching
Investigation shared
```

Support read/unread state.

Later this can connect to:

* WebSockets
* email
* push notifications

---

# 36. TOAST SYSTEM

Create reusable toasts:

```text
Analysis completed
IOC copied
Report generated
Investigation saved
Payment successful
Settings updated
```

Use consistent severity.

---

# 37. EMPTY STATES

Every empty screen needs a useful state.

Example:

```text
No investigations yet.

Create an investigation to organize samples,
IOCs and findings around a security case.

[ New Investigation ]
```

Do NOT use:

```text
No data.
```

---

# 38. LOADING STATES

Use skeletons instead of blank screens.

Create reusable:

```text
SkeletonCard
SkeletonTable
SkeletonGraph
SkeletonReport
```

For analysis:

```text
Preparing sample
Extracting metadata
Building indicators
Generating findings
Preparing report
```

---

# 39. ERROR UX

Create meaningful error pages.

Examples:

```text
Analysis unavailable
Backend connection lost
Authentication failed
Payment could not be verified
Sample could not be processed
```

Provide recovery actions.

---

# 40. RESPONSIVE DESIGN

Desktop is the primary target, but support:

* 1440px
* 1280px
* 1024px
* tablet
* mobile

The analysis workspace can become simplified on mobile.

Do not simply shrink the desktop UI.

Reorganize information for smaller screens.

---

# 41. ACCESSIBILITY

Implement:

* keyboard navigation
* visible focus states
* semantic HTML
* accessible dialogs
* accessible tabs
* aria labels where necessary
* sufficient contrast
* reduced-motion support

The application should be usable without a mouse.

---

# 42. PERFORMANCE

Avoid unnecessary frontend complexity.

Implement:

* lazy-loaded routes
* memoization where useful
* virtualized large tables if necessary
* debounced search
* efficient graph rendering
* optimized icons/assets
* no giant unnecessary dependencies

Do not optimize prematurely.

Measure before introducing complexity.

---

# 43. FRONTEND STATE ARCHITECTURE

Keep state separated:

```text
Auth State
UI State
Analysis State
Investigation State
Billing State
Notification State
```

Do not put the entire application state into one global object.

Use the existing architecture if reasonable.

---

# 44. API SERVICE LAYER

Frontend API calls must go through a service layer.

Example:

```text
services/
├── authService
├── analysisService
├── investigationService
├── threatIntelService
├── billingService
├── reportService
└── notificationService
```

Do not scatter raw fetch calls across components.

---

# 45. FEATURE FLAGS

Introduce feature flags for features that depend on future backend work.

Example:

```text
FEATURE_AI_ANALYST
FEATURE_THREAT_GRAPH
FEATURE_THREAT_INTELLIGENCE
FEATURE_BILLING
FEATURE_TEAM_WORKSPACES
FEATURE_DYNAMIC_ANALYSIS
```

This lets the frontend ship progressively.

---

# 46. ANALYSIS PRIVACY UX

Make privacy obvious.

When submitting a sample:

```text
Analysis Privacy

○ Public
  Sample and report may be visible to others.

● Private
  Only you and authorized collaborators can access this analysis.
```

Do not claim privacy functionality is enforced unless the backend actually enforces it.

---

# 47. SHARE / COLLABORATION

Create share controls for investigations.

Possible permissions:

```text
Viewer
Analyst
Editor
Owner
```

Share via:

* link
* workspace
* invited user

Design this now even if backend collaboration comes later.

---

# 48. TAGGING SYSTEM

Allow users to tag:

* samples
* investigations
* IOCs
* reports

Examples:

```text
#ransomware
#apt
#phishing
#research
#critical
#lab
```

Tags should be filterable.

---

# 49. API DEVELOPER PORTAL

Create a future-ready API page.

Include:

```text
API Overview
API Keys
Usage
Documentation
Webhooks
```

API key UX:

```text
sk_live_••••••••••••

[ Copy ]
[ Revoke ]
```

Never display full secrets after creation.

---

# 50. API USAGE

Show:

```text
Requests this month
Rate limit
Errors
Latency
```

Chart:

```text
API Requests
────────────────────
██████████████
```

---

# 51. UNIQUE ZERAVYNEX FEATURES

Add at least these concepts to differentiate Zeravynex:

### Threat Confidence Breakdown

Instead of just:

```text
Risk: 87
```

show:

```text
Risk Confidence

Static Analysis       +24
YARA                   +18
ML Classification     +21
IOC Reputation        +12
Behavior Indicators   +12

Final Risk             87
```

---

### Explainable Verdict

```text
Why is this malicious?

Top contributing evidence:

1. Process injection APIs
2. Suspicious network APIs
3. High entropy section
4. YARA detection
5. Persistence indicator
```

---

### Investigation Timeline

```text
Upload
 ↓
Static Analysis
 ↓
IOC Found
 ↓
Threat Intel Pivot
 ↓
MITRE Mapping
 ↓
AI Explanation
 ↓
Report
```

---

### Analyst Workspace

Allow the user to pin important findings:

```text
Pinned Evidence

⚠ C2 Domain
⚠ Process Injection
⚠ Registry Persistence
```

This makes Zeravynex feel like an actual investigation tool.

---

# 52. LANDING PAGE TRUST ELEMENTS

Add:

* Security architecture
* Privacy statement
* Static-analysis explanation
* Supported formats
* Technology stack
* Documentation
* GitHub link
* Contact
* Terms
* Privacy Policy

Do not invent fake customer logos or fake statistics.

---

# 53. PRICING PAGE UX

Make the pricing page interactive.

Include:

* Monthly/yearly toggle
* Feature comparison
* Usage limits
* FAQ
* Upgrade CTA
* Current-plan indicator

Show savings on annual plans only if the actual configured pricing supports it.

---

# 54. FOOTER

Professional footer:

```text
ZERAVYNEX

Product
Features
Pricing
API
Roadmap

Resources
Documentation
GitHub
Blog
Research

Company
About
Contact
Privacy
Terms

© Zeravynex
```

---

# 55. DO NOT FAKE BACKEND FUNCTIONALITY

This is extremely important.

If a feature is frontend-only:

Clearly structure it as:

```text
UI READY
Backend integration pending
```

Do NOT:

* pretend payment succeeded
* pretend Google auth is configured
* pretend GitHub auth is configured
* pretend threat intelligence is real
* pretend AI analysis is real
* pretend a report was generated if it wasn't
* expose fake security results as real

Use mock data only where necessary and label it internally.

---

# 56. IMPLEMENTATION STRATEGY

Do not rewrite everything at once.

Work in this order:

## Step 1

Audit current frontend.

## Step 2

Create design system.

## Step 3

Refactor application shell.

## Step 4

Improve landing page.

## Step 5

Improve authentication UI.

## Step 6

Improve dashboard.

## Step 7

Build analysis workspace.

## Step 8

Build investigation experience.

## Step 9

Build Threat Graph UI.

## Step 10

Build reports.

## Step 11

Build pricing.

## Step 12

Build billing UI.

## Step 13

Build profile/settings.

## Step 14

Build notifications.

## Step 15

Build API/developer portal.

## Step 16

Polish animations, accessibility and responsive behavior.

---

# 57. IMPORTANT: DO NOT WASTE TOKENS

Work efficiently.

Before coding:

1. Inspect.
2. Identify reusable components.
3. Create an implementation plan.
4. Make grouped changes.
5. Run the app.
6. Inspect errors.
7. Fix errors.
8. Continue.

Do not repeatedly regenerate the same files.

Do not explain every tiny change.

Do not ask for permission for every normal file edit if the environment already permits the work.

Do not create unnecessary files.

Do not install dependencies unless they provide real value.

---

# 58. DEFINITION OF "PROFESSIONAL"

The finished frontend should satisfy this test:

If the Zeravynex name and logo were removed, the interface should still look like a legitimate commercial cybersecurity product.

It should have:

* coherent UX
* consistent design system
* meaningful interactions
* polished states
* realistic security workflows
* professional information hierarchy
* excellent typography
* useful data visualization
* thoughtful onboarding
* clear pricing
* proper authentication UX
* account management
* billing architecture
* responsive behavior
* accessibility
* performance

---

# 59. FINAL ACCEPTANCE TEST

After implementation, test this journey:

```text
Visitor
 ↓
Landing Page
 ↓
Explore Features
 ↓
Pricing
 ↓
Sign Up
 ↓
Google / GitHub / Email Auth
 ↓
Onboarding
 ↓
Dashboard
 ↓
Analyze Sample
 ↓
Analysis Workspace
 ↓
Threat Findings
 ↓
IOC Investigation
 ↓
Threat Graph
 ↓
AI Explanation
 ↓
Report
 ↓
Save Investigation
 ↓
View Usage
 ↓
Upgrade Plan
 ↓
Checkout
 ↓
Billing
```

Every stage should feel like part of the same product.

---

# 60. MOST IMPORTANT DESIGN PRINCIPLE

Do not optimize for:

> "Make the website look cool."

Optimize for:

> **"Make a security analyst want to use this product."**

Every visual element should support:

**Analyze → Understand → Investigate → Decide → Report**

That is the core Zeravynex experience.

---

# FINAL INSTRUCTION

Act as the senior frontend engineer responsible for the product.

Be opinionated.

If an existing design is generic, replace it with something better.

If a component is poorly structured, refactor it.

If a feature would substantially improve the analyst experience, add it.

If a proposed feature is unnecessary, do not add it just to increase feature count.

Prioritize:

1. UX quality
2. Product differentiation
3. Visual quality
4. Maintainability
5. Performance
6. Accessibility
7. Backend readiness
8. Security

Do not turn Zeravynex into a clone of another malware-analysis platform.

Use industry research as inspiration, but create a **distinct Zeravynex product identity**.

The final result should look like a product that a serious cybersecurity startup could ship.
