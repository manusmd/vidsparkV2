# TODO List

## React Unescaped Entities ✅
- [x] src/app/app/admin/components/ContentTypeForm.component.tsx - Unescaped single quote

## Unused Variables ✅
- [x] src/app/app/templates/page.tsx - '_error' is defined but never used
- [x] src/components/dashboard/RecentVideosSection.component.tsx - 'Video' is defined but never used
- [x] src/hooks/useStripePayments.ts - '_error' is defined but never used (2 instances)

## Empty Interface Declarations ✅
- [x] src/components/ui/input.tsx - An interface declaring no members is equivalent to its supertype
- [x] src/components/ui/textarea.tsx - An interface declaring no members is equivalent to its supertype

## New Issues
- [ ] src/app/api/bulk/cancel/[jobId]/route.ts - Invalid type for POST request handler

Note: All ESLint issues have been resolved. The remaining issue is a TypeScript type error in the bulk cancel route that needs to be fixed. 