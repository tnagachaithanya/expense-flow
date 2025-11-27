import React, { createContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc, setDoc, writeBatch } from 'firebase/firestore';
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
                }
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
        };
        fetchData();
    }, [currentUser]);

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
    const deleteTransaction = async id => {
        if (currentUser) {
            const docRef = doc(db, `users/${currentUser.uid}/transactions`, id);
            await deleteDoc(docRef).catch(console.error);
        }
        dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    };

    const addTransaction = async transaction => {
        if (currentUser) {
            const colRef = collection(db, `users/${currentUser.uid}/transactions`);
            const docRef = await addDoc(colRef, transaction);
            if (docRef) {
                const newTx = { ...transaction, id: docRef.id };
                dispatch({ type: 'ADD_TRANSACTION', payload: newTx });
            }
        } else {
            dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
        }
    };

    const updateTransaction = async transaction => {
        dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
        if (currentUser) {
            const docRef = doc(db, `users/${currentUser.uid}/transactions`, transaction.id);
            await setDoc(docRef, transaction, { merge: true }).catch(console.error);
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
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};
