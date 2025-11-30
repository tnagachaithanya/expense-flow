import React, { createContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc, setDoc, writeBatch, getDoc, query, where, updateDoc } from 'firebase/firestore';
import { firebaseConfig } from '../firebase/firebaseConfig';
import { EXPENSE_CATEGORIES } from '../utils/categories';

// Initialize Firebase (once)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initial state – fallback to localStorage for unauthenticated users
const initialState = {
    transactions: JSON.parse(localStorage.getItem('transactions')) || [],
    budgets: JSON.parse(localStorage.getItem('budgets')) || [],
    recurringTransactions: JSON.parse(localStorage.getItem('recurringTransactions')) || [],
    goals: JSON.parse(localStorage.getItem('goals')) || [],
    categories: JSON.parse(localStorage.getItem('categories')) || EXPENSE_CATEGORIES,
    settings: JSON.parse(localStorage.getItem('settings')) || {
        currency: 'USD',
        theme: 'dark',
        defaultCategory: 'Uncategorized',
        notifications: true,
    },
    family: null, // Current user's family data
    familyMembers: [], // Members of the current family
    familyInvitations: [], // Pending invitations for current user
    sentInvitations: [], // Invitations sent by the current user's family
    familyTransactions: [], // Shared family transactions
};

export const GlobalContext = createContext(initialState);

// Reducer handling all actions, including Firestore sync actions
const AppReducer = (state, action) => {
    switch (action.type) {
        // Transaction actions
        case 'DELETE_TRANSACTION':
            return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) };
        case 'ADD_TRANSACTION':
            return { ...state, transactions: [action.payload, ...state.transactions] };
        case 'UPDATE_TRANSACTION':
            return { ...state, transactions: state.transactions.map(t => (t.id === action.payload.id ? action.payload : t)) };
        // Firestore sync actions
        case 'SET_TRANSACTIONS':
            return { ...state, transactions: action.payload };
        case 'SET_BUDGETS':
            return { ...state, budgets: action.payload };
        case 'SET_SETTINGS':
            return { ...state, settings: { ...state.settings, ...action.payload } };
        // Budget actions
        case 'ADD_BUDGET':
            return { ...state, budgets: [...state.budgets, action.payload] };
        case 'UPDATE_BUDGET':
            return { ...state, budgets: state.budgets.map(b => (b.id === action.payload.id ? action.payload : b)) };
        case 'DELETE_BUDGET':
            return { ...state, budgets: state.budgets.filter(b => b.id !== action.payload) };
        // Recurring transaction actions
        case 'ADD_RECURRING':
            return { ...state, recurringTransactions: [...state.recurringTransactions, action.payload] };
        case 'UPDATE_RECURRING':
            return { ...state, recurringTransactions: state.recurringTransactions.map(r => (r.id === action.payload.id ? action.payload : r)) };
        case 'DELETE_RECURRING':
            return { ...state, recurringTransactions: state.recurringTransactions.filter(r => r.id !== action.payload) };
        // Goal actions
        case 'ADD_GOAL':
            return { ...state, goals: [...state.goals, action.payload] };
        case 'UPDATE_GOAL':
            return { ...state, goals: state.goals.map(g => (g.id === action.payload.id ? action.payload : g)) };
        case 'DELETE_GOAL':
            return { ...state, goals: state.goals.filter(g => g.id !== action.payload) };
        // Category actions
        case 'SET_CATEGORIES':
            return { ...state, categories: action.payload };
        case 'ADD_CATEGORY':
            return { ...state, categories: [...state.categories, action.payload] };
        case 'DELETE_CATEGORY':
            return { ...state, categories: state.categories.filter(c => c !== action.payload) };
        // Settings actions
        case 'UPDATE_SETTINGS':
            return { ...state, settings: { ...state.settings, ...action.payload } };
        // Family actions
        case 'SET_FAMILY':
            return { ...state, family: action.payload };
        case 'SET_FAMILY_MEMBERS':
            return { ...state, familyMembers: action.payload };
        case 'SET_FAMILY_INVITATIONS':
            return { ...state, familyInvitations: action.payload };
        case 'SET_SENT_INVITATIONS':
            return { ...state, sentInvitations: action.payload };
        case 'DELETE_SENT_INVITATION':
            return { ...state, sentInvitations: state.sentInvitations.filter(i => i.id !== action.payload) };
        case 'SET_FAMILY_TRANSACTIONS':
            return { ...state, familyTransactions: action.payload };
        case 'ADD_FAMILY_TRANSACTION':
            console.log('Reducer: ADD_FAMILY_TRANSACTION', action.payload);
            return { ...state, familyTransactions: [action.payload, ...state.familyTransactions] };
        case 'ADD_FAMILY_MEMBER':
            return { ...state, familyMembers: [...state.familyMembers, action.payload] };
        case 'REMOVE_FAMILY_MEMBER':
            return { ...state, familyMembers: state.familyMembers.filter(m => m.uid !== action.payload) };
        case 'RESET_STATE':
            return {
                transactions: [],
                budgets: [],
                recurringTransactions: [],
                goals: [],
                categories: EXPENSE_CATEGORIES,
                settings: {
                    currency: 'USD',
                    theme: 'dark',
                    defaultCategory: 'Uncategorized',
                    notifications: true,
                },
                family: null,
                familyMembers: [],
                familyInvitations: [],
                sentInvitations: [],
                familyTransactions: [],
            };
        default:
            return state;
    }
};

