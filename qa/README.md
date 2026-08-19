# QA — Manual & Automation

This folder is the home for all testing activity for ShopSphere V1.

```
qa/
├── manual/                  # Manual testing
│   ├── test-plan.md         # Complete manual test cases (organized by module)
│   ├── bug-reports/         # Bug_Tracking.xlsx (known issues log)
│   ├── test-cases/          # test-case-template.md + per-module case workbooks
│   └── test-data/           # test-data.md + Test_Data.xlsx (reusable data)
├── database/                # Database testing (test plan + queries)
└── automation/              # Automated testing (Playwright / API)
    └── README.md            # Setup plan + data-testid reference guide
```

## Quick reference

- **App URL:** http://localhost:5173
- **API URL:** http://localhost:5000/api
- **Demo user:** `demo@shopsphere.com` / `password123`

## How to run the app under test

```powershell
# Terminal 1 — backend (API + PostgreSQL connection)
cd C:\Users\Administrator\Desktop\ShopSphere
npm run dev:server

# Terminal 2 — frontend
cd C:\Users\Administrator\Desktop\ShopSphere
npm run dev:client
```

Open http://localhost:5173