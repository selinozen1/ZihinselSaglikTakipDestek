import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      setErrorMessage('Lütfen tüm alanları doldurun.');
      return;
    }

    // Örnek bir kontrol: Email ve şifre doğru girilmiş mi?
    if (email === 'user@example.com' && password === 'password123') {
      // Başarılı giriş işlemi
      navigation.navigate('Home'); // Ana sayfaya yönlendirilebilir
    } else {
      // Hatalı giriş
      setErrorMessage('Geçersiz e-posta veya şifre.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giriş Ekranı</Text>

      {/* Hata mesajı */}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {/* E-posta Giriş */}
      <TextInput
        style={styles.input}
        placeholder="E-posta"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {/* Şifre Girişi */}
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        secureTextEntry={true} // Şifreyi gizler
        value={password}
        onChangeText={setPassword}
      />

      {/* Giriş Butonu */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Giriş Yap</Text>
      </TouchableOpacity>

      {/* Kayıt Ol Butonu */}
      <TouchableOpacity 
        style={styles.registerButton}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.registerButtonText}>Hesabın yok mu? Kayıt ol</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    paddingLeft: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  registerButton: {
    marginTop: 20,
  },
  registerButtonText: {
    color: '#4a90e2',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default Login;
