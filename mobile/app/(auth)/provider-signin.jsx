import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Colors, Fonts } from '../../Color/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FloatingInput from '../shared/FloatingInput';
import Button from '../shared/Button';

const API_URL = 'http://192.168.10.16:5000/api/auth/login';

export default function ProviderSignin() {
  const router = useRouter();
  const theme = Colors.light;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(API_URL, { email, password });

      if (response.status === 200) {
        const { token, role, user } = response.data;
        
        if (role === 'provider') {
          await AsyncStorage.setItem('token', token);
          await AsyncStorage.setItem('user', JSON.stringify(user));
          await AsyncStorage.setItem('userRole', role);
          
          Alert.alert('Success', 'Welcome back!');
          router.replace('/provider/provider-home');
        } else {
          Alert.alert('Error', 'This account is not registered as a service provider');
        }
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Signin failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{
          paddingTop: 100,
          paddingBottom: 10,
          alignItems: 'center',
        }}>
          <Image
            source={require('../../assets/logo.png')}
            style={{ 
              width: 400, 
              height: 400, 
              marginBottom: 10,
              borderRadius: 200,
            }}
            resizeMode="contain"
          />
          <Text style={{ 
            fontSize: 28,
            fontWeight: '400',
            color: theme.textDark,
            fontFamily: Fonts.heading,
            textAlign: 'center',
            marginBottom: 10,
            letterSpacing: -0.5,
          }}>
            Welcome Back, Seller
          </Text>
          <Text style={{ 
            fontSize: 15,
            color: theme.textLight,
            fontFamily: Fonts.body,
            textAlign: 'center',
            lineHeight: 22,
            maxWidth: 280,
            fontWeight: '300',
          }}>
            Sign in to your service provider account
          </Text>
        </View>

        {/* Minimal Form Area */}
        <View style={{
          padding: 0,
          marginHorizontal: 32,
          marginBottom: 32,
          backgroundColor: 'transparent',
        }}>
          <FloatingInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FloatingInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Minimal Buttons and Link */}
        <View style={{ marginHorizontal: 32, alignItems: 'center' }}>
          <Button
            title={loading ? 'Signing In...' : 'Sign In as Seller'}
            onPress={handleSignin}
            loading={loading}
            variant="primary"
            style={{ marginBottom: 10, width: '100%' }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: theme.textLight, fontFamily: Fonts.body }}>Don't have a seller account? </Text>
            <Text
              style={{ fontSize: 14, color: theme.accent, fontFamily: Fonts.body, textDecorationLine: 'underline' }}
              onPress={() => router.push('/seller-signup')}
            >
              Create Seller Account
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
} 