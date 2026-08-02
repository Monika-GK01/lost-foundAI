# LostFound AI — Enhancement Deliverables

## Modified Files

### Backend (`server/src/`)

| File | Changes |
|------|---------|
| `repositories/claim.repository.ts` | Added `images` to populate calls in `findAll` |
| `repositories/lostItem.repository.ts` | Fuzzy regex search (replaced `$text` with `$or`/`$regex` per word) |
| `repositories/foundItem.repository.ts` | Same fuzzy regex search enhancement |
| `services/lostItem.service.ts` | `CreateItemResult` interface, upload failure handling, `matchAction()` method, ignored-match filtering |
| `services/foundItem.service.ts` | `CreateFoundItemResult` interface, upload failure handling |
| `services/matchEngine.service.ts` | `summary` field, `buildSummary()` method, min-score rejection (0.15) |
| `services/claim.service.ts` | Pickup details generation on approval, trust score wiring (ITEM_RECOVERED, FOUND_ITEM_VERIFIED, fraud penalty) |
| `services/trustScore.service.ts` | New actions (ITEM_RECOVERED, FOUND_ITEM_VERIFIED), `getTrustTier()` helper |
| `services/email.service.ts` | `sendClaimApproved` accepts verificationCode, renders pickup details HTML |
| `services/notification.service.ts` | `notifyClaimApproved` accepts verificationCode, includes in message |
| `controllers/lostItem.controller.ts` | Destructured `{item, uploadWarnings}`, added `matchAction` handler |
| `controllers/foundItem.controller.ts` | Destructured `{item, uploadWarnings}` |
| `controllers/user.controller.ts` | `withTrustTier()` helper, `trustTier` in all user responses |
| `models/Claim.ts` | `IPickupDetails` interface, `pickupDetailsSchema`, `pickupDetails` field |
| `models/LostItem.ts` | `acceptedMatchId`, `ignoredMatchIds` fields |
| `routes/lostItem.routes.ts` | `POST /:id/match-action` route |
| `constants/index.ts` | Updated MATCH_WEIGHTS (image 0.55), MINIMUM_OVERALL_SCORE, TRUST_TIERS, new TRUST_SCORE actions |
| `config/cloudinary.ts` | Startup warning if Cloudinary unconfigured |

### Frontend (`client/src/`)

| File | Changes |
|------|---------|
| `types/index.ts` | `PickupDetails` interface, `pickupDetails` on Claim, `trustTier` on User, `summary` on MatchResult |
| `lib/utils.ts` | `getTrustTier(score)` helper |
| `lib/services.ts` | `lostItemsApi.matchAction()` |
| `components/ui/ItemCard.tsx` | `onError` image fallback |
| `components/ui/MatchExplanation.tsx` | Summary display (italic highlighted box) |
| `pages/CreateLostItemPage.tsx` | Upload warning toast |
| `pages/CreateFoundItemPage.tsx` | Upload warning toast |
| `pages/LostItemDetailPage.tsx` | `onError` image fallback |
| `pages/FoundItemDetailPage.tsx` | `onError` image fallback |
| `pages/ClaimDetailPage.tsx` | Pickup Information card (office, building, room, time, verification code) |
| `pages/AdminClaimReviewPage.tsx` | Generated pickup details display, trust tier badge |
| `pages/AIMatchResultsPage.tsx` | Accept/Ignore/Compare buttons, ignored state |
| `pages/ProfilePage.tsx` | Trust tier badge next to score |
| `pages/admin/AdminUsersPage.tsx` | Trust tier badge in table |

### AI Service (`ai-service/`)

| File | Changes |
|------|---------|
| `app/config.py` | ViT-L-14, laion2b_s32b_b82k, embedding_dim 768 |

---

## New APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/lost-items/:id/match-action` | Accept or ignore a match suggestion. Body: `{ foundItemId, action: 'accept'\|'ignore' }` |

---

## Schema Changes (backward-compatible)

- **Claim** collection: new optional `pickupDetails` subdocument (null default)
  - `{ office, building, room, contactPerson, pickupTime, verificationCode }`
- **LostItem** collection: new optional `acceptedMatchId` (null) + `ignoredMatchIds` ([] default)
- Existing text index on LostItem/FoundItem remains (now supplemented by regex search)

---

## Environment Variable Changes

| Variable | Default | Notes |
|----------|---------|-------|
| `AI_CLIP_MODEL_NAME` | `ViT-L-14` | Upgraded from ViT-B-32 |
| `AI_CLIP_PRETRAINED` | `laion2b_s32b_b82k` | New pretrained weights |
| `AI_EMBEDDING_DIM` | `768` | Up from 512 |

No new variables required. Existing SMTP and Cloudinary vars unchanged.

---

## Migration Steps

1. **Deploy AI service first** — new model loads at startup (~4GB RAM required)
2. **Deploy server** — new fields have defaults; no data migration needed
3. **Deploy client**
4. *(Optional)* Run a script to re-generate embeddings for existing items at 768-dim for full accuracy

---

## Testing Checklist

- [ ] Upload images → verify stored in Cloudinary and displayed on item cards
- [ ] Upload with Cloudinary misconfigured → verify error toast (not silent failure)
- [ ] View AI matches → verify summary sentence displayed
- [ ] Accept a match → verify `acceptedMatchId` set
- [ ] Ignore a match → verify it disappears from results
- [ ] Compare toggle → verify side-by-side panel
- [ ] Approve a claim → verify pickup details generated (code, time, office)
- [ ] Check approval email → verify pickup details rendered
- [ ] Check in-app notification → verify verification code included
- [ ] View claim detail (student) → verify Pickup Information card
- [ ] View admin claim review → verify pickup details shown post-approval
- [ ] Check profile page → verify trust tier badge (Bronze/Silver/Gold/Platinum)
- [ ] Check admin users table → verify tier badge in Trust column
- [ ] Search items with multi-word keyword → verify fuzzy matching works
- [ ] Reject claim with "fraudulent" in remarks → verify double penalty applied
- [ ] Mark claim as recovered → verify ITEM_RECOVERED trust adjustment

---

## Known Limitations

- ViT-L-14 requires ~4GB RAM on the AI service container
- Old 512-dim embeddings won't match new 768-dim queries until re-embedded
- Fuzzy search uses regex (not a full search engine) — sufficient for campus-scale data
- Pickup details use configurable defaults; no per-college office configuration UI yet
- Match accept currently sets `acceptedMatchId` but does not auto-create a claim draft (student still navigates to claim form)
