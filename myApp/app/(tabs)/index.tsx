import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Image, Animated, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import moodService from '../../src/services/moodService';
import { Mood, MoodSummary } from '../../src/models/Mood';
import { Picker } from '@react-native-picker/picker';
import { addDoc, collection, query, where, orderBy, getDocs, Timestamp, doc } from 'firebase/firestore';
import { db } from '../../src/config/firebase';

// Tip tanımlamaları
type MoodType = 'Çok İyi' | 'İyi' | 'Normal' | 'Kötü' | 'Çok Kötü';

interface JournalEntry {
  id: string;
  text: string;
  date: string;
}

interface UserProfile {
  name: string;
  email: string;
}

interface DailyData {
  userId: string;
  date: Date;
  sleepHours: number;
  stressLevel: number;
  waterIntake: number;
  mood: 'Çok İyi' | 'İyi' | 'Normal' | 'Kötü' | 'Çok Kötü';
  notes?: string;
}

interface WeeklyDataState {
  sleepData: number[];
  stressData: number[];
  waterData: number[];
  moodData: number[];
}

// Tema renkleri
const theme = {
  light: {
    background: '#e6e6fa',
    card: '#ffffff',
    text: '#495057',
    textSecondary: '#6c757d',
    primary: '#6a5acd',
    border: '#e9e7ff'
  },
  dark: {
    background: '#1a1a1a',
    card: '#2d2d2d',
    text: '#e0e0e0',
    textSecondary: '#a0a0a0',
    primary: '#6a5acd',
    border: '#404040'
  }
};

