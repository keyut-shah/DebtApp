
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { exportAll, importAll, loadSettings, saveSettings } from '../../lib/storage';
import { updateDebtWidget } from '../../lib/widgetUtils';

export default function SettingsScreen() {
    const [settings, setSettings] = useState({
        dobISO: '',
        startDateISO: '',
        dailyRate: '10000',
        currency: 'USD',
        targetMode: 'date',
        targetDateISO: '',
        targetAgeYears: '0'
    });

    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showDobPicker, setShowDobPicker] = useState(false);
    const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const s = await loadSettings();
        setSettings({
            ...s,
            dailyRate: String(s.dailyRate),
            targetAgeYears: String(s.targetAgeYears)
        });
    };
    const handleSave = async () => {
        const newSettings = {
            ...settings,
            dailyRate: Number(settings.dailyRate),
            targetAgeYears: Number(settings.targetAgeYears)
        };
        await saveSettings(newSettings);

        // Properly update widget
        updateDebtWidget();

        Alert.alert('Success', 'Settings saved successfully');
    };

    const handleDateChange = (event: any, selectedDate: Date | undefined, field: string) => {
        if (field === 'startDate') setShowStartDatePicker(false);
        if (field === 'dob') setShowDobPicker(false);
        if (field === 'targetDate') setShowTargetDatePicker(false);

        if (selectedDate) {
            const isoDate = selectedDate.toISOString().split('T')[0];
            if (field === 'startDate') setSettings({ ...settings, startDateISO: isoDate });
            if (field === 'dob') setSettings({ ...settings, dobISO: isoDate });
            if (field === 'targetDate') setSettings({ ...settings, targetDateISO: isoDate });
        }
    };

    const handleExport = async () => {
        try {
            console.log('📤 Starting export...');
            const data = await exportAll();
            console.log('📦 Data exported:', data);

            // Check if documentDirectory is available
            if (!FileSystem.documentDirectory) {
                throw new Error('File system not available');
            }

            const fileUri = FileSystem.documentDirectory + 'debt-calculator-backup.json';
            console.log('📁 Writing to:', fileUri);

            await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));
            console.log('✅ File written successfully');

            // Check if sharing is available
            const isAvailable = await Sharing.isAvailableAsync();
            if (!isAvailable) {
                Alert.alert('Error', 'Sharing is not available on this device');
                return;
            }

            await Sharing.shareAsync(fileUri, {
                mimeType: 'application/json',
                dialogTitle: 'Export Debt Calculator Data',
                UTI: 'public.json'
            });
            console.log('✅ Share dialog opened');
            Alert.alert('Success', 'Data exported successfully!');
        } catch (error) {
            console.error('❌ Export error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            Alert.alert('Error', `Failed to export data: ${errorMessage}`);
        }
    };

    const handleImport = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true
            });

            if (result.canceled) return;

            const fileUri = result.assets[0].uri;
            const content = await FileSystem.readAsStringAsync(fileUri);
            const data = JSON.parse(content);

            Alert.alert(
                'Confirm Import',
                'This will overwrite your current settings and transactions. Continue?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Import',
                        style: 'destructive',
                        onPress: async () => {
                            await importAll(data);
                            await loadData();
                            Alert.alert('Success', 'Data imported successfully');
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to import data');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.headerTitle}>Settings</Text>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>General Configuration</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Start Date</Text>
                        <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartDatePicker(true)}>
                            <Text style={styles.dateButtonText}>{settings.startDateISO || 'Select Date'}</Text>
                            <Ionicons name="calendar-outline" size={20} color="#666" />
                        </TouchableOpacity>
                        {showStartDatePicker && (
                            <DateTimePicker
                                value={settings.startDateISO ? new Date(settings.startDateISO) : new Date()}
                                mode="date"
                                display="default"
                                onChange={(e, date) => handleDateChange(e, date, 'startDate')}
                            />
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Daily Rate</Text>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.currencyPrefix}>{settings.currency === 'USD' ? '$' : settings.currency}</Text>
                            <TextInput
                                style={styles.input}
                                value={settings.dailyRate}
                                onChangeText={(text) => setSettings({ ...settings, dailyRate: text })}
                                keyboardType="numeric"
                                placeholder="0.00"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Currency Code</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.currency}
                            onChangeText={(text) => setSettings({ ...settings, currency: text })}
                            placeholder="USD"
                            autoCapitalize="characters"
                        />
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Target & Age</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Date of Birth</Text>
                        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDobPicker(true)}>
                            <Text style={styles.dateButtonText}>{settings.dobISO || 'Select Date'}</Text>
                            <Ionicons name="calendar-outline" size={20} color="#666" />
                        </TouchableOpacity>
                        {showDobPicker && (
                            <DateTimePicker
                                value={settings.dobISO ? new Date(settings.dobISO) : new Date()}
                                mode="date"
                                display="default"
                                onChange={(e, date) => handleDateChange(e, date, 'dob')}
                            />
                        )}
                    </View>

                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[styles.toggleBtn, settings.targetMode === 'date' && styles.toggleBtnActive]}
                            onPress={() => setSettings({ ...settings, targetMode: 'date' })}
                        >
                            <Text style={[styles.toggleText, settings.targetMode === 'date' && styles.toggleTextActive]}>Target Date</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleBtn, settings.targetMode === 'age' && styles.toggleBtnActive]}
                            onPress={() => setSettings({ ...settings, targetMode: 'age' })}
                        >
                            <Text style={[styles.toggleText, settings.targetMode === 'age' && styles.toggleTextActive]}>Target Age</Text>
                        </TouchableOpacity>
                    </View>

                    {settings.targetMode === 'date' ? (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Target Date</Text>
                            <TouchableOpacity style={styles.dateButton} onPress={() => setShowTargetDatePicker(true)}>
                                <Text style={styles.dateButtonText}>{settings.targetDateISO || 'Select Date'}</Text>
                                <Ionicons name="calendar-outline" size={20} color="#666" />
                            </TouchableOpacity>
                            {showTargetDatePicker && (
                                <DateTimePicker
                                    value={settings.targetDateISO ? new Date(settings.targetDateISO) : new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={(e, date) => handleDateChange(e, date, 'targetDate')}
                                />
                            )}
                        </View>
                    ) : (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Target Age (Years)</Text>
                            <TextInput
                                style={styles.input}
                                value={settings.targetAgeYears}
                                onChangeText={(text) => setSettings({ ...settings, targetAgeYears: text })}
                                keyboardType="numeric"
                                placeholder="e.g. 60"
                            />
                        </View>
                    )}
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save Configuration</Text>
                </TouchableOpacity>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Data Management</Text>
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleExport}>
                            <Ionicons name="download-outline" size={20} color="#333" />
                            <Text style={styles.actionButtonText}>Export</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={handleImport}>
                            <Ionicons name="cloud-upload-outline" size={20} color="#333" />
                            <Text style={styles.actionButtonText}>Import</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
        marginTop: 10,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        color: '#1C1C1E',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#8E8E93',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        borderRadius: 10,
        paddingHorizontal: 12,
    },
    currencyPrefix: {
        fontSize: 16,
        color: '#3C3C43',
        marginRight: 4,
        fontWeight: '500',
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#000',
        backgroundColor: '#F2F2F7',
        borderRadius: 10,
    },
    dateButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        padding: 12,
        borderRadius: 10,
    },
    dateButtonText: {
        fontSize: 16,
        color: '#000',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F2F2F7',
        borderRadius: 10,
        padding: 4,
        marginBottom: 16,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    toggleBtnActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#8E8E93',
    },
    toggleTextActive: {
        color: '#000',
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F2F2F7',
        padding: 12,
        borderRadius: 10,
        gap: 8,
    },
    actionButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
});
