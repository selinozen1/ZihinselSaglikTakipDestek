import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
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

  useEffect(() => {
    loadWeeklyData();
  }, []);

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
        Alert.alert('Hata', 'Haftalık veri yüklenirken hata: ' + error.message);
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
            {(weeklyData.sleepData.reduce((a, b) => a + b, 0) / weeklyData.sleepData.length || 0).toFixed(1)} saat
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Ortalama Stres:</Text>
          <Text style={styles.summaryValue}>
            {(weeklyData.stressData.reduce((a, b) => a + b, 0) / weeklyData.stressData.length || 0).toFixed(1)} / 5
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Toplam Su Tüketimi:</Text>
          <Text style={styles.summaryValue}>
            {weeklyData.waterData.reduce((a, b) => a + b, 0).toFixed(1)} litre
          </Text>
        </View>
      </View>
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