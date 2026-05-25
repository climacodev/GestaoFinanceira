import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'ONBOARDING' | 'LOGIN' | 'DASHBOARD'>('ONBOARDING');
  
  // Dashboard state
  const [balance, setBalance] = useState(4250.80);
  const [incomes, setIncomes] = useState(8500.00);
  const [expenses, setExpenses] = useState(1250.20);
  const [transactions, setTransactions] = useState([
    { id: '1', title: 'Salário Google Inc', amount: 8500.00, type: 'INCOME', category: 'Salário' },
    { id: '2', title: 'Supermercado Pão de Açúcar', amount: 450.20, type: 'EXPENSE', category: 'Alimentação' },
    { id: '3', title: 'Netflix Trimestral', amount: 55.90, type: 'EXPENSE', category: 'Contas' },
    { id: '4', title: 'Combustível Posto Ipiranga', amount: 120.00, type: 'EXPENSE', category: 'Transporte' },
  ]);

  // Modal / Transaction entry state
  const [modalVisible, setModalVisible] = useState(false);
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [txCategory, setTxCategory] = useState('Outros');

  // Login variables
  const [email, setEmail] = useState('claudio@lima.com');
  const [password, setPassword] = useState('123456');

  const handleAddTransaction = () => {
    if (!txTitle || !txAmount) {
      Alert.alert('Erro', 'Por favor preencha todos os campos.');
      return;
    }

    const amt = parseFloat(txAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Erro', 'Valor inválido.');
      return;
    }

    const newTx = {
      id: Date.now().toString(),
      title: txTitle,
      amount: amt,
      type: txType,
      category: txCategory
    };

    setTransactions([newTx, ...transactions]);
    if (txType === 'INCOME') {
      setBalance(balance + amt);
      setIncomes(incomes + amt);
    } else {
      setBalance(balance - amt);
      setExpenses(expenses + amt);
    }

    setTxTitle('');
    setTxAmount('');
    setModalVisible(false);
    Alert.alert('Sucesso', 'Lançamento cadastrado com sucesso!');
  };

  const simulateBiometrics = () => {
    Alert.alert(
      'Biometria Detectada',
      'Deseja fazer login rápido usando FaceID/Digital?',
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim, Entrar', onPress: () => setCurrentScreen('DASHBOARD') }
      ]
    );
  };

  // Render Screens
  if (currentScreen === 'ONBOARDING') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.onboardingContent}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>C</Text>
          </View>
          <Text style={styles.title}>Contable</Text>
          <Text style={styles.subtitle}>Gestão Financeira Pessoal com IA</Text>
          
          <Text style={styles.description}>
            Monitore múltiplos cartões de crédito, contas bancárias e economize com alertas inteligentes gerados por inteligência artificial.
          </Text>

          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => setCurrentScreen('LOGIN')}
          >
            <Text style={styles.primaryButtonText}>Começar Agora</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'LOGIN') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loginContent}>
          <Text style={styles.sectionTitle}>Login</Text>
          <Text style={styles.label}>E-mail</Text>
          <TextInput 
            value={email}
            onChangeText={setEmail}
            placeholder="voce@exemplo.com"
            placeholderTextColor="#666"
            style={styles.input}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput 
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#666"
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => setCurrentScreen('DASHBOARD')}
          >
            <Text style={styles.primaryButtonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={simulateBiometrics}
          >
            <Text style={styles.secondaryButtonText}>Entrar com Biometria</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Bem-vindo de volta,</Text>
          <Text style={styles.headerTitle}>Claudio Lima</Text>
        </View>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addBtnText}>+ Lançar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.cardLabel}>SALDO DISPONÍVEL</Text>
          <Text style={styles.cardValue}>R$ {balance.toFixed(2)}</Text>
          
          <View style={styles.cardFlow}>
            <View>
              <Text style={styles.flowLabel}>Receitas</Text>
              <Text style={styles.flowValueUp}>+ R$ {incomes.toFixed(2)}</Text>
            </View>
            <View>
              <Text style={styles.flowLabel}>Despesas</Text>
              <Text style={styles.flowValueDown}>- R$ {expenses.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* AI Insight banner */}
        <View style={styles.aiBanner}>
          <Text style={styles.aiBannerTitle}>✨ Dica do Assistente IA</Text>
          <Text style={styles.aiBannerText}>
            Você gastou 12% a mais com alimentação este mês. Tente cozinhar em casa esta semana para equilibrar!
          </Text>
        </View>

        {/* Transactions list */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Atividade Recente</Text>
        </View>

        {transactions.map((tx) => (
          <View key={tx.id} style={styles.txRow}>
            <View>
              <Text style={styles.txTitle}>{tx.title}</Text>
              <Text style={styles.txCat}>{tx.category}</Text>
            </View>
            <Text style={tx.type === 'INCOME' ? styles.txValUp : styles.txValDown}>
              {tx.type === 'INCOME' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
            </Text>
          </View>
        ))}

        <TouchableOpacity 
          style={styles.logoutBtn}
          onPress={() => setCurrentScreen('ONBOARDING')}
        >
          <Text style={styles.logoutBtnText}>Fazer Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* QUICK ADD MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Nova Transação</Text>
            
            <Text style={styles.label}>Descrição</Text>
            <TextInput 
              value={txTitle}
              onChangeText={setTxTitle}
              placeholder="Ex: Almoço Executivo"
              placeholderTextColor="#666"
              style={styles.input}
            />

            <Text style={styles.label}>Valor (R$)</Text>
            <TextInput 
              value={txAmount}
              onChangeText={setTxAmount}
              placeholder="0.00"
              placeholderTextColor="#666"
              keyboardType="numeric"
              style={styles.input}
            />

            <Text style={styles.label}>Tipo de Lançamento</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity 
                style={[styles.toggleBtn, txType === 'EXPENSE' && styles.toggleBtnActive]}
                onPress={() => setTxType('EXPENSE')}
              >
                <Text style={styles.toggleText}>Despesa</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleBtn, txType === 'INCOME' && styles.toggleBtnActive]}
                onPress={() => setTxType('INCOME')}
              >
                <Text style={styles.toggleText}>Receita</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleAddTransaction}
            >
              <Text style={styles.primaryButtonText}>Salvar Lançamento</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080B11',
  },
  onboardingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a5b4fc',
    marginBottom: 24,
  },
  description: {
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    width: '100%',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#6366F1',
    width: '100%',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#a5b4fc',
    fontWeight: 'bold',
    fontSize: 15,
  },
  loginContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  label: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  addBtn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollView: {
    paddingHorizontal: 24,
  },
  balanceCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 20,
  },
  cardLabel: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cardValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'extrabold',
    marginVertical: 10,
  },
  cardFlow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    paddingTop: 16,
    marginTop: 8,
  },
  flowLabel: {
    color: '#6b7280',
    fontSize: 10,
  },
  flowValueUp: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 14,
  },
  flowValueDown: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 14,
  },
  aiBanner: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  aiBannerTitle: {
    color: '#a5b4fc',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 4,
  },
  aiBannerText: {
    color: '#d1d5db',
    fontSize: 11,
    lineHeight: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  txTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  txCat: {
    color: '#6b7280',
    fontSize: 11,
    marginTop: 2,
  },
  txValUp: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  txValDown: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutBtn: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoutBtnText: {
    color: '#ef4444',
    fontWeight: 'semibold',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0B0F19',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  toggleBtn: {
    flex: 1,
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#6366F1',
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cancelBtn: {
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelBtnText: {
    color: '#9ca3af',
    fontSize: 13,
  }
});
