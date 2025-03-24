import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const Register = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = () => {
    if (!email || !password || !confirmPassword) {
      setErrorMessage('Lütfen tüm alanları doldurun.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Şifreler uyuşmuyor.');
      return;
    }

    // Kayıt işlemi için örnek bir kontrol
    Alert.alert('Başarılı', 'Hesabınız başarıyla oluşturuldu!', [
      { text: 'Tamam', onPress: () => navigation.navigate('Login') },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kayıt Ekranı</Text>

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

      {/* Şifre Tekrarı */}
      <TextInput
        style={styles.input}
        placeholder="Şifreyi Tekrar Girin"
        secureTextEntry={true} // Şifreyi gizler
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {/* Kayıt Butonu */}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Kayıt Ol</Text>
      </TouchableOpacity>

      {/* Giriş Yap Butonu */}
      <TouchableOpacity 
        style={styles.loginButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.loginButtonText}>Zaten hesabınız var mı? Giriş yap</Text>
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
  loginButton: {
    marginTop: 20,
  },
  loginButtonText: {
    color: '#4a90e2',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default Register;
