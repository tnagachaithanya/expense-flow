# Deploying Firestore Security Rules

## Overview
The `firestore.rules` file contains comprehensive security rules to protect your ExpenseFlow data in production. These rules ensure that:
- Users can only access their own data
- Family members can only access their family's data
- Only transaction creators can modify/delete their transactions
- Invitations are properly secured

## How to Deploy

### Option 1: Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`expenseflow-87325`)
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Copy the entire contents of `firestore.rules` from this project
6. Paste it into the rules editor
7. Click **Publish** to deploy the rules

### Option 2: Firebase CLI
If you have Firebase CLI installed:
```bash
firebase deploy --only firestore:rules
```

## Security Rules Summary

### Users Collection
- Users can only read/write their own user document
- Users can only access their own personal transactions

### Families Collection
- Any authenticated user can create a family
- Only family members can read/update the family document
- Only the family creator can delete the family

### Family Transactions
- Only family members can read family transactions
- Family members can create transactions (must set their own UID as `addedBy`)
- Only the transaction creator can update/delete their own transactions

### Family Invitations
- Any authenticated user can create invitations
- Only the invited user or inviter can read the invitation
- Only the invited user can update (accept/decline)
- Only the inviter can delete the invitation
- **Joining Validation:** Users joining a family are validated by their email matching the invitation recipient, ensuring secure access without complex ID requirements.

## Testing Rules
After deploying, test the rules by:
1. Creating a family
2. Inviting a member
3. Adding family transactions
4. Verifying that non-members cannot access family data

## Important Notes
- **Always test rules in a development environment first**
- Rules are applied immediately upon publishing
- Invalid rules will prevent all database access
- Keep a backup of your current rules before updating
