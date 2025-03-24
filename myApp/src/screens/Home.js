import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const Home = ({ navigation }) => {
  const handleLogout = () => {
    Alert.alert('Çıkış', 'Çıkış yapmak istediğinizden emin misiniz?', [
      { text: 'Hayır', style: 'cancel' },
      { text: 'Evet', onPress: () => navigation.navigate('Login') },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hoşgeldiniz</Text>

      {/* Kullanıcıya hoş geldin mesajı */}
      <Text style={styles.subtitle}>Uygulamanıza Hoşgeldiniz!</Text>

      {/* Profil Butonu */}
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Profile')} // Profil sayfasına yönlendir
      >
        <Text style={styles.buttonText}>Profilim</Text>
      </TouchableOpacity>

      {/* Çıkış Yap Butonu */}
      <TouchableOpacity 
        style={styles.button}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Çıkış Yap</Text>
      </TouchableOpacity>

      {/* Diğer sayfalara yönlendiren butonlar */}
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('OtherPage')} // Diğer sayfaya yönlendir
      >
        <Text style={styles.buttonText}>Diğer Sayfa</Text>
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    color: '#777',
  },
  button: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Home;
