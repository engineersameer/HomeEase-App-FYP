import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Colors, Fonts } from '../../Color/Color';
import Footer from '../shared/Footer';
import { useTheme } from '../../context/ThemeContext';

const API_URL = 'http://192.168.10.16:5000/api/customer/bookings';

export default function CustomerBookings() {
  const router = useRouter();
  const { theme } = useTheme();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const statusFilters = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  const statusColors = {
    pending: '#FFA500',
    accepted: '#2196F3',
    'in-progress': '#9C27B0',
    completed: '#4CAF50',
    cancelled: '#F44336'
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      setBookings([
        {
          _id: '1',
          provider: {
            name: 'Ahmed Electrician',
            image: 'https://via.placeholder.com/100'
          },
          service: {
            category: 'Electrical'
          },
          date: new Date(),
          status: 'pending',
          description: 'Fix electrical wiring in kitchen',
          estimatedCost: 800
        },
        {
          _id: '2',
          provider: {
            name: 'Ali Plumber',
            image: 'https://via.placeholder.com/100'
          },
          service: {
            category: 'Plumbing'
          },
          date: new Date(Date.now() - 86400000),
          status: 'completed',
          description: 'Fix leaking tap in bathroom',
          estimatedCost: 600
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`${API_URL}/${bookingId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Alert.alert('Success', 'Booking status updated successfully!');
      fetchBookings();
    } catch (error) {
      Alert.alert('Error', 'Failed to update booking status');
    }
  };

  const handleReview = (booking) => {
    if (booking.status === 'completed') {
      router.push({
        pathname: '/customer/review-booking',
        params: { bookingId: booking._id }
      });
    } else {
      Alert.alert('Info', 'You can only review completed bookings');
    }
  };

  const filteredBookings = bookings.filter(booking => 
    selectedStatus === 'all' || booking.status === selectedStatus
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Minimalist Header */}
      <View style={{
        backgroundColor: theme.card,
        paddingTop: 20,
        paddingBottom: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>
          My Orders
        </Text>
        <TouchableOpacity onPress={onRefresh} style={{ padding: 8 }}>
          <Text style={{ fontSize: 20, color: theme.textDark }}>⟳</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 24 }}>
          {/* Status Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {statusFilters.map((filter) => (
              <TouchableOpacity
                key={filter.value}
                onPress={() => setSelectedStatus(filter.value)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 18,
                  borderRadius: 20,
                  backgroundColor: selectedStatus === filter.value ? theme.primary : theme.card,
                  borderWidth: 1,
                  borderColor: selectedStatus === filter.value ? theme.primary : theme.border,
                  marginRight: 10,
                }}
              >
                <Text style={{ color: selectedStatus === filter.value ? '#fff' : theme.textDark, fontSize: 14, fontFamily: Fonts.body }}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Bookings List */}
          {loading ? (
            <Text style={{ color: theme.textLight, fontFamily: Fonts.body, textAlign: 'center', marginTop: 40 }}>
              Loading orders...
            </Text>
          ) : filteredBookings.length === 0 ? (
            <Text style={{ color: theme.textLight, fontFamily: Fonts.body, textAlign: 'center', marginTop: 40 }}>
              No orders found.
            </Text>
          ) : (
            filteredBookings.map(booking => (
              <TouchableOpacity
                key={booking._id}
                onPress={() => router.push({ pathname: '/customer/booking-detail', params: { bookingId: booking._id } })}
                style={{
                  borderBottomWidth: 1,
                  borderColor: theme.border,
                  paddingVertical: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                }}
              >
                <Image
                  source={{ uri: booking.provider?.image || 'https://via.placeholder.com/100' }}
                  style={{ width: 54, height: 54, borderRadius: 27, marginRight: 16, backgroundColor: theme.card }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: theme.textDark, fontFamily: Fonts.subheading }}>
                    {booking.provider?.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: theme.textLight, fontFamily: Fonts.body, marginBottom: 2 }}>
                    {booking.service?.category} • {new Date(booking.date).toLocaleDateString()}
                  </Text>
                  <Text style={{ fontSize: 13, color: theme.textLight, fontFamily: Fonts.body }}>
                    {booking.description}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', minWidth: 60 }}>
                  <Text style={{ fontSize: 15, color: statusColors[booking.status] || theme.primary, fontWeight: 'bold', fontFamily: Fonts.body, textTransform: 'capitalize' }}>
                    {booking.status}
                  </Text>
                  <Text style={{ fontSize: 13, color: theme.textLight, fontFamily: Fonts.body }}>
                    PKR {booking.estimatedCost}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
      <Footer theme={theme} router={router} current="orders" />
    </View>
  );
} 