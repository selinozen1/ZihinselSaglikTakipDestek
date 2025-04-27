import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import firebaseService from '../src/services/firebaseService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const labelPosition = new Animated.Value(0);

  // Şifre güçlülük kontrolü
  const checkPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    setPasswordStrength(strength);
  };

  // Şifre eşleşme kontrolü
  useEffect(() => {
    if (confirmPassword) {
      setPasswordMatch(password === confirmPassword);
    }
  }, [password, confirmPassword]);

  // Şifre değişikliğini izle
  useEffect(() => {
    if (password) {
      checkPasswordStrength(password);
    }
  }, [password]);

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return '#ff4444';
      case 1: return '#ffbb33';
      case 2: return '#ffbb33';
      case 3: return '#00C851';
      case 4: return '#007E33';
      default: return '#ff4444';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return 'Çok Zayıf';
      case 1: return 'Zayıf';
      case 2: return 'Orta';
      case 3: return 'Güçlü';
      case 4: return 'Çok Güçlü';
      default: return 'Çok Zayıf';
    }
  };

  const handleRegister = async () => {
    try {
      if (!name || !email || !password || !confirmPassword) {
        Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
        return;
      }
      
      if (password !== confirmPassword) {
        Alert.alert('Hata', 'Şifreler eşleşmiyor');
        return;
      }

      if (password.length < 6) {
        Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
        return;
      }
      
      setLoading(true);
      await firebaseService.register(email, password, name);
      Alert.alert('Başarılı', 'Kayıt işlemi başarıyla tamamlandı', [
        { text: 'Tamam', onPress: () => router.replace('/login') }
      ]);
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Zihinsel Sağlık Takip</Text>
          <Text style={styles.subtitle}>Yeni Hesap Oluştur</Text>
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Ad Soyad</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#6a5acd" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Adınızı ve soyadınızı girin"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#9991da"
              />
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>E-posta</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#6a5acd" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="E-posta adresinizi girin"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9991da"
              />
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Şifre</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#6a5acd" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Şifrenizi girin"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#9991da"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#6a5acd" 
                />
              </TouchableOpacity>
            </View>
            {password && (
              <View style={styles.passwordStrength}>
                <View style={[styles.strengthBar, { backgroundColor: getPasswordStrengthColor(), width: `${25 * passwordStrength}%` }]} />
                <Text style={[styles.strengthText, { color: getPasswordStrengthColor() }]}>
                  {getPasswordStrengthText()}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Şifre Tekrar</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#6a5acd" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Şifrenizi tekrar girin"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#9991da"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Ionicons 
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#6a5acd" 
                />
              </TouchableOpacity>
            </View>
            {confirmPassword && !passwordMatch && (
              <Text style={styles.errorText}>Şifreler eşleşmiyor</Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={loading || !passwordMatch}
          >
            <LinearGradient
              colors={['#8a7cdd', '#6a5acd']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
                <Text style={styles.buttonText}>
                  {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Zaten hesabınız var mı?</Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6e6fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6a5acd',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#6a5acd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#6a5acd',
    marginBottom: 6,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f7ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9e7ff',
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#495057',
    paddingRight: 15,
  },
  button: {
    height: 55,
    borderRadius: 10,
    marginTop: 20,
    overflow: 'hidden',
    shadowColor: '#6a5acd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#6c757d',
    fontSize: 14,
  },
  loginLink: {
    color: '#6a5acd',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  eyeIcon: {
    padding: 10,
  },
  passwordStrength: {
    marginTop: 8,
    backgroundColor: '#f1f3f5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  strengthBar: {
    height: 4,
    borderRadius: 4,
  },
  strengthText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
  },
});