export default function Home() {
  const router = useRouter();
  const [journalModalVisible, setJournalModalVisible] = useState(false);
  const [journalEntry, setJournalEntry] = useState('');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [currentDate, setCurrentDate] = useState('');
  const [userName, setUserName] = useState('');
  const [moodHistory, setMoodHistory] = useState<Mood[]>([]);
  const [moodSummary, setMoodSummary] = useState<MoodSummary | null>(null);
  const [dailyQuote, setDailyQuote] = useState('');
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackOpacity] = useState(new Animated.Value(0));
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [weatherInfo, setWeatherInfo] = useState({ temp: '16°C', condition: 'Güneşli' });
  const [showTooltip, setShowTooltip] = useState(false);
  const [meditationModalVisible, setMeditationModalVisible] = useState(false);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [meditationDuration, setMeditationDuration] = useState('');
  const [meditationNotes, setMeditationNotes] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [dailyData, setDailyData] = useState({
    sleepHours: '',
    stressLevel: '3',
    waterIntake: '',
    nutritionQuality: '3',
    mood: 'İyi',
    notes: '',
    activityType: '',
    activityDuration: ''
  });
  const [loading, setLoading] = useState(false);
  const [weeklyData, setWeeklyData] = useState<WeeklyDataState>({
    sleepData: [],
    stressData: [],
    waterData: [],
    moodData: []
  });
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const colors = theme[isDarkMode ? 'dark' : 'light'];
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [breathingState, setBreathingState] = useState('idle'); // 'idle', 'inhale', 'exhale'
  const [breathingText, setBreathingText] = useState('Başla');
  const breathingAnimation = React.useRef(new Animated.Value(1)).current;
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [activityDuration, setActivityDuration] = useState('');
  const [activityLoading, setActivityLoading] = useState(false);

  const quotes = [
    "Bugün kendine iyi davran, yarın için teşekkür edeceksin.",
    "Küçük adımlar büyük değişimlere yol açar.",
    "Kendini sevmek, iyileşmenin ilk adımıdır.",
    "Her gün yeni bir başlangıçtır.",
    "Duygularını kabul et, onları yargılama.",
    "Nefes al, şu an buradasın ve bu yeterli.",
    "Kendine karşı nazik ol, bu da geçecek.",
    "Bugün sadece var olmak bile bir başarıdır."
  ];

  const moodSuggestions = {
    'Çok İyi': [
      "Bu enerjiyi yaratıcı bir aktiviteye yönlendirebilirsin.",
      "Sevdiğin biriyle bu güzel anı paylaşmak ister misin?",
      "Bu olumlu enerjiyi not etmek için günlüğüne bir şeyler yazabilirsin."
    ],
    'İyi': [
      "Kısa bir yürüyüş yaparak bu iyi hissi uzatabilirsin.",
      "Sevdiğin bir müzik dinleyerek bu anın tadını çıkarabilirsin.",
      "Bugün kendine küçük bir ödül vermeyi düşünebilirsin."
    ],
    'Normal': [
      "Kısa bir meditasyon seansı ruh halini yükseltebilir.",
      "Sevdiğin bir içecek hazırlayıp mola verebilirsin.",
      "Derin nefes alma egzersizleri yapmayı deneyebilirsin."
    ],
    'Kötü': [
      "Kendine nazik davran, bu zor bir gün olabilir.",
      "Sevdiğin biriyle konuşmak iyi gelebilir.",
      "Duygularını günlüğüne dökmek rahatlatıcı olabilir."
    ]
  };

  useEffect(() => {
    checkAuth();
    setupData();
    loadWeeklyData();
    loadThemePreference();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (!storedUserId) {
        router.replace('/login');
        return;
      }
      setUserId(storedUserId);
    } catch (error) {
      console.error('Auth kontrolü sırasında hata:', error);
      router.replace('/login');
    }
  };

  const setupData = async () => {
    try {
      // Tarih ayarla
      const date = new Date();
      setCurrentDate(date.toLocaleDateString('tr-TR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));

      // Kullanıcı profilini yükle
      const profileData = await AsyncStorage.getItem('userProfile');
      if (profileData) {
        const profile = JSON.parse(profileData);
        setUserName(profile.name);
      }

      // Ruh hali geçmişini yükle
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const moodCollection = collection(db, 'moods');
        const q = query(
          moodCollection,
          where('userId', '==', storedUserId),
          where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo)),
          orderBy('createdAt', 'asc'),
          orderBy('__name__', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const weeklyMoods = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate().toISOString(),
          updatedAt: doc.data().updatedAt.toDate().toISOString()
        })) as Mood[];

        setMoodHistory(weeklyMoods.reverse());
        const summary = moodService.calculateMoodSummary(weeklyMoods);
        setMoodSummary(summary);
      }

      // Günün sözünü ayarla
      setDailyQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
    }
  };

  const handleMoodSelection = async (selectedMood: MoodType) => {
    try {
      if (!userId) {
        Alert.alert('Hata', 'Lütfen tekrar giriş yapın');
        router.replace('/login');
        return;
      }
      
      const newMood: Mood = {
        userId,
        mood: selectedMood,
        note: journalEntry,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await moodService.addMood(newMood);
      await setupData(); // Verileri yeniden yükle
      
      setJournalEntry('');
      setJournalModalVisible(false);
      Alert.alert('Başarılı', 'Ruh haliniz kaydedildi');
    } catch (error) {
      console.error('Duygu durumu kaydedilirken hata:', error);
      Alert.alert('Hata', 'Duygu durumu kaydedilemedi.');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('userProfile');
      router.replace('/login');
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  const getMoodChartData = () => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }
    
    const moodValues = {
      'Çok İyi': 5,
      'İyi': 4,
      'Normal': 3,
      'Kötü': 2,
      'Çok Kötü': 1
    };
    
    const data = last7Days.map(day => {
      const dayMood = moodHistory.find(m => {
        const moodDate = new Date(m.createdAt).toISOString().split('T')[0];
        return moodDate === day;
      });
      return dayMood ? moodValues[dayMood.mood] : 0;
    });
    
    return {
      labels: last7Days.map(day => {
        const date = new Date(day);
        return date.getDate() + '/' + (date.getMonth() + 1);
      }),
      datasets: [
        {
          data,
          color: (opacity = 1) => `rgba(106, 90, 205, ${opacity})`,
          strokeWidth: 2
        }
      ]
    };
  };

  const getMoodIcon = (mood: MoodType) => {
    switch(mood) {
      case 'Çok Kötü': return <Ionicons name="sad" size={32} color="#b71c1c" />;
      case 'Çok İyi': return <Ionicons name="happy" size={32} color="#4caf50" />;
      case 'İyi': return <Ionicons name="happy-outline" size={32} color="#4caf50" />;
      case 'Normal': return <Ionicons name="sad-outline" size={32} color="#ff9800" />;
      case 'Kötü': return <Ionicons name="sad" size={32} color="#f44336" />;
      default: return null;
    }
  };

  const saveMeditationSession = async () => {
    try {
      if (!meditationDuration) {
        Alert.alert('Hata', 'Lütfen meditasyon süresini girin.');
        return;
      }
      
      const newSession = {
        id: Date.now().toString(),
        duration: meditationDuration,
        notes: meditationNotes,
        date: new Date().toISOString(),
      };
      
      const existingSessions = await AsyncStorage.getItem('meditationSessions');
      const sessions = existingSessions ? JSON.parse(existingSessions) : [];
      sessions.push(newSession);
      
      await AsyncStorage.setItem('meditationSessions', JSON.stringify(sessions));
      
      setMeditationDuration('');
      setMeditationNotes('');
      setMeditationModalVisible(false);
      Alert.alert('Başarılı', 'Meditasyon seansınız kaydedildi.');
    } catch (error) {
      console.error('Meditasyon kaydedilirken hata:', error);
      Alert.alert('Hata', 'Meditasyon seansı kaydedilemedi.');
    }
  };
  
  const saveExerciseSession = async () => {
    try {
      if (!selectedExercise) {
        Alert.alert('Hata', 'Lütfen bir egzersiz türü seçin.');
        return;
      }
      
      if (!exerciseDuration) {
        Alert.alert('Hata', 'Lütfen egzersiz süresini girin.');
        return;
      }
      
      const newSession = {
        id: Date.now().toString(),
        type: selectedExercise,
        duration: exerciseDuration,
        date: new Date().toISOString(),
      };
      
      const existingSessions = await AsyncStorage.getItem('exerciseSessions');
      const sessions = existingSessions ? JSON.parse(existingSessions) : [];
      sessions.push(newSession);
      
      await AsyncStorage.setItem('exerciseSessions', JSON.stringify(sessions));
      
      setSelectedExercise('');
      setExerciseDuration('');
      setExerciseModalVisible(false);
      Alert.alert('Başarılı', 'Egzersiz seansınız kaydedildi.');
    } catch (error) {
      console.error('Egzersiz kaydedilirken hata:', error);
      Alert.alert('Hata', 'Egzersiz seansı kaydedilemedi.');
    }
  };

  const handleDailySave = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      
      if (!userId) {
        Alert.alert('Hata', 'Kullanıcı oturumu bulunamadı');
        return;
      }

      if (!dailyData.sleepHours || !dailyData.waterIntake) {
        Alert.alert('Hata', 'Lütfen uyku süresi ve su tüketimi alanlarını doldurun');
        return;
      }

      // moods koleksiyonuna veri ekle
      const moodDoc = {
        userId,
        mood: dailyData.mood,
        sleepHours: parseFloat(dailyData.sleepHours),
        stressLevel: parseInt(dailyData.stressLevel),
        waterIntake: parseFloat(dailyData.waterIntake),
        notes: dailyData.notes || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Firestore'a veriyi ekle
      const docRef = await addDoc(collection(db, 'moods'), moodDoc);
      
      if (docRef.id) {
        Alert.alert('Başarılı', 'Günlük verileriniz kaydedildi');
        
        // Form'u sıfırla
        setDailyData({
          sleepHours: '',
          stressLevel: '3',
          waterIntake: '',
          nutritionQuality: '3',
          mood: 'İyi',
          notes: '',
          activityType: '',
          activityDuration: ''
        });

        // Haftalık verileri güncelle
        await loadWeeklyData();
      }
    } catch (error: any) {
      console.error('Veri kaydedilirken hata:', error);
      Alert.alert('Hata', 'Veri kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const q = query(
        collection(db, 'moods'),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo)),
        orderBy('createdAt', 'asc'),
        orderBy('__name__', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        date: doc.data().createdAt.toDate()
      })) as DailyData[];

      // Verileri tarihe göre sırala (en yeniden eskiye)
      const sortedData = data.reverse();

      const sleepData = sortedData.map(d => d.sleepHours || 0);
      const stressData = sortedData.map(d => d.stressLevel || 0);
      const waterData = sortedData.map(d => d.waterIntake || 0);
      const moodValues = {
        'Çok İyi': 5,
        'İyi': 4,
        'Normal': 3,
        'Kötü': 2,
        'Çok Kötü': 1
      };
      const moodData = sortedData.map(d => moodValues[d.mood] || 3);

      setWeeklyData({
        sleepData,
        stressData,
        waterData,
        moodData
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Haftalık veri yüklenirken hata:', error.message);
        if (error.message.includes('requires an index')) {
          console.error('Firebase indeksi gerekiyor. Lütfen Firebase konsolundan indeks oluşturun.');
        }
      }
    }
  };

  const renderChart = (data: number[], title: string, color: string) => {
    const chartData = {
      labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
      datasets: [{
        data: data.length ? data : [0, 0, 0, 0, 0, 0, 0],
        color: (opacity = 1) => color,
        strokeWidth: 2
      }]
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(95, 158, 160, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(73, 80, 87, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#5f9ea0'
            }
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  // Nefes egzersizi animasyonu
  const startBreathingExercise = () => {
    setIsBreathingActive(true);
    animateBreathing();
  };

  const animateBreathing = () => {
    const breathingCycle = () => {
      Animated.sequence([
        // Nefes Al (4 saniye)
        Animated.timing(breathingAnimation, {
          toValue: 1.5,
          duration: 4000,
          useNativeDriver: true
        }),
        // Tut (1 saniye)
        Animated.delay(1000),
        // Nefes Ver (4 saniye)
        Animated.timing(breathingAnimation, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true
        }),
        // Bekle (1 saniye)
        Animated.delay(1000)
      ]).start(() => {
        if (isBreathingActive) {
          breathingCycle();
        }
      });
    };

    // Metin güncellemeleri için zamanlayıcı
    const updateText = () => {
      if (!isBreathingActive) return;
      
      setBreathingText('Nefes Al');
      
      setTimeout(() => {
        if (isBreathingActive) setBreathingText('Tut');
      }, 4000);
      
      setTimeout(() => {
        if (isBreathingActive) setBreathingText('Nefes Ver');
      }, 5000);
      
      setTimeout(() => {
        if (isBreathingActive) setBreathingText('Bekle');
      }, 9000);
      
      // Döngüyü tekrarla
      setTimeout(() => {
        if (isBreathingActive) updateText();
      }, 10000);
    };

    breathingCycle();
    updateText();
  };

  const stopBreathingExercise = async () => {
    setIsBreathingActive(false);
    setBreathingText('Başla');
    breathingAnimation.stopAnimation();
    breathingAnimation.setValue(1);

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Hata', 'Kullanıcı oturumu bulunamadı');
        return;
      }
      await addDoc(collection(db, 'breath_exercise_logs'), {
        userId,
        timestamp: new Date(),
        status: 'success'
      });
      Alert.alert('Başarılı', 'Nefes egzersizi başarıyla kaydedildi!');
    } catch (error) {
      console.error('Nefes egzersizi eklenemedi:', error);
      Alert.alert('Hata', 'Nefes egzersizi kaydedilemedi.');
    }
  };

  // Dark mode yönetimi
  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themePreference');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Tema tercihi yüklenirken hata:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('themePreference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Tema değiştirilirken hata:', error);
    }
  };

  const handleActivitySave = async () => {
    try {
      setActivityLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Hata', 'Kullanıcı oturumu bulunamadı');
        return;
      }
      await addDoc(collection(db, 'moods'), {
        userId,
        activityType: selectedActivity,
        duration: activityDuration,
        timestamp: new Date()
      });
      Alert.alert('Başarılı', 'Aktivite kaydedildi!');
      setSelectedActivity(null);
      setActivityDuration('');
    } catch (error) {
      Alert.alert('Hata', 'Aktivite kaydedilemedi.');
    } finally {
      setActivityLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.welcomeText, { color: colors.text }]}>Hoş geldin, {userName}!</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Bugün kendini nasıl hissediyorsun?</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
              <Ionicons 
                name={isDarkMode ? "sunny" : "moon"} 
                size={24} 
                color={colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Destek Alanı */}
      <View style={[styles.supportSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Günlük Destek</Text>
        
        {/* Nefes Egzersizi */}
        <TouchableOpacity 
          style={styles.supportCard}
          onPress={isBreathingActive ? stopBreathingExercise : startBreathingExercise}
        >
          <Animated.View style={[styles.breathingCircle, {
            transform: [{ scale: breathingAnimation }],
            backgroundColor: colors.primary
          }]}>
            <Text style={styles.breathingText}>
              {breathingText}
            </Text>
          </Animated.View>
          <Text style={[styles.supportTitle, { color: colors.text }]}>
            Nefes Egzersizi
          </Text>
          <Text style={[styles.breathingInstructions, { color: colors.textSecondary }]}>
            4 saniye nefes al, 1 saniye tut,{'\n'}4 saniye nefes ver, 1 saniye bekle
          </Text>
        </TouchableOpacity>

        {/* Günün Sözü */}
        <View style={styles.supportCard}>
          <Text style={[styles.quoteText, { color: colors.text }]}>
            "{dailyQuote}"
          </Text>
          <Text style={[styles.supportTitle, { color: colors.textSecondary }]}>
            Günün Sözü
          </Text>
        </View>
      </View>

      <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
        <Text style={styles.sectionTitle}>Günlük Durum Takibi</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Uyku Süresi (Saat)</Text>
          <TextInput
            style={styles.input}
            value={dailyData.sleepHours}
            onChangeText={(value) => setDailyData({...dailyData, sleepHours: value})}
            keyboardType="numeric"
            placeholder="Örn: 7.5"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Stres Seviyesi</Text>
          <View style={styles.stressLevelContainer}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.stressLevelButton,
                  parseInt(dailyData.stressLevel) === level && styles.selectedStressLevel
                ]}
                onPress={() => setDailyData({...dailyData, stressLevel: level.toString()})}
              >
                <Text style={[
                  styles.stressLevelText,
                  parseInt(dailyData.stressLevel) === level && styles.selectedStressLevelText
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.helperText}>1: Çok Düşük, 5: Çok Yüksek</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Su Tüketimi (Litre)</Text>
          <TextInput
            style={styles.input}
            value={dailyData.waterIntake}
            onChangeText={(value) => setDailyData({...dailyData, waterIntake: value})}
            keyboardType="numeric"
            placeholder="Örn: 2.5"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ruh Hali</Text>
          <View style={styles.moodContainer}>
            {['Çok İyi', 'İyi', 'Normal', 'Kötü', 'Çok Kötü'].map((mood) => (
              <TouchableOpacity
                key={mood}
                style={[
                  styles.moodButton,
                  dailyData.mood === mood && styles.selectedMood
                ]}
                onPress={() => setDailyData({...dailyData, mood: mood})}
              >
                {getMoodIcon(mood as MoodType)}
                <Text style={[
                  styles.moodText,
                  dailyData.mood === mood && styles.selectedMoodText
                ]}>
                  {mood}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Notlar (İsteğe bağlı)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={dailyData.notes}
            onChangeText={(value) => setDailyData({...dailyData, notes: value})}
            multiline
            numberOfLines={4}
            placeholder="Bugün hakkında eklemek istediğiniz notlar..."
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleDailySave}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Kaydediliyor...' : 'Günlük Verileri Kaydet'}
          </Text>
        </TouchableOpacity>
        {/* Haftalık Özet Butonu */}
        <TouchableOpacity
          style={[styles.submitButton, { marginTop: 10, backgroundColor: '#4caf50' }]}
          onPress={() => router.push('./stats')}
        >
          <Text style={[styles.submitButtonText, { color: '#fff' }]}>Haftalık Özet</Text>
        </TouchableOpacity>
      </View>

      <View style={{ margin: 16 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Aktivite Seç</Text>
        <View>
          {['Egzersiz', 'Meditasyon', 'Okuma', 'Yürüyüş'].map((activity) => (
            <TouchableOpacity
              key={activity}
              style={{
                backgroundColor: dailyData.activityType === activity ? '#6a5acd' : '#f3f3fa',
                paddingVertical: 18,
                borderRadius: 14,
                marginBottom: 12,
                alignItems: 'center',
                borderWidth: dailyData.activityType === activity ? 2 : 1,
                borderColor: dailyData.activityType === activity ? '#6a5acd' : '#e9e7ff',
                shadowColor: '#6a5acd',
                shadowOpacity: dailyData.activityType === activity ? 0.15 : 0.05,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 8,
                elevation: dailyData.activityType === activity ? 4 : 1,
              }}
              onPress={() => setDailyData({ ...dailyData, activityType: activity })}
            >
              <Text style={{ color: dailyData.activityType === activity ? '#fff' : '#6a5acd', fontWeight: 'bold', fontSize: 16 }}>{activity}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {dailyData.activityType && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ marginBottom: 5, fontWeight: '500', color: '#6a5acd' }}>{dailyData.activityType} Süresi (dakika):</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#e9e7ff',
                borderRadius: 10,
                padding: 12,
                marginBottom: 10,
                fontSize: 16,
                backgroundColor: '#fff',
                color: '#495057',
              }}
              value={dailyData.activityDuration}
              onChangeText={(val) => setDailyData({ ...dailyData, activityDuration: val })}
              keyboardType="numeric"
              placeholder="Süre girin"
              placeholderTextColor="#a0a0a0"
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6a5acd',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#6a5acd',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f8f7ff',
    borderWidth: 1,
    borderColor: '#e9e7ff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#495057',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  stressLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stressLevelButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9e7ff',
  },
  selectedStressLevel: {
    backgroundColor: '#6a5acd',
    borderColor: '#6a5acd',
  },
  stressLevelText: {
    fontSize: 18,
    color: '#495057',
    fontWeight: '500',
  },
  selectedStressLevelText: {
    color: '#fff',
  },
  helperText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodButton: {
    width: '30%',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f8f7ff',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9e7ff',
  },
  selectedMood: {
    backgroundColor: '#6a5acd',
    borderColor: '#6a5acd',
  },
  moodText: {
    marginTop: 5,
    fontSize: 12,
    color: '#495057',
  },
  selectedMoodText: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#6a5acd',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  chartContainer: {
    marginBottom: 30,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 10,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  supportSection: {
    margin: 16,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#6a5acd',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  supportCard: {
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(106, 90, 205, 0.1)',
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  breathingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  breathingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  breathingInstructions: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 18,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(106, 90, 205, 0.1)',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
});