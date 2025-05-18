import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Alert, Animated } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, orderBy, getDocs, Timestamp, addDoc } from 'firebase/firestore';
import { db } from '../../src/config/firebase';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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

export default function Stats() {
  const [weeklyData, setWeeklyData] = useState<WeeklyDataState>({
    sleepData: [],
    stressData: [],
    waterData: [],
    moodData: []
  });
  const router = useRouter();
  const breathingAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadWeeklyData();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı');
        return;
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const q = query(
        collection(db, 'moods'),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo)),
        orderBy('createdAt', 'asc')
      );

      const querySnapshot = await getDocs(q);
      
      // Veri yoksa varsayılan değerlerle doldur
      if (querySnapshot.empty) {
        setWeeklyData({
          sleepData: Array(7).fill(0),
          stressData: Array(7).fill(0),
          waterData: Array(7).fill(0),
          moodData: Array(7).fill(3)
        });
        return;
      }

      const data = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        date: doc.data().createdAt.toDate()
      })) as DailyData[];

      // Verileri tarihe göre sırala
      const sortedData = data.sort((a, b) => a.date.getTime() - b.date.getTime());

      // Son 7 günün verilerini al
      const last7DaysData = sortedData.slice(-7);

      const sleepData = last7DaysData.map(d => d.sleepHours || 0);
      const stressData = last7DaysData.map(d => d.stressLevel || 0);
      const waterData = last7DaysData.map(d => d.waterIntake || 0);
      const moodValues = {
        'Çok İyi': 5,
        'İyi': 4,
        'Normal': 3,
        'Kötü': 2,
        'Çok Kötü': 1
      };
      const moodData = last7DaysData.map(d => moodValues[d.mood] || 3);

      setWeeklyData({
        sleepData,
        stressData,
        waterData,
        moodData
      });
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu: ' + error.message);
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

  const stopBreathingExercise = async () => {
    breathingAnimation.stopAnimation();
    breathingAnimation.setValue(1);

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Hata', 'Kullanıcı oturumu bulunamadı');
        return;
      }
      await addDoc(collection(db, 'breathing_exercises_logs'), {
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#6a5acd" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Haftalık Özet</Text>
      </View>
      {renderChart(weeklyData.sleepData, 'Uyku Süresi (Saat)', '#5f9ea0')}
      {renderChart(weeklyData.stressData, 'Stres Seviyesi', '#ff9800')}
      {renderChart(weeklyData.waterData, 'Su Tüketimi (Litre)', '#4caf50')}
      {renderChart(weeklyData.moodData, 'Ruh Hali Değişimi', '#6a5acd')}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Haftalık İstatistikler</Text>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Ortalama Uyku:</Text>
          <Text style={styles.summaryValue}>
            {weeklyData.sleepData.length > 0 
              ? (Number(weeklyData.sleepData.reduce((a, b) => Number(a) + Number(b), 0)) / weeklyData.sleepData.length).toFixed(1)
              : '0.0'} saat
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Ortalama Stres:</Text>
          <Text style={styles.summaryValue}>
            {weeklyData.stressData.length > 0
              ? (Number(weeklyData.stressData.reduce((a, b) => Number(a) + Number(b), 0)) / weeklyData.stressData.length).toFixed(1)
              : '0.0'} / 5
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Toplam Su Tüketimi:</Text>
          <Text style={styles.summaryValue}>
            {Number(
              weeklyData.waterData && weeklyData.waterData.length > 0
                ? weeklyData.waterData.reduce((a, b) => Number(a) + Number(b), 0)
                : 0
            ).toFixed(1)} litre
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={stopBreathingExercise}>
        <Text>Nefes Egzersizini Bitir</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6e6fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6a5acd',
  },
  chartContainer: {
    marginBottom: 30,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#6a5acd',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
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
  summaryContainer: {
    backgroundColor: '#f8f7ff',
    padding: 15,
    borderRadius: 10,
    margin: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6a5acd',
  },
}); 