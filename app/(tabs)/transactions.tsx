import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { formatCurrency, formatDate } from '../../lib/debt';
import { addCredit, addDebit, loadTransactions, removeTransaction } from '../../lib/storage';
import { updateDebtWidget } from '../../lib/widgetUtils';

interface Transaction {
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    note: string;
    timestamp: number;
}

export default function TransactionsScreen() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [type, setType] = useState<'credit' | 'debit'>('credit');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const t = await loadTransactions();
        setTransactions(t.sort((a: Transaction, b: Transaction) => b.timestamp - a.timestamp));
    };

    const handleAdd = async () => {
        const numAmount = Number(amount);
        if (!numAmount || numAmount <= 0) {
            Alert.alert('Error', 'Please enter a valid positive amount');
            return;
        }

        if (type === 'credit') {
            await addCredit(numAmount, note);
        } else {
            await addDebit(numAmount, note);
        }

        setAmount('');
        setNote('');
        await loadData();

        // Update widget
        updateDebtWidget();
    };


    const handleRemove = async (id: string) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to remove this transaction?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await removeTransaction(id);
                        await loadData();

                        // Update widget
                        updateDebtWidget();
                    }
                }
            ]
        );
    };


    const renderItem = ({ item }: { item: Transaction }) => (
        <View style={styles.transactionItem}>
            <View style={styles.iconContainer}>
                <View style={[styles.iconCircle, item.type === 'credit' ? styles.creditIcon : styles.debitIcon]}>
                    <Ionicons
                        name={item.type === 'credit' ? 'arrow-down' : 'arrow-up'}
                        size={20}
                        color={item.type === 'credit' ? '#34C759' : '#FF3B30'}
                    />
                </View>
            </View>

            <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                    <Text style={styles.itemType}>{item.type === 'credit' ? 'Credit' : 'Debit'}</Text>
                    <Text style={[styles.itemAmount, item.type === 'credit' ? styles.creditText : styles.debitText]}>
                        {item.type === 'credit' ? '-' : '+'}{formatCurrency(item.amount, 'USD')}
                    </Text>
                </View>

                <View style={styles.itemFooter}>
                    <Text style={styles.itemDate}>{formatDate(item.timestamp)}</Text>
                    {item.note ? <Text style={styles.itemNote} numberOfLines={1}> • {item.note}</Text> : null}
                </View>
            </View>

            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleRemove(item.id)}>
                <Ionicons name="trash-outline" size={20} color="#8E8E93" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>Transactions</Text>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.inputContainer}
            >
                <View style={styles.typeSelector}>
                    <TouchableOpacity
                        style={[styles.typeBtn, type === 'credit' && styles.creditBtnActive]}
                        onPress={() => setType('credit')}
                    >
                        <Ionicons name="arrow-down-circle" size={20} color={type === 'credit' ? '#fff' : '#34C759'} />
                        <Text style={[styles.typeBtnText, type === 'credit' && styles.activeText]}>Credit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typeBtn, type === 'debit' && styles.debitBtnActive]}
                        onPress={() => setType('debit')}
                    >
                        <Ionicons name="arrow-up-circle" size={20} color={type === 'debit' ? '#fff' : '#FF3B30'} />
                        <Text style={[styles.typeBtnText, type === 'debit' && styles.activeText]}>Debit</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputRow}>
                    <View style={styles.amountInputWrapper}>
                        <Text style={styles.currencySymbol}>$</Text>
                        <TextInput
                            style={styles.amountInput}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0.00"
                            keyboardType="numeric"
                        />
                    </View>
                    <TextInput
                        style={styles.noteInput}
                        value={note}
                        onChangeText={setNote}
                        placeholder="Add a note..."
                    />
                    <TouchableOpacity
                        style={[styles.addButton, type === 'credit' ? styles.creditBtn : styles.debitBtn]}
                        onPress={handleAdd}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            <FlatList
                data={transactions}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#000',
        marginHorizontal: 16,
        marginVertical: 10,
    },
    inputContainer: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 20,
        marginHorizontal: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
    },
    typeSelector: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 12,
    },
    typeBtn: {
        flex: 1,
        flexDirection: 'row',
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#F2F2F7',
    },
    creditBtnActive: {
        backgroundColor: '#34C759',
        borderColor: '#34C759',
    },
    debitBtnActive: {
        backgroundColor: '#FF3B30',
        borderColor: '#FF3B30',
    },
    typeBtnText: {
        fontWeight: '600',
        color: '#666',
        fontSize: 15,
    },
    activeText: {
        color: '#fff',
    },
    inputRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    amountInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
    },
    currencySymbol: {
        fontSize: 18,
        color: '#8E8E93',
        fontWeight: '600',
    },
    amountInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginLeft: 4,
    },
    noteInput: {
        flex: 1.5,
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
        fontSize: 16,
        color: '#000',
    },
    addButton: {
        width: 50,
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    creditBtn: {
        backgroundColor: '#34C759',
    },
    debitBtn: {
        backgroundColor: '#FF3B30',
    },
    list: {
        padding: 16,
        paddingTop: 0,
    },
    transactionItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        marginRight: 16,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    creditIcon: {
        backgroundColor: '#E8F8ED',
    },
    debitIcon: {
        backgroundColor: '#FEECEC',
    },
    itemContent: {
        flex: 1,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    itemType: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    itemAmount: {
        fontSize: 16,
        fontWeight: '700',
    },
    creditText: {
        color: '#34C759',
    },
    debitText: {
        color: '#FF3B30',
    },
    itemFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemDate: {
        fontSize: 13,
        color: '#8E8E93',
    },
    itemNote: {
        fontSize: 13,
        color: '#8E8E93',
        flex: 1,
    },
    deleteBtn: {
        padding: 8,
        marginLeft: 8,
    },
});
