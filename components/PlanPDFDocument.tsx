import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { DetailedPlan } from '../types';

const styles = StyleSheet.create({
    page: { padding: 40, backgroundColor: '#FFFFFF' },
    header: { fontSize: 22, marginBottom: 20, color: '#111827', fontWeight: 'bold' },
    section: { marginBottom: 15 },
    title: { fontSize: 14, marginBottom: 6, color: '#2563EB', fontWeight: 'bold', textTransform: 'uppercase' },
    content: { fontSize: 10, lineHeight: 1.6, color: '#374151' },
    table: { display: 'flex', width: 'auto', marginTop: 20, borderStyle: 'solid', borderWidth: 1, borderColor: '#E5E7EB' },
    tableRow: { flexDirection: 'row', backgroundColor: '#F9FAFB' },
    tableCell: { flex: 1, padding: 8, fontSize: 9, borderStyle: 'solid', borderWidth: 1, borderColor: '#E5E7EB' },
    boldCell: { fontWeight: 'bold', backgroundColor: '#F3F4F6' }
});

export const PlanPDFDocument = ({ plan, ideaTitle }: { plan: DetailedPlan; ideaTitle?: string }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.header}>Passive Genius Strategy: {ideaTitle || plan.ideaId}</Text>

            <View style={styles.section}>
                <Text style={styles.title}>Executive Overview</Text>
                <Text style={styles.content}>{plan.overview}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Marketing Strategy</Text>
                <Text style={styles.content}>{plan.marketingStrategy}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Implementation Roadmap</Text>
                {plan.steps.map((step, i) => (
                    <View key={i} style={{ marginBottom: 5 }}>
                        <Text style={[styles.content, { fontWeight: 'bold' }]}>{step.phase}:</Text>
                        <Text style={styles.content}>{step.tasks.join(' • ')}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.boldCell]}>Month</Text>
                    <Text style={[styles.tableCell, styles.boldCell]}>Revenue</Text>
                    <Text style={[styles.tableCell, styles.boldCell]}>Expenses</Text>
                    <Text style={[styles.tableCell, styles.boldCell]}>Net Profit</Text>
                </View>
                {plan.projections.map((p, i) => (
                    <View key={i} style={styles.tableRow}>
                        <Text style={styles.tableCell}>{p.month}</Text>
                        <Text style={styles.tableCell}>${p.revenue}</Text>
                        <Text style={styles.tableCell}>${p.expenses}</Text>
                        <Text style={[styles.tableCell, { color: p.profit >= 0 ? '#059669' : '#DC2626' }]}>
                            ${p.profit}
                        </Text>
                    </View>
                ))}
            </View>
        </Page>
    </Document>
);