export const GlobalProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [state, dispatch] = useReducer(AppReducer, initialState);

    // Sync data from Firestore when a user is logged in
    useEffect(() => {
        if (!currentUser) {
            dispatch({ type: 'RESET_STATE' });
            return;
        }
        const fetchData = async () => {
            // Transactions
            const txCol = collection(db, `users/${currentUser.uid}/transactions`);
            const txSnap = await getDocs(txCol);
            const txData = txSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            dispatch({ type: 'SET_TRANSACTIONS', payload: txData });

            // Budgets
            const budCol = collection(db, `users/${currentUser.uid}/budgets`);
            const budSnap = await getDocs(budCol);
            const budData = budSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            dispatch({ type: 'SET_BUDGETS', payload: budData });

            // Settings (single document)
            const settingsCol = collection(db, `users/${currentUser.uid}/settings`);
            const settingsSnap = await getDocs(settingsCol);
            if (!settingsSnap.empty) {
                const settingsData = settingsSnap.docs[0].data();
                dispatch({ type: 'SET_SETTINGS', payload: settingsData });
            }

            // Categories
            const catCol = collection(db, `users/${currentUser.uid}/categories`);
            const catSnap = await getDocs(catCol);
            if (!catSnap.empty) {
                const catData = catSnap.docs[0].data();
                if (catData.list) {
                    dispatch({ type: 'SET_CATEGORIES', payload: catData.list });
                }
            }

            // Fetch User Data (to get familyId)
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            let userData = null;

            if (userDocSnap.exists()) {
                userData = userDocSnap.data();

                // Fetch Family Data if user is in a family
                if (userData.familyId) {
                    const familyDocRef = doc(db, 'families', userData.familyId);
                    const familyDocSnap = await getDoc(familyDocRef);

                    if (familyDocSnap.exists()) {
                        const familyData = { ...familyDocSnap.data(), familyId: familyDocSnap.id };
                        dispatch({ type: 'SET_FAMILY', payload: familyData });

                        // Convert members map to array for state, including the uid
                        const membersArray = Object.entries(familyData.members).map(([uid, memberData]) => ({
                            uid,
                            ...memberData
                        }));
                        dispatch({ type: 'SET_FAMILY_MEMBERS', payload: membersArray });

                        // Fetch Family Transactions
                        const familyTxCol = collection(db, `families/${userData.familyId}/transactions`);
                        const familyTxSnap = await getDocs(familyTxCol);
                        const familyTxData = familyTxSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                        console.log('Fetched family transactions:', familyTxData);
                        dispatch({ type: 'SET_FAMILY_TRANSACTIONS', payload: familyTxData });
                    }
                }
            }

            // Fetch Invitations
            if (currentUser.email) {
                console.log('Fetching invitations for email:', currentUser.email);
                const invitationsRef = collection(db, 'familyInvitations');
                const q = query(
                    invitationsRef,
                    where('invitedEmail', '==', currentUser.email),
                    where('status', '==', 'pending')
                );
                try {
                    const inviteSnap = await getDocs(q);
                    const invitations = inviteSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                    console.log('Fetched invitations:', invitations);
                    dispatch({ type: 'SET_FAMILY_INVITATIONS', payload: invitations });
                } catch (error) {
                    console.error('Error fetching invitations:', error);
                }
            }

            // Fetch Sent Invitations (if user is in a family)
            if (userData && userData.familyId) {
                try {
                    const invitationsRef = collection(db, 'familyInvitations');
                    const q = query(
                        invitationsRef,
                        where('familyId', '==', userData.familyId),
                        where('status', '==', 'pending')
                    );
                    const sentInviteSnap = await getDocs(q);
                    const sentInvitations = sentInviteSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                    dispatch({ type: 'SET_SENT_INVITATIONS', payload: sentInvitations });
                } catch (error) {
                    // Non-admin members may not have permission to read all family invitations
                    console.log('Could not fetch sent invitations (may not be admin):', error.message);
                    dispatch({ type: 'SET_SENT_INVITATIONS', payload: [] });
                }
            }
        };
        fetchData();
    }, [currentUser?.uid]);

    // LocalStorage fallback for unauthenticated users
    useEffect(() => {
        if (currentUser) return;
        localStorage.setItem('transactions', JSON.stringify(state.transactions));
    }, [state.transactions, currentUser]);

    useEffect(() => {
        if (currentUser) return;
        localStorage.setItem('budgets', JSON.stringify(state.budgets));
    }, [state.budgets, currentUser]);

    useEffect(() => {
        if (currentUser) return;
        localStorage.setItem('recurringTransactions', JSON.stringify(state.recurringTransactions));
    }, [state.recurringTransactions, currentUser]);

    useEffect(() => {
        if (currentUser) return;
        localStorage.setItem('goals', JSON.stringify(state.goals));
    }, [state.goals, currentUser]);

    useEffect(() => {
        if (currentUser) return;
        localStorage.setItem('categories', JSON.stringify(state.categories));
    }, [state.categories, currentUser]);

    useEffect(() => {
        if (currentUser) return;
        localStorage.setItem('settings', JSON.stringify(state.settings));
    }, [state.settings, currentUser]);

    // Transaction actions – sync with Firestore when logged in
    const deleteTransaction = async (transaction) => {
        // Accept either transaction object or just ID for backwards compatibility
        const txId = typeof transaction === 'object' ? transaction.id : transaction;
        const familyId = typeof transaction === 'object' ? transaction.familyId : null;

        if (currentUser) {
            if (familyId) {
                // Delete from Family Collection
                const docRef = doc(db, `families/${familyId}/transactions`, txId);
                await deleteDoc(docRef).catch(console.error);
                dispatch({ type: 'DELETE_TRANSACTION', payload: txId });
                // Also remove from family transactions state
                dispatch({ type: 'SET_FAMILY_TRANSACTIONS', payload: (state.familyTransactions || []).filter(t => t.id !== txId) });
            } else {
                // Delete from Personal Collection
                const docRef = doc(db, `users/${currentUser.uid}/transactions`, txId);
                await deleteDoc(docRef).catch(console.error);
                dispatch({ type: 'DELETE_TRANSACTION', payload: txId });
            }
        } else {
            dispatch({ type: 'DELETE_TRANSACTION', payload: txId });
        }
    };

    const addTransaction = async transaction => {
        if (currentUser) {
            if (transaction.familyId) {
                console.log('Adding family transaction:', transaction);
                // Add to Family Collection
                const colRef = collection(db, `families/${transaction.familyId}/transactions`);
                const docRef = await addDoc(colRef, transaction);
                if (docRef) {
                    console.log('Family transaction added, dispatching');
                    const newTx = { ...transaction, id: docRef.id };
                    dispatch({ type: 'ADD_FAMILY_TRANSACTION', payload: newTx });
                }
            } else {
                // Add to Personal Collection
                const colRef = collection(db, `users/${currentUser.uid}/transactions`);
                const docRef = await addDoc(colRef, transaction);
                if (docRef) {
                    const newTx = { ...transaction, id: docRef.id };
                    dispatch({ type: 'ADD_TRANSACTION', payload: newTx });
                }
            }
        } else {
            dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
        }
    };

    const updateTransaction = async transaction => {
        if (currentUser) {
            try {
                if (transaction.familyId) {
                    // Update in Family Collection
                    const docRef = doc(db, `families/${transaction.familyId}/transactions`, String(transaction.id));
                    await setDoc(docRef, transaction, { merge: true });
                    // Update family transactions state
                    dispatch({ type: 'SET_FAMILY_TRANSACTIONS', payload: (state.familyTransactions || []).map(t => t.id === transaction.id ? transaction : t) });
                } else {
                    // Update in Personal Collection
                    const docRef = doc(db, `users/${currentUser.uid}/transactions`, String(transaction.id));
                    await setDoc(docRef, transaction, { merge: true });
                    dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
                }
            } catch (error) {
                console.error('Error updating transaction in Firestore:', error);
                throw error;
            }
        } else {
            dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
        }
    };

    // Budget actions (Firestore sync omitted for brevity)
    const addBudget = budget => dispatch({ type: 'ADD_BUDGET', payload: budget });
    const updateBudget = budget => dispatch({ type: 'UPDATE_BUDGET', payload: budget });
    const deleteBudget = id => dispatch({ type: 'DELETE_BUDGET', payload: id });

    // Recurring actions
    const addRecurring = recurring => dispatch({ type: 'ADD_RECURRING', payload: recurring });
    const updateRecurring = recurring => dispatch({ type: 'UPDATE_RECURRING', payload: recurring });
    const deleteRecurring = id => dispatch({ type: 'DELETE_RECURRING', payload: id });

    // Goal actions
    const addGoal = goal => dispatch({ type: 'ADD_GOAL', payload: goal });
    const updateGoal = goal => dispatch({ type: 'UPDATE_GOAL', payload: goal });
    const deleteGoal = id => dispatch({ type: 'DELETE_GOAL', payload: id });

    // Settings actions – also persist to Firestore when logged in
    const updateSettings = async settings => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
        if (currentUser) {
            // Overwrite the single settings document (id "preferences")
            const docRef = doc(db, `users/${currentUser.uid}/settings`, 'preferences');
            await setDoc(docRef, settings, { merge: true }).catch(console.error);
        }
    };

    // Category actions – also persist to Firestore when logged in
    const addCategory = async category => {
        dispatch({ type: 'ADD_CATEGORY', payload: category });
        if (currentUser) {
            const docRef = doc(db, `users/${currentUser.uid}/categories`, 'list');
            const newList = [...state.categories, category];
            await setDoc(docRef, { list: newList }, { merge: true }).catch(console.error);
        }
    };

    const deleteCategory = async category => {
        dispatch({ type: 'DELETE_CATEGORY', payload: category });
        if (currentUser) {
            const docRef = doc(db, `users/${currentUser.uid}/categories`, 'list');
            const newList = state.categories.filter(c => c !== category);
            await setDoc(docRef, { list: newList }, { merge: true }).catch(console.error);
        }
    };

    const clearAllData = async () => {
        if (currentUser) {
            const batch = writeBatch(db);

            // Helper to queue deletions
            const queueDeletes = async (collectionName) => {
                try {
                    const colRef = collection(db, `users/${currentUser.uid}/${collectionName}`);
                    const snap = await getDocs(colRef);
                    console.log(`Found ${snap.size} docs in ${collectionName}`);
                    snap.forEach(doc => batch.delete(doc.ref));
                } catch (err) {
                    console.error(`Error clearing ${collectionName}:`, err);
                }
            };

            console.log("Starting clear all data...");
            await Promise.all([
                queueDeletes('transactions'),
                queueDeletes('budgets'),
                queueDeletes('recurringTransactions'),
                queueDeletes('goals'),
                queueDeletes('settings'),
                queueDeletes('categories')
            ]);
            console.log("Committing batch delete...");

            await batch.commit().then(() => console.log("Batch commit successful")).catch(err => console.error("Batch commit failed:", err));
        }

        // Clear only app-specific localStorage, not auth
        const keysToRemove = ['transactions', 'budgets', 'recurringTransactions', 'goals', 'settings', 'categories'];
        keysToRemove.forEach(key => localStorage.removeItem(key));

        dispatch({ type: 'RESET_STATE' });
    };

    // Family Management Functions
    const createFamily = async (familyName) => {
        if (!currentUser) return null;

        try {
            const familyId = `family_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const familyData = {
                familyId,
                familyName,
                createdBy: currentUser.uid,
                createdAt: new Date().toISOString(),
                members: {
                    [currentUser.uid]: {
                        role: 'admin',
                        joinedAt: new Date().toISOString(),
                        name: currentUser.displayName || currentUser.email,
                        email: currentUser.email
                    }
                },
                settings: state.settings
            };

            // Create family document
            await setDoc(doc(db, 'families', familyId), familyData);

            // Create or update user document with familyId
            await setDoc(doc(db, 'users', currentUser.uid), {
                email: currentUser.email,
                displayName: currentUser.displayName || currentUser.email,
                familyId,
                role: 'admin'
            }, { merge: true });

            dispatch({ type: 'SET_FAMILY', payload: familyData });
            dispatch({ type: 'SET_FAMILY_MEMBERS', payload: [familyData.members[currentUser.uid]] });

            return familyId;
        } catch (error) {
            console.error('Error creating family:', error);
            throw error;
        }
    };

    const inviteMember = async (email) => {
        if (!currentUser || !state.family) return null;

        try {
            // Check if invitation already exists
            const invitationsRef = collection(db, 'familyInvitations');
            const existingInviteQuery = query(
                invitationsRef,
                where('familyId', '==', state.family.familyId),
                where('invitedEmail', '==', email),
                where('status', '==', 'pending')
            );
            const existingInvites = await getDocs(existingInviteQuery);

            if (!existingInvites.empty) {
                throw new Error('An invitation has already been sent to this email.');
            }

            // Create invitation
            const invitationData = {
                familyId: state.family.familyId,
                familyName: state.family.familyName,
                invitedBy: currentUser.uid,
                invitedByName: currentUser.displayName || currentUser.email,
                invitedEmail: email,
                status: 'pending',
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
            };

            const docRef = await addDoc(collection(db, 'familyInvitations'), invitationData);
            return docRef.id;
        } catch (error) {
            console.error('Error inviting member:', error);
            throw error;
        }
    };

    const acceptInvitation = async (invitationId) => {
        if (!currentUser) return;

        try {
            const invitationRef = doc(db, 'familyInvitations', invitationId);
            const invitationSnap = await getDoc(invitationRef);

            if (!invitationSnap.exists()) {
                throw new Error('Invitation not found.');
            }

            const invitation = invitationSnap.data();

            // Check if invitation is still valid
            if (invitation.status !== 'pending') {
                throw new Error('This invitation is no longer valid.');
            }

            if (new Date(invitation.expiresAt) < new Date()) {
                throw new Error('This invitation has expired.');
            }

            // Create or update user document
            await setDoc(doc(db, 'users', currentUser.uid), {
                email: currentUser.email,
                displayName: currentUser.displayName || currentUser.email,
                familyId: invitation.familyId,
                role: 'member'
            }, { merge: true });

            // Add user to family members
            const familyRef = doc(db, 'families', invitation.familyId);
            const familySnap = await getDoc(familyRef);
            const familyData = familySnap.data();

            const updatedMembers = {
                ...familyData.members,
                [currentUser.uid]: {
                    role: 'member',
                    joinedAt: new Date().toISOString(),
                    name: currentUser.displayName || currentUser.email,
                    email: currentUser.email
                }
            };

            await updateDoc(familyRef, { members: updatedMembers });

            // Update invitation status
            await updateDoc(invitationRef, {
                status: 'accepted',
                acceptedAt: new Date().toISOString()
            });

            // Fetch and set family data
            const updatedFamilySnap = await getDoc(familyRef);
            const updatedFamilyData = { ...updatedFamilySnap.data(), familyId: updatedFamilySnap.id };
            dispatch({ type: 'SET_FAMILY', payload: updatedFamilyData });

            // Convert members map to array for state, including the uid
            const membersArray = Object.entries(updatedFamilyData.members).map(([uid, memberData]) => ({
                uid,
                ...memberData
            }));
            dispatch({ type: 'SET_FAMILY_MEMBERS', payload: membersArray });

        } catch (error) {
            console.error('Error accepting invitation:', error);
            throw error;
        }
    };

    const declineInvitation = async (invitationId) => {
        try {
            await updateDoc(doc(db, 'familyInvitations', invitationId), {
                status: 'declined',
                declinedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error declining invitation:', error);
            throw error;
        }
    };

    const leaveFamily = async () => {
        if (!currentUser || !state.family) return;

        try {
            const familyRef = doc(db, 'families', state.family.familyId);
            const familySnap = await getDoc(familyRef);
            const familyData = familySnap.data();

            // Remove user from family members
            const updatedMembers = { ...familyData.members };

            // Check if user is actually in the members list
            if (updatedMembers[currentUser.uid]) {
                delete updatedMembers[currentUser.uid];

                // If user is the last member, delete the family
                if (Object.keys(updatedMembers).length === 0) {
                    await deleteDoc(familyRef);
                } else {
                    // If user was admin and there are other members, promote someone else
                    if (familyData.members[currentUser.uid].role === 'admin') {
                        const newAdminId = Object.keys(updatedMembers)[0];
                        updatedMembers[newAdminId].role = 'admin';
                    }
                    await updateDoc(familyRef, { members: updatedMembers });
                }
            } else {
                console.warn('User not found in family members list, skipping family update.');
            }

            // Update user document
            await setDoc(doc(db, 'users', currentUser.uid), {
                familyId: null,
                role: null
            }, { merge: true });

            dispatch({ type: 'SET_FAMILY', payload: null });
            dispatch({ type: 'SET_FAMILY_MEMBERS', payload: [] });

        } catch (error) {
            console.error('Error leaving family:', error);
            throw error;
        }
    };

    const removeMember = async (memberId) => {
        if (!currentUser || !state.family) return;

        try {
            // Check if current user is admin
            if (state.family.members[currentUser.uid].role !== 'admin') {
                throw new Error('Only admins can remove members.');
            }

            const familyRef = doc(db, 'families', state.family.familyId);
            const familySnap = await getDoc(familyRef);
            const familyData = familySnap.data();

            // Remove member
            const updatedMembers = { ...familyData.members };
            delete updatedMembers[memberId];

            await updateDoc(familyRef, { members: updatedMembers });

            // Update removed user's document
            await setDoc(doc(db, 'users', memberId), {
                familyId: null,
                role: null
            }, { merge: true });

            dispatch({ type: 'REMOVE_FAMILY_MEMBER', payload: memberId });

        } catch (error) {
            console.error('Error removing member:', error);
            throw error;
        }
    };

    return (
        <GlobalContext.Provider
            value={{
                transactions: state.transactions,
                budgets: state.budgets,
                recurringTransactions: state.recurringTransactions,
                goals: state.goals,
                categories: state.categories,
                settings: state.settings,
                deleteTransaction,
                addTransaction,
                updateTransaction,
                addBudget,
                updateBudget,
                deleteBudget,
                addRecurring,
                updateRecurring,
                deleteRecurring,
                addGoal,
                updateGoal,
                deleteGoal,
                addCategory,
                deleteCategory,
                updateSettings,
                clearAllData,
                // Family state and functions
                family: state.family,
                familyMembers: state.familyMembers,
                familyInvitations: state.familyInvitations,
                familyTransactions: state.familyTransactions,
                createFamily,
                inviteMember,
                acceptInvitation,
                declineInvitation,
                leaveFamily,
                removeMember,
                sentInvitations: state.sentInvitations,
                cancelInvitation: async (invitationId) => {
                    try {
                        await deleteDoc(doc(db, 'familyInvitations', invitationId));
                        dispatch({ type: 'DELETE_SENT_INVITATION', payload: invitationId });
                    } catch (error) {
                        console.error('Error cancelling invitation:', error);
                        throw error;
                    }
                },
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};
