import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '../../hooks/useColorScheme';
import { ProfileController } from '../../src/controllers/profileController';
import { Picker } from '@react-native-picker/picker';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';


const activityList = [
  { name: 'Egzersiz', color: '#ff7043' },
  { name: 'Meditasyon', color: '#8e24aa' },
  { name: 'Okuma', color: '#1976d2' },
  { name: 'Yürüyüş', color: '#43a047' }
] as const;

type ActivityName = typeof activityList[number]['name'];

export default function ProfileScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const profileController = new ProfileController();
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(
    systemColorScheme === 'dark' ? 'dark' : 'light'
  );
  const isDarkMode = themeMode === 'dark';
  const [dailyData, setDailyData] = useState<{
    sleepHours: string;
    stressLevel: string;
    waterIntake: string;
    nutritionQuality: string;
    mood: string;
    notes: string;
    sleepGoal: string;
    activities: Record<ActivityName, { done: boolean; duration?: string; pageCount?: string }>;
  }>({
    sleepHours: '',
    stressLevel: '3',
    waterIntake: '',
    nutritionQuality: '3',
    mood: 'İyi',
    notes: '',
    sleepGoal: '',
    activities: {
      Egzersiz: { done: false, duration: '' },
      Meditasyon: { done: false, duration: '' },
      Okuma: { done: false, pageCount: '' },
      Yürüyüş: { done: false, duration: '' }
    }
  });
  const navigation = useNavigation();

  const theme = {
    light: {
      background: '#e6e6fa',
      card: '#ffffff',
      text: '#22223b',
      textSecondary: '#495057',
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

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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
        setDailyData((prev) => ({
          ...prev,
          sleepGoal: data.sleepGoal || '',
        }));
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
        sleepGoal: dailyData.sleepGoal,
      });
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi');
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
        <View style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        ]}>
          <Text style={[styles.title, { color: colors.text }]}>Profil Bilgileri</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={toggleTheme}
              style={{
                backgroundColor: isDarkMode ? '#2d2d2d' : '#f3f0ff',
                borderRadius: 20,
                padding: 8,
                marginRight: 8,
                shadowColor: '#6a5acd',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <Ionicons
                name={isDarkMode ? 'sunny' : 'moon'}
                size={22}
                color="#6a5acd"
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.profileInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Ad Soyad</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Adınızı ve soyadınızı girin"
              placeholderTextColor="#aaa"
            />
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>E-posta</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Doğum Tarihi</Text>
            <TextInput
              style={styles.input}
              value={birthDate}
              onChangeText={setBirthDate}
              placeholder="GG.AA.YYYY"
              placeholderTextColor="#aaa"
            />
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Cinsiyet</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={gender}
                onValueChange={setGender}
                style={{ color: '#495057' }}
              >
                <Picker.Item label="Seçiniz" value="" />
                <Picker.Item label="Kadın" value="Kadın" />
                <Picker.Item label="Erkek" value="Erkek" />
                <Picker.Item label="Diğer" value="Diğer" />
              </Picker>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Uyku Hedefi (saat)</Text>
            <TextInput
              style={styles.input}
              value={dailyData.sleepGoal}
              onChangeText={(value) => setDailyData({ ...dailyData, sleepGoal: value })}
              keyboardType="numeric"
              placeholder="Örn: 8"
              placeholderTextColor="#aaa"
            />
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }, loading && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Kaydediliyor...' : 'Profil Bilgilerini Kaydet'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    borderBottomWidth: 0,
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#5f3dc4',
    letterSpacing: 0.5,
  },
  profileInfo: {
    margin: 18,
    padding: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(245,240,255,0.95)',
    borderWidth: 1.5,
    borderColor: '#e0d7fa',
    shadowColor: '#6a5acd',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
  },
  infoItem: {
    marginBottom: 22,
    flexDirection: 'column',
    gap: 4,
  },
  label: {
    fontSize: 17,
    color: '#3d246c',
    marginBottom: 3,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  value: {
    fontSize: 16,
    color: '#22223b',
    fontWeight: '500',
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0bfff',
    borderRadius: 12,
    padding: 13,
    fontSize: 16,
    color: '#22223b',
    backgroundColor: '#f3f0ff',
    marginTop: 2,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d0bfff',
    borderRadius: 12,
    backgroundColor: '#f3f0ff',
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 24,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#6a5acd',
    shadowColor: '#6a5acd',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  disabledButton: {
    opacity: 0.7,
  },
}); 