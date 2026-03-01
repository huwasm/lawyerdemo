---
title: Handover — Dashboard UI Refinement & Field Mapping
created: 2026-03-01
updated: 2026-03-01
status: active
author: claude+user
---

# Handover — Dashboard UI Refinement & Field Mapping (Mar 1, 2026)

## Summary

Refined the dashboard UI to match the MV-104AN police report form layout. Restructured section ordering, added new extraction fields (`ins_code`, `is_other_pedestrian`), created a comprehensive field-mapping CSV for QA, and added defendant flags (Vehicle/Bicyclist/Pedestrian/Other Pedestrian) as visual checkbox toggles. Updated all project documentation.

---

## Completed

### Dashboard UI Restructure (`app/dashboard/page.tsx`)
- [x] **Accident Details 6-field row** — Date of Accident (always), Day of Week (toggle), Time of Accident (toggle), No. of Vehicles (toggle), Number Injured (always), No. Killed (toggle)
- [x] **Section reordering** — Accident Details row moved before Client Information (matching MV-104AN report order). Location & Description stays in its own section after Defendant.
- [x] **Dynamic grid** — `grid-cols-2` collapsed (Date + Injured), `grid-cols-6` expanded (all 6 fields). Toggle button "Show Details / Hide Details"
- [x] **`computeDayOfWeek()`** — derives day name from MM/DD/YYYY accident_date

### Defendant Flags
- [x] **Vehicle checkbox** — shows vehicle number (1 or 2) inside when checked, transparent when unchecked
- [x] **Bicyclist / Pedestrian / Other Pedestrian checkboxes** — toggle buttons behind "Show Flags / Hide Flags"
- [x] **Styled buttons** — 38x38px squares, `rounded-md`, Clio blue fill when checked, white when unchecked, matching text input height
- [x] **Auto-populated from extraction** — `is_pedestrian`, `is_bicyclist`, `is_other_pedestrian` flags read from AI extraction JSON

### New Extraction Fields
- [x] **`ins_code`** added to `VehicleInfo` in `lib/providers/types.ts` — insurance company code (e.g. "0042")
- [x] **`is_other_pedestrian`** added to `VehicleInfo` — covers "OTHER PEDESTRIAN" checkbox on form
- [x] Both added to extraction prompt JSON template (vehicle_1 and vehicle_2 blocks)
- [x] Both wired into `populateFields` and `populateFieldsNoMatch` in dashboard

### Field Mapping CSV
- [x] **`docs/field-mapping.csv`** created — 32 fields total with columns: Field Name, Field Name in Clio, Clio Env Variable, JSON Path, Source, Used In, Always Visible
- [x] 9 fields mapped to Clio custom fields (8 unique — Defendant First+Last = 1 combined field)
- [x] `ins_code` and `is_other_pedestrian` changed from "Manual entry" to "AI Extraction"

### Documentation Updates
- [x] **CLAUDE_CODE_BRIEFING.md** — rewrote AI Extraction Prompt section, Project File Structure section, Environment Variables section (now 30 vars in 6 groups), Known Issues section (added 2 new issues)
- [x] **ANALYSIS.md** — updated version to 3.1, expanded extraction fields table (added Time, No. Vehicles, No. Killed, Insurance Code, Vehicle/Bicyclist/Pedestrian flags, Date of Birth), updated Custom Fields table with env vars, updated tech stack to mention dual AI + Supabase
- [x] **This handover file** created

---

## In Progress

- [ ] **Phase 3-10**: Backend testing pipeline (extraction, match, PATCH, retainer, calendar, email, E2E, edge cases)
- [ ] **Phase 10B**: Session persistence + redo logic
- [ ] **Phase 11**: Onboarding screens (spec in TASKS.md)

---

## Blocked / Issues

| Issue | Detail | Workaround |
|-------|--------|------------|
| Clio contact email | `GET /contacts/{id}?fields=email_addresses` returns IDs not strings | Hardcoded `HACKATHON_EMAIL` env var |
| PDF download from Clio | `GET /document_versions/{id}/download` untested | Email sends even if download fails |
| Number Injured (Vincent) | Extraction returned `no_injured=2`, expected 0 | Needs prompt tuning |
| Clio field PATCH with existing values | May fail or overwrite pre-populated custom fields | Untested — test in Phase 5 |
| Resend API key | Not yet configured | Email step skipped |

---

## Key Files Changed

- `app/dashboard/page.tsx` — Major restructure: section reordering, 6-field accident row, defendant flags (Vehicle/Bicyclist/Pedestrian/Other Pedestrian), styled checkbox buttons
- `lib/providers/types.ts` — Added `ins_code: string` and `is_other_pedestrian: boolean` to VehicleInfo, updated extraction prompt
- `docs/field-mapping.csv` — Created: 32-field mapping table
- `CLAUDE_CODE_BRIEFING.md` — Updated: extraction prompt, file structure, env vars, known issues
- `ANALYSIS.md` — Updated: version 3.1, extraction fields table, custom fields table, tech stack

---

## Key State Variables Added

```typescript
// Accident Details
const [dayOfWeek, setDayOfWeek] = useState("");
const [noVehicles, setNoVehicles] = useState(0);
const [noKilled, setNoKilled] = useState(0);
const [showExtraAccident, setShowExtraAccident] = useState(false);

// Defendant Flags
const [defendantIsVehicle, setDefendantIsVehicle] = useState(true);
const [defendantVehicleNum, setDefendantVehicleNum] = useState(2);
const [defendantIsBicyclist, setDefendantIsBicyclist] = useState(false);
const [defendantIsPedestrian, setDefendantIsPedestrian] = useState(false);
const [defendantIsOtherPed, setDefendantIsOtherPed] = useState(false);
const [showDefendantFlags, setShowDefendantFlags] = useState(false);
```

---

## Next Steps (Priority Order)

1. **Phase 3**: Test AI extraction (upload Guillermo Reyes PDF, verify all fields including ins_code)
2. **Phase 4**: Test Clio Match (verify `/api/match` finds EU Matter 14525933)
3. **Phase 5**: Test custom field PATCH (verify 8 fields populate in Clio)
4. **Phase 6**: Test retainer generation (verify doc created + downloadable)
5. **Phase 7**: Test calendar entry (SOL = accident date + 8 years)
6. **Phase 8**: Test email (needs Resend key)
7. **Phase 9**: Full E2E (upload -> extract -> review -> approve -> all green)
8. **Phase 10**: Edge case extraction (Noel, Castillo, Grillo, Vincent)
9. **Phase 11**: Build onboarding screens
10. **Phase 12**: Supabase audit trail + dedup
11. **Phase 13**: Swap to US Clio account
12. **Phase 14-15**: UI polish + deploy + submit

---

## Notes

- Dashboard is now ~950 lines in a single file (`app/dashboard/page.tsx`)
- Section order matches MV-104AN form: Accident Details -> Client Info -> Defendant -> Location & Description -> Clio Matter -> Email
- Vehicle checkbox shows the vehicle number (1 or 2) instead of a checkmark
- QA audit mode with per-field checkboxes tracks extraction accuracy
- `ins_code` and `is_other_pedestrian` are now AI-extracted, not manual entry
- The field-mapping CSV is the single reference for all 32 fields and their pipeline usage
