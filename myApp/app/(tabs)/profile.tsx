import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '../../hooks/useColorScheme';
import { ProfileController } from '../../src/controllers/profileController';
import { Picker } from '@react-native-picker/picker';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const profileController = new ProfileController();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const theme = {
    light: {
      background: '#e6e6fa',
      card: '#ffffff',
      text: '#495057',
      textSecondary: '#6c757d',
      primary: '#6a5acd',
      border: '#e9e7ff',
      inputBackground: '#f8f7ff'
    },
    dark: {
      background: '#1a1a1a',
      card: '#2d2d2d',
      text: '#e0e0e0',
      textSecondary: '#a0a0a0',
      primary: '#6a5acd',
      border: '#404040',
      inputBackground: '#3d3d3d'
    }
  };

  const colors = theme[isDarkMode ? 'dark' : 'light'];

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) return;
      try {
        setInitialLoading(true);
        const data = await profileController.getUserProfile(user.uid);
        setProfile(data);
        setDisplayName(data.displayName || '');
        setBirthDate(data.birthDate || '');
        setGender(data.gender || '');
      } catch (error) {
        Alert.alert('Hata', 'Profil bilgileri alınamadı');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      if (!user?.uid) throw new Error('Kullanıcı bulunamadı');
      await profileController.updateUserProfile(user.uid, {
        displayName: displayName,
        birthDate: birthDate,
        gender: gender,
      });
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi');
      setIsEditing(false);
      setProfile({ ...profile, displayName, birthDate, gender });
    } catch (error) {
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}> 
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <ScrollView>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}> 
          <Text style={[styles.title, { color: colors.text }]}>Profil Bilgileri</Text>
        </View>
        <View style={[styles.profileInfo, { backgroundColor: colors.card }]}> 
          {/* Ad Soyad */}
          <View style={styles.infoItem}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Ad Soyad</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Adınızı ve soyadınızı girin"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={[styles.value, { color: colors.text }]}>{displayName || 'Belirtilmemiş'}</Text>
            )}
          </View>
          {/* E-posta */}
          <View style={styles.infoItem}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>E-posta</Text>
            <Text style={[styles.value, { color: colors.text }]}>{user?.email}</Text>
          </View>
          {/* Doğum Tarihi */}
          <View style={styles.infoItem}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Doğum Tarihi</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={birthDate}
                onChangeText={setBirthDate}
                placeholder="GG.AA.YYYY"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={[styles.value, { color: colors.text }]}>{birthDate || 'Belirtilmemiş'}</Text>
            )}
          </View>
          {/* Cinsiyet */}
          <View style={styles.infoItem}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Cinsiyet</Text>
            {isEditing ? (
              <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.inputBackground }}>
                <Picker
                  selectedValue={gender}
                  onValueChange={setGender}
                  style={{ color: colors.text }}
                  dropdownIconColor={colors.text}
                >
                  <Picker.Item label="Seçiniz" value="" />
                  <Picker.Item label="Kadın" value="Kadın" />
                  <Picker.Item label="Erkek" value="Erkek" />
                  <Picker.Item label="Diğer" value="Diğer" />
                </Picker>
              </View>
            ) : (
              <Text style={[styles.value, { color: colors.text }]}>{gender || 'Belirtilmemiş'}</Text>
            )}
          </View>
        </View>
        {isEditing ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary }, loading && styles.disabledButton]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Kaydediliyor...' : 'Kaydet'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: '#6c757d' }]}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.buttonText}>İptal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>Profili Düzenle</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    margin: 16,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#6a5acd',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  infoItem: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  editButton: {
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
}); 