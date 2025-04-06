import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

// Tip tanımlamaları
type MoodType = 'çok-mutlu' | 'iyi' | 'orta' | 'stresli' | 'yorgun' | 'kötü' | null;

interface JournalEntry {
  id: string;
  text: string;
  date: string;
}

interface MoodData {
  mood: MoodType;
  date: string;
}

interface UserProfile {
  name: string;
  email: string;
}

export default function Home() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<MoodType>(null);
  const [journalModalVisible, setJournalModalVisible] = useState(false);
  const [journalEntry, setJournalEntry] = useState('');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [currentDate, setCurrentDate] = useState('');
  const [userName, setUserName] = useState('');
  const [moodHistory, setMoodHistory] = useState<MoodData[]>([]);
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
    'çok-mutlu': [
      "Bu enerjiyi yaratıcı bir aktiviteye yönlendirebilirsin.",
      "Sevdiğin biriyle bu güzel anı paylaşmak ister misin?",
      "Bu olumlu enerjiyi not etmek için günlüğüne bir şeyler yazabilirsin."
    ],
    'iyi': [
      "Kısa bir yürüyüş yaparak bu iyi hissi uzatabilirsin.",
      "Sevdiğin bir müzik dinleyerek bu anın tadını çıkarabilirsin.",
      "Bugün kendine küçük bir ödül vermeyi düşünebilirsin."
    ],
    'orta': [
      "Kısa bir meditasyon seansı ruh halini yükseltebilir.",
      "Sevdiğin bir içecek hazırlayıp mola verebilirsin.",
      "Derin nefes alma egzersizleri yapmayı deneyebilirsin."
    ],
    'stresli': [
      "5 dakikalık bir nefes egzersizi stres seviyeni düşürebilir.",
      "Kısa bir yürüyüş zihnini rahatlatabilir.",
      "Stres topunu sıkmak veya gerginliği atmak için esnemek yardımcı olabilir."
    ],
    'yorgun': [
      "Kısa bir şekerleme enerji seviyeni yükseltebilir.",
      "Bir bardak su içmek yorgunluğunu azaltabilir.",
      "Bugün erken yatmayı planlamak iyi bir fikir olabilir."
    ],
    'kötü': [
      "Kendine nazik davran, bu zor bir gün olabilir.",
      "Sevdiğin biriyle konuşmak iyi gelebilir.",
      "Duygularını günlüğüne dökmek rahatlatıcı olabilir."
    ]
  };

  useEffect(() => {
    // Güncel tarihi ayarla
    const date = new Date();
    setCurrentDate(date.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
    
    // Kaydedilmiş günlük girişlerini yükle
    loadJournalEntries();
    
    // Kullanıcı adını yükle
    loadUserProfile();
    
    // Duygu durumu geçmişini yükle
    loadMoodHistory();
    
    // Günün sözünü ayarla
    setDailyQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  const loadUserProfile = async () => {
    try {
      const profileData = await AsyncStorage.getItem('userProfile');
      if (profileData) {
        const profile: UserProfile = JSON.parse(profileData);
        setUserName(profile.name);
      }
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
    }
  };

  const loadJournalEntries = async () => {
    try {
      const entries = await AsyncStorage.getItem('journalEntries');
      if (entries) {
        setJournalEntries(JSON.parse(entries));
      }
    } catch (error) {
      console.error('Günlük girişleri yüklenirken hata:', error);
    }
  };

  const loadMoodHistory = async () => {
    try {
      const moods = await AsyncStorage.getItem('moodData');
      if (moods) {
        const moodArray: MoodData[] = JSON.parse(moods);
        setMoodHistory(moodArray);
      }
    } catch (error) {
      console.error('Duygu durumu geçmişi yüklenirken hata:', error);
    }
  };

  const handleMoodSelection = async (mood: MoodType) => {
    try {
      setSelectedMood(mood);
      
      if (mood) {
        // Duygu durumunu kaydet
        const date = new Date().toISOString();
        const moodData = { mood, date };
        
        const existingMoods = await AsyncStorage.getItem('moodData');
        const moodArray = existingMoods ? JSON.parse(existingMoods) : [];
        moodArray.push(moodData);
        
        await AsyncStorage.setItem('moodData', JSON.stringify(moodArray));
        setMoodHistory(moodArray);
        
        // Önerileri güncelle
        if (moodSuggestions[mood]) {
          const randomSuggestions = [];
          const suggestions = moodSuggestions[mood];
          randomSuggestions.push(suggestions[Math.floor(Math.random() * suggestions.length)]);
          setSuggestions(randomSuggestions);
        }
        
        // Animasyonlu geri bildirim göster
        setFeedbackVisible(true);
        Animated.sequence([
          Animated.timing(feedbackOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          }),
          Animated.delay(2000),
          Animated.timing(feedbackOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true
          })
        ]).start(() => {
          setFeedbackVisible(false);
        });
      }
    } catch (error) {
      console.error('Duygu durumu kaydedilirken hata:', error);
      Alert.alert('Hata', 'Duygu durumu kaydedilemedi.');
    }
  };

  const saveJournalEntry = async () => {
    try {
      if (!journalEntry.trim()) {
        Alert.alert('Hata', 'Lütfen bir şeyler yazın.');
        return;
      }
      
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        text: journalEntry,
        date: new Date().toISOString(),
      };
      
      const updatedEntries = [newEntry, ...journalEntries];
      setJournalEntries(updatedEntries);
      await AsyncStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      
      setJournalEntry('');
      setJournalModalVisible(false);
      Alert.alert('Başarılı', 'Günlük girişiniz kaydedildi.');
    } catch (error) {
      console.error('Günlük kaydedilirken hata:', error);
      Alert.alert('Hata', 'Günlük kaydedilemedi.');
    }
  };

  const handleLogout = () => {
    try {
      // Çıkış işlemleri burada yapılacak
      AsyncStorage.removeItem('userToken');
      router.replace('/login');
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  const getMoodChartData = () => {
    // Son 7 günün verilerini al
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }
    
    const moodValues = {
      'çok-mutlu': 5,
      'iyi': 4,
      'orta': 3,
      'stresli': 2,
      'yorgun': 2,
      'kötü': 1
    };
    
    const data = last7Days.map(day => {
      const dayMood = moodHistory.find(m => m.date.split('T')[0] === day);
      return dayMood && dayMood.mood ? moodValues[dayMood.mood] : 0;
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
      case 'çok-mutlu': return <Ionicons name="happy" size={32} color="#4caf50" />;
      case 'iyi': return <Ionicons name="happy-outline" size={32} color="#4caf50" />;
      case 'orta': return <Ionicons name="sad-outline" size={32} color="#ff9800" />;
      case 'stresli': return <FontAwesome5 name="tired" size={32} color="#f44336" />;
      case 'yorgun': return <FontAwesome5 name="meh" size={32} color="#ff9800" />;
      case 'kötü': return <Ionicons name="sad" size={32} color="#f44336" />;
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Zihinsel Sağlık Takip</Text>
        <View>
          <TouchableOpacity 
            onPress={handleLogout} 
            onLongPress={() => setShowTooltip(true)}
            onPressOut={() => setShowTooltip(false)}
            style={styles.logoutButton}
          >
            <Ionicons name="log-out-outline" size={28} color="#6a5acd" />
          </TouchableOpacity>
          {showTooltip && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>Çıkış Yap</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{currentDate}</Text>
          <View style={styles.weatherContainer}>
            <Ionicons name="sunny" size={20} color="#ff9800" />
            <Text style={styles.weatherText}>{weatherInfo.temp}, {weatherInfo.condition}</Text>
          </View>
        </View>
        
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>
            {userName ? `Merhaba ${userName}, bugün nasılsın?` : 'Bugün Nasılsınız?'}
          </Text>
          <Text style={styles.welcomeText}>
            Duygu durumunuzu seçerek günlük takibinizi yapabilirsiniz.
          </Text>
          
          <View style={styles.moodContainer}>
            <TouchableOpacity 
              style={[styles.moodButton, selectedMood === 'çok-mutlu' ? styles.selectedMood : null]} 
              onPress={() => handleMoodSelection('çok-mutlu')}
            >
              <Ionicons name="happy" size={32} color="#4caf50" />
              <Text style={styles.moodText}>Çok Mutlu</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.moodButton, selectedMood === 'iyi' ? styles.selectedMood : null]} 
              onPress={() => handleMoodSelection('iyi')}
            >
              <Ionicons name="happy-outline" size={32} color="#4caf50" />
              <Text style={styles.moodText}>İyi</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.moodButton, selectedMood === 'orta' ? styles.selectedMood : null]} 
              onPress={() => handleMoodSelection('orta')}
            >
              <Ionicons name="sad-outline" size={32} color="#ff9800" />
              <Text style={styles.moodText}>Orta</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.moodContainer}>
            <TouchableOpacity 
              style={[styles.moodButton, selectedMood === 'stresli' ? styles.selectedMood : null]} 
              onPress={() => handleMoodSelection('stresli')}
            >
              <FontAwesome5 name="tired" size={32} color="#f44336" />
              <Text style={styles.moodText}>Stresli</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.moodButton, selectedMood === 'yorgun' ? styles.selectedMood : null]} 
              onPress={() => handleMoodSelection('yorgun')}
            >
              <FontAwesome5 name="meh" size={32} color="#ff9800" />
              <Text style={styles.moodText}>Yorgun</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.moodButton, selectedMood === 'kötü' ? styles.selectedMood : null]} 
              onPress={() => handleMoodSelection('kötü')}
            >
              <Ionicons name="sad" size={32} color="#f44336" />
              <Text style={styles.moodText}>Kötü</Text>
            </TouchableOpacity>
          </View>
          
          {feedbackVisible && (
            <Animated.View style={[styles.feedbackContainer, { opacity: feedbackOpacity }]}>
              <Text style={styles.feedbackText}>Duygu durumunuz kaydedildi!</Text>
            </Animated.View>
          )}
        </View>
        
        {suggestions.length > 0 && (
          <View style={styles.suggestionCard}>
            <Text style={styles.cardTitle}>Sizin İçin Öneriler</Text>
            {suggestions.map((suggestion, index) => (
              <Text key={index} style={styles.suggestionText}>
                • {suggestion}
              </Text>
            ))}
          </View>
        )}
        
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>"{dailyQuote}"</Text>
        </View>
        
        {moodHistory.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.cardTitle}>Duygu Durumu Takibi</Text>
            <Text style={styles.chartSubtitle}>Son 7 günün özeti</Text>
            <LineChart
              data={getMoodChartData()}
              width={Dimensions.get('window').width - 60}
              height={180}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(106, 90, 205, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(73, 80, 87, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#6a5acd',
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )}
        
        <View style={styles.activityCard}>
          <Text style={styles.cardTitle}>Günlük Aktiviteler</Text>
          
          <TouchableOpacity style={styles.activityItem} onPress={() => setJournalModalVisible(true)}>
            <View style={styles.activityIcon}>
              <MaterialCommunityIcons name="book-open-variant" size={28} color="#5f9ea0" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Günlük Yazı</Text>
              <Text style={styles.activityDesc}>Bugün neler hissettiğinizi yazın</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#dee2e6" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.activityItem} onPress={() => setMeditationModalVisible(true)}>
            <View style={styles.activityIcon}>
              <MaterialCommunityIcons name="meditation" size={28} color="#6a5acd" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Meditasyon</Text>
              <Text style={styles.activityDesc}>Zihinsel dinginlik için meditasyon yapın</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#dee2e6" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.activityItem} onPress={() => setExerciseModalVisible(true)}>
            <View style={styles.activityIcon}>
              <MaterialCommunityIcons name="run" size={28} color="#4caf50" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Egzersiz</Text>
              <Text style={styles.activityDesc}>Fiziksel aktivitelerinizi kaydedin</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#dee2e6" />
          </TouchableOpacity>
        </View>
        
        {journalEntries.length > 0 && (
          <View style={styles.journalCard}>
            <Text style={styles.cardTitle}>Son Günlük Girişleriniz</Text>
            
            {journalEntries.slice(0, 2).map((entry) => (
              <View key={entry.id} style={styles.journalItem}>
                <View style={styles.journalHeader}>
                  <Text style={styles.journalDate}>
                    {new Date(entry.date).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                  <Ionicons name="calendar-outline" size={16} color="#6c757d" />
                </View>
                <Text style={styles.journalText} numberOfLines={2}>
                  {entry.text}
                </Text>
              </View>
            ))}
            
            <TouchableOpacity style={styles.viewAllButtonContainer}>
              <Text style={styles.viewAllText}>Tümünü Görüntüle</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Günlük Giriş Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={journalModalVisible}
        onRequestClose={() => setJournalModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Günlük Giriş</Text>
              <TouchableOpacity onPress={() => setJournalModalVisible(false)}>
                <Ionicons name="close" size={24} color="#495057" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.journalInput}
              placeholder="Bugün neler hissettiniz? Neler yaşadınız?"
              multiline={true}
              value={journalEntry}
              onChangeText={setJournalEntry}
            />
            
            <TouchableOpacity style={styles.saveButton} onPress={saveJournalEntry}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Meditasyon Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={meditationModalVisible}
        onRequestClose={() => setMeditationModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Meditasyon Seansı</Text>
              <TouchableOpacity onPress={() => setMeditationModalVisible(false)}>
                <Ionicons name="close" size={24} color="#495057" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Süre (dakika)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Örn: 10"
              keyboardType="numeric"
              value={meditationDuration}
              onChangeText={setMeditationDuration}
            />
            
            <Text style={styles.inputLabel}>Notlar (İsteğe bağlı)</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="Meditasyon sırasında neler hissettiniz?"
              multiline={true}
              value={meditationNotes}
              onChangeText={setMeditationNotes}
            />
            
            <TouchableOpacity style={styles.saveButton} onPress={saveMeditationSession}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Egzersiz Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={exerciseModalVisible}
        onRequestClose={() => setExerciseModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Egzersiz Kaydı</Text>
              <TouchableOpacity onPress={() => setExerciseModalVisible(false)}>
                <Ionicons name="close" size={24} color="#495057" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Egzersiz Türü</Text>
            <View style={styles.exerciseTypeContainer}>
              <TouchableOpacity 
                style={[
                  styles.exerciseTypeButton, 
                  selectedExercise === 'Yürüyüş' && styles.selectedExerciseType
                ]}
                onPress={() => setSelectedExercise('Yürüyüş')}
              >
                <MaterialCommunityIcons 
                  name="walk" 
                  size={24} 
                  color={selectedExercise === 'Yürüyüş' ? '#fff' : '#6c757d'} 
                />
                <Text style={[
                  styles.exerciseTypeText,
                  selectedExercise === 'Yürüyüş' && styles.selectedExerciseTypeText
                ]}>Yürüyüş</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.exerciseTypeButton, 
                  selectedExercise === 'Koşu' && styles.selectedExerciseType
                ]}
                onPress={() => setSelectedExercise('Koşu')}
              >
                <MaterialCommunityIcons 
                  name="run" 
                  size={24} 
                  color={selectedExercise === 'Koşu' ? '#fff' : '#6c757d'} 
                />
                <Text style={[
                  styles.exerciseTypeText,
                  selectedExercise === 'Koşu' && styles.selectedExerciseTypeText
                ]}>Koşu</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.exerciseTypeButton, 
                  selectedExercise === 'Yoga' && styles.selectedExerciseType
                ]}
                onPress={() => setSelectedExercise('Yoga')}
              >
                <MaterialCommunityIcons 
                  name="yoga" 
                  size={24} 
                  color={selectedExercise === 'Yoga' ? '#fff' : '#6c757d'} 
                />
                <Text style={[
                  styles.exerciseTypeText,
                  selectedExercise === 'Yoga' && styles.selectedExerciseTypeText
                ]}>Yoga</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Süre (dakika)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Örn: 30"
              keyboardType="numeric"
              value={exerciseDuration}
              onChangeText={setExerciseDuration}
            />
            
            <TouchableOpacity style={styles.saveButton} onPress={saveExerciseSession}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#495057',
  },
  logoutButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dateContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  weatherText: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 5,
  },
  welcomeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 20,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 10,
  },
  moodButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    width: '30%',
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  selectedMood: {
    backgroundColor: '#e6e6fa',
    borderWidth: 2,
    borderColor: '#6a5acd',
    transform: [{ scale: 1.05 }],
  },
  moodText: {
    marginTop: 8,
    color: '#495057',
    fontWeight: '500',
  },
  feedbackContainer: {
    backgroundColor: '#e6e6fa',
    padding: 10,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  feedbackText: {
    color: '#6a5acd',
    fontWeight: '600',
  },
  suggestionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  suggestionText: {
    fontSize: 15,
    color: '#495057',
    marginBottom: 8,
    lineHeight: 22,
  },
  quoteCard: {
    backgroundColor: '#e6e6fa',
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 16,
    color: '#6a5acd',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 16,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  activityIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f1f3f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
  },
  activityDesc: {
    fontSize: 14,
    color: '#6c757d',
  },
  journalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  journalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  journalDate: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  journalText: {
    fontSize: 15,
    color: '#495057',
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  viewAllButtonContainer: {
    backgroundColor: '#e9ecef',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: 'center',
    marginTop: 15,
  },
  viewAllText: {
    color: '#6a5acd',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
  },
  journalInput: {
    backgroundColor: '#f1f3f5',
    borderRadius: 10,
    padding: 15,
    height: 200,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#495057',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#6a5acd',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  tooltip: {
    position: 'absolute',
    right: 0,
    top: 40,
    backgroundColor: '#f1f3f5',
    padding: 5,
    borderRadius: 5,
    width: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tooltipText: {
    color: '#495057',
    fontSize: 12,
  },
  inputLabel: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#f1f3f5',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#495057',
    marginBottom: 20,
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  exerciseTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  exerciseTypeButton: {
    backgroundColor: '#f1f3f5',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '30%',
  },
  selectedExerciseType: {
    backgroundColor: '#4caf50',
  },
  exerciseTypeText: {
    color: '#6c757d',
    marginTop: 5,
    fontWeight: '500',
  },
  selectedExerciseTypeText: {
    color: '#ffffff',
  },
});