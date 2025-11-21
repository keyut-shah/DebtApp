import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@debt_calculator_settings';
const TRANSACTIONS_KEY = '@debt_calculator_transactions';

export async function loadSettings() {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!json) {
      return {
        dobISO: '',
        startDateISO: '',
        dailyRate: 10000,
        currency: 'USD',
        targetMode: 'date',
        targetDateISO: '',
        targetAgeYears: 0
      };
    }
    return JSON.parse(json);
  } catch (error) {
    console.error('Error loading settings:', error);
    return {
      dobISO: '',
      startDateISO: '',
      dailyRate: 10000,
      currency: 'USD',
      targetMode: 'date',
      targetDateISO: '',
      targetAgeYears: 0
    };
  }
}

export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

export async function loadTransactions() {
  try {
    const json = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    if (!json) {
      return [];
    }
    return JSON.parse(json);
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
}

export async function saveTransactions(transactions) {
  try {
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions:', error);
  }
}

export async function addCredit(amount, note) {
  const transactions = await loadTransactions();
  const newTransaction = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type: 'credit',
    amount,
    note,
    timestamp: Date.now()
  };
  transactions.push(newTransaction);
  await saveTransactions(transactions);
  return newTransaction;
}

export async function addDebit(amount, note) {
  const transactions = await loadTransactions();
  const newTransaction = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type: 'debit',
    amount,
    note,
    timestamp: Date.now()
  };
  transactions.push(newTransaction);
  await saveTransactions(transactions);
  return newTransaction;
}

export async function removeTransaction(id) {
  const transactions = await loadTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  await saveTransactions(filtered);
}

export async function exportAll() {
  const settings = await loadSettings();
  const transactions = await loadTransactions();
  return {
    settings,
    transactions,
    exportDate: new Date().toISOString()
  };
}

export async function importAll(data) {
  if (data.settings) {
    await saveSettings(data.settings);
  }
  if (data.transactions) {
    await saveTransactions(data.transactions);
  }
}
