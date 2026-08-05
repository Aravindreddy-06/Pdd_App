import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import {
  User,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader,
  Mail,
  Lock,
  ShieldCheck,
} from 'lucide-react-native';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../lib/supabaseClient';

// Required once per app so the in-app browser session resolves properly
// when control returns to the app after Google sign-in.
WebBrowser.maybeCompleteAuthSession();
// If you already have a location hook/context ported over, swap this import in:
// import { useUser } from '../hooks/useUser';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// Move this to app.json -> expo.extra.adminEmail and read via expo-constants if you
// want it configurable per environment, same as VITE_ADMIN_EMAIL was on web.
const ADMIN_EMAIL = 'resourceshareadmin@gmail.com';

const GREEN = '#4ade80';

function looksLikePhone(value) {
  return /^[+\d]/.test(value.trim()) && !value.includes('@');
}

async function domainHasMX(domain) {
  try {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`,
      { headers: { Accept: 'application/dns-json' } }
    );
    if (!res.ok) return false;
    const json = await res.json();
    return json.Status === 0 && Array.isArray(json.Answer) && json.Answer.length > 0;
  } catch {
    return false;
  }
}

function ContactStatusIcon({ status }) {
  if (status === 'checking') return <ActivityIndicator size="small" color="#9ca3af" />;
  if (status === 'valid') return <CheckCircle size={18} color={GREEN} />;
  if (status === 'invalid') return <XCircle size={18} color="#ef4444" />;
  return null;
}

import { useUser } from '../context/UserContext';

export default function AuthScreen() {
  const navigation = useNavigation();
  const { loginAsGuest } = useUser();


  const [authMode, setAuthMode] = useState('signup'); // 'signup' | 'login'
  const [stage, setStage] = useState('details'); // 'details' | 'password'

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    password: '',
    confirmPassword: '',
  });
  const [loginContact, setLoginContact] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [contactStatus, setContactStatus] = useState('idle');
  const [contactError, setContactError] = useState('');
  const [nameError, setNameError] = useState('');
  const [pwError, setPwError] = useState('');
  const [confirmPwError, setConfirmPwError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef(null);

  const validateContact = useCallback(async (value) => {
    const v = value.trim();
    if (!v) {
      setContactStatus('idle');
      setContactError('');
      return;
    }
    if (looksLikePhone(v)) {
      const parsed = parsePhoneNumberFromString(v);
      if (parsed?.isValid()) {
        setContactStatus('valid');
        setContactError('');
      } else {
        setContactStatus('invalid');
        setContactError('Enter a valid mobile phone number with country code');
      }
      return;
    }
    if (!EMAIL_REGEX.test(v)) {
      setContactStatus('invalid');
      setContactError('Invalid email format (e.g. name@domain.com)');
      return;
    }
    setContactStatus('checking');
    setContactError('');
    const domain = v.split('@')[1];
    const mxOk = await domainHasMX(domain);
    if (mxOk) {
      setContactStatus('valid');
      setContactError('');
    } else {
      setContactStatus('invalid');
      setContactError(`Domain "@${domain}" cannot receive emails`);
    }
  }, []);

  const onNameChange = (value) => {
    setFormData((p) => ({ ...p, name: value }));
    setSubmitError('');
    setNameError(value.trim().length >= 2 ? '' : 'Name must be at least 2 characters');
  };

  const onContactChange = (value) => {
    setFormData((p) => ({ ...p, contact: value }));
    setSubmitError('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => validateContact(value), 500);
  };

  const onPasswordChange = (value) => {
    setFormData((p) => ({ ...p, password: value }));
    setSubmitError('');
    setPwError(value.length >= 8 ? '' : 'Password must be at least 8 characters');
  };

  const onConfirmPwChange = (value) => {
    setFormData((p) => ({ ...p, confirmPassword: value }));
    setSubmitError('');
    setConfirmPwError(value === formData.password ? '' : 'Passwords do not match');
  };

  const handleDetailsSubmit = () => {
    if (formData.name.trim().length < 2) {
      setNameError('Please enter your full name');
      return;
    }
    if (contactStatus !== 'valid') {
      setContactError('Please fix contact errors first');
      return;
    }
    setStage('password');
  };

  const clearLocalCaches = async () => {
    await AsyncStorage.multiRemove([
      'rs_profile',
      'rs_wishlist',
      'rs_cart',
      'resource_share_items',
    ]);
  };

  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend cooldown timer
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const API_BASE = 'http://localhost:5173';

  const handleInitiateSignUp = async () => {
    const hasNumber = /\d/.test(formData.password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_]/.test(formData.password);

    if (formData.password.length < 8) {
      setPwError('Password must be at least 8 characters');
      return;
    }
    if (!hasNumber || !hasSpecial) {
      setPwError('Include a number and special character');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setConfirmPwError('Passwords do not match');
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      const res = await fetch(`${API_BASE}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.contact.trim(), purpose: 'signup' })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send OTP code');
      }

      setStage('otp');
      setResendCooldown(60);
      setOtpError('');
    } catch (err) {
      setSubmitError('OTP Sending failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendSignUpOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setOtpError('');
    try {
      const res = await fetch(`${API_BASE}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.contact.trim(), purpose: 'signup' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to resend OTP');
      }
      setResendCooldown(60);
      setOtpError('');
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSignUp = async () => {
    if (!otpCode || otpCode.trim().length < 6) {
      setOtpError('Please enter the full 6-digit OTP');
      return;
    }

    setLoading(true);
    setOtpError('');
    await clearLocalCaches();

    try {
      // 1. Verify OTP
      const verifyRes = await fetch(`${API_BASE}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.contact.trim(), otp: otpCode.trim(), purpose: 'signup' })
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || 'Invalid OTP code');
      }

      // 2. Complete Supabase Auth Sign Up
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: formData.contact.trim(),
        password: formData.password,
        options: { data: { full_name: formData.name.trim() } },
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('already registered') || msg.includes('already exists')) {
          setSubmitError('An account with this email already exists. Please log in below.');
          setAuthMode('login');
          setLoginContact(formData.contact.trim());
          return;
        }
        throw error;
      }

      if (signUpData?.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
        setSubmitError('An account with this email already exists. Please log in below.');
        setAuthMode('login');
        setLoginContact(formData.contact.trim());
        return;
      }
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleLoginSubmit = async () => {
    if (!loginContact.trim() || !loginPassword) return;

    setLoading(true);
    setSubmitError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginContact.trim(),
        password: loginPassword,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setSubmitError(
            'Invalid credentials or account does not exist. Please check your email or create a new account.'
          );
        } else {
          throw error;
        }
        return;
      }

      // await requestLocation();
      // AppNavigator swaps to MainTabs automatically once the session is set.
      // If you want admin users routed to a separate Admin stack instead of
      // MainTabs, that check belongs in AppNavigator (compare user.email to
      // ADMIN_EMAIL there), not here.
    } catch (err) {
      setSubmitError('Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setSubmitError('');
    try {
      // This must match the redirect URI registered in your Supabase
      // project's Google provider settings AND in Google Cloud Console's
      // OAuth client's authorized redirect URIs. Log it once and copy it
      // there verbatim.
      const redirectUrl = AuthSession.makeRedirectUri({ scheme: 'lendkart' });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true, // we drive the browser manually below
        },
      });
      if (error) throw error;

      const authResult = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (authResult.type === 'success' && authResult.url) {
        // Supabase returns tokens in the URL fragment (#access_token=...).
        const hash = authResult.url.split('#')[1];
        const params = new URLSearchParams(hash);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token && refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (sessionError) throw sessionError;
          // AppNavigator picks up the new session automatically via
          // onAuthStateChange — no manual navigation needed.
        } else {
          setSubmitError('Google sign-in did not return valid tokens. Please try again.');
        }
      } else if (authResult.type === 'cancel' || authResult.type === 'dismiss') {
        // User closed the browser — no error needed, just stop loading.
      } else {
        setSubmitError('Google sign-in was interrupted. Please try again.');
      }
    } catch (err) {
      setSubmitError('Google sign-in failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0b0f0d' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ── Hero ── */}
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
          }}
          style={styles.hero}
          imageStyle={{ opacity: 0.35 }}
        >
          <Text style={styles.heroBrand}>🛡️ Lendkart</Text>
          <Text style={styles.heroHeadline}>Share more,{'\n'}Own less.</Text>
          <Text style={styles.heroSub}>
            Build a more sustainable and connected community together through shared resources.
          </Text>
        </ImageBackground>

        {/* ── Form ── */}
        <View style={styles.formContainer}>
          {authMode === 'signup' ? (
            <>
              <Text style={styles.title}>Create account</Text>
              <Text style={styles.subtitle}>Start sharing with your neighbors today.</Text>

              {stage === 'details' && (
                <View>
                  <Text style={styles.label}>FULL NAME</Text>
                  <View style={[styles.inputWrapper, nameError && styles.inputError]}>
                    <User size={18} color="#9ca3af" />
                    <TextInput
                      style={styles.input}
                      value={formData.name}
                      onChangeText={onNameChange}
                      placeholder="Enter your full name"
                      placeholderTextColor="#6b7280"
                    />
                  </View>
                  {!!nameError && <Text style={styles.fieldError}>{nameError}</Text>}

                  <Text style={[styles.label, { marginTop: 20 }]}>EMAIL ADDRESS</Text>
                  <View style={[styles.inputWrapper, contactError && styles.inputError]}>
                    <Mail size={18} color="#9ca3af" />
                    <TextInput
                      style={styles.input}
                      value={formData.contact}
                      onChangeText={onContactChange}
                      placeholder="name@example.com"
                      placeholderTextColor="#6b7280"
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                    <ContactStatusIcon status={contactStatus} />
                  </View>
                  {!!contactError && <Text style={styles.fieldError}>{contactError}</Text>}

                  <TouchableOpacity
                    style={[
                      styles.primaryBtn,
                      (formData.name.trim().length < 2 || contactStatus !== 'valid' || loading) &&
                        styles.btnDisabled,
                    ]}
                    disabled={formData.name.trim().length < 2 || contactStatus !== 'valid' || loading}
                    onPress={handleDetailsSubmit}
                  >
                    <Text style={styles.primaryBtnText}>Continue</Text>
                  </TouchableOpacity>
                </View>
              )}

              {stage === 'password' && (
                <View>
                  <View style={{ alignItems: 'center', marginBottom: 20 }}>
                    <View style={styles.iconCircle}>
                      <ShieldCheck size={24} color={GREEN} />
                    </View>
                    <Text style={styles.stepTitle}>Secure your account</Text>
                    <Text style={styles.stepSub}>
                      Almost there! Choose a strong password to finish.
                    </Text>
                  </View>

                  <Text style={styles.label}>CREATE PASSWORD</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={18} color="#9ca3af" />
                    <TextInput
                      style={styles.input}
                      value={formData.password}
                      onChangeText={onPasswordChange}
                      placeholder="At least 8 characters"
                      placeholderTextColor="#6b7280"
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <EyeOff size={18} color="#9ca3af" />
                      ) : (
                        <Eye size={18} color="#9ca3af" />
                      )}
                    </TouchableOpacity>
                  </View>
                  {!!pwError && <Text style={styles.fieldError}>{pwError}</Text>}

                  <Text style={[styles.label, { marginTop: 20 }]}>CONFIRM PASSWORD</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={18} color="#9ca3af" />
                    <TextInput
                      style={styles.input}
                      value={formData.confirmPassword}
                      onChangeText={onConfirmPwChange}
                      placeholder="Repeat your password"
                      placeholderTextColor="#6b7280"
                      secureTextEntry={!showConfirmPw}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPw(!showConfirmPw)}>
                      {showConfirmPw ? (
                        <EyeOff size={18} color="#9ca3af" />
                      ) : (
                        <Eye size={18} color="#9ca3af" />
                      )}
                    </TouchableOpacity>
                  </View>
                  {!!confirmPwError && <Text style={styles.fieldError}>{confirmPwError}</Text>}

                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setAgreed(!agreed)}
                  >
                    <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                      {agreed && <CheckCircle size={14} color="#000" />}
                    </View>
                    <Text style={styles.checkboxLabel}>
                      I agree to the <Text style={styles.link}>Terms of Service</Text> and{' '}
                      <Text style={styles.link}>Privacy Policy</Text>.
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.primaryBtn,
                      (!agreed || formData.password.length < 8 || loading) && styles.btnDisabled,
                    ]}
                    disabled={!agreed || formData.password.length < 8 || loading}
                    onPress={handleInitiateSignUp}
                  >
                    {loading ? (
                      <ActivityIndicator color="#000" />
                    ) : (
                      <Text style={styles.primaryBtnText}>Send Verification OTP</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity style={{ marginTop: 14 }} onPress={() => setStage('details')}>
                    <Text style={styles.backLink}>Go back</Text>
                  </TouchableOpacity>
                </View>
              )}

              {stage === 'otp' && (
                <View style={{ alignItems: 'center' }}>
                  <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Mail size={28} color="#10b981" />
                  </View>
                  <Text style={styles.title}>Enter Verification Code</Text>
                  <Text style={[styles.subtitle, { textAlign: 'center' }]}>
                    We have sent a 6-digit OTP to{'\n'}
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{formData.contact}</Text>
                  </Text>

                  <Text style={[styles.label, { marginTop: 16, textAlign: 'center' }]}>ENTER 6-DIGIT OTP</Text>
                  <View style={[styles.inputWrapper, { justifyContent: 'center' }]}>
                    <TextInput
                      style={[styles.input, { textAlign: 'center', letterSpacing: 8, fontSize: 24, fontWeight: 'bold' }]}
                      value={otpCode}
                      onChangeText={(val) => {
                        setOtpCode(val.replace(/\D/g, ''));
                        setOtpError('');
                      }}
                      placeholder="123456"
                      placeholderTextColor="#6b7280"
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                  {!!otpError && <Text style={[styles.fieldError, { textAlign: 'center' }]}>{otpError}</Text>}

                  <TouchableOpacity
                    style={[
                      styles.primaryBtn,
                      { marginTop: 20, width: '100%' },
                      (otpCode.length < 6 || loading) && styles.btnDisabled,
                    ]}
                    disabled={otpCode.length < 6 || loading}
                    onPress={handleVerifyAndSignUp}
                  >
                    {loading ? (
                      <ActivityIndicator color="#000" />
                    ) : (
                      <Text style={styles.primaryBtnText}>Verify & Create Account</Text>
                    )}
                  </TouchableOpacity>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 }}>
                    <TouchableOpacity
                      onPress={handleResendSignUpOtp}
                      disabled={resendCooldown > 0 || loading}
                    >
                      <Text style={{ color: resendCooldown > 0 ? '#9ca3af' : GREEN, fontSize: 14, fontWeight: '600' }}>
                        {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setStage('password')}>
                      <Text style={styles.backLink}>Change password</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          ) : (
            <View>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>
                Please log in to your Lendkart account to continue.
              </Text>

              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <View style={styles.inputWrapper}>
                <Mail size={18} color="#9ca3af" />
                <TextInput
                  style={styles.input}
                  value={loginContact}
                  onChangeText={(v) => {
                    setLoginContact(v);
                    setSubmitError('');
                  }}
                  placeholder="name@example.com"
                  placeholderTextColor="#6b7280"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>PASSWORD</Text>
                <TouchableOpacity
                  onPress={() => {
                    // Add a 'ForgotPassword' screen to AppNavigator, then
                    // uncomment: navigation.navigate('ForgotPassword')
                  }}
                >
                  <Text style={styles.link}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <Lock size={18} color="#9ca3af" />
                <TextInput
                  style={styles.input}
                  value={loginPassword}
                  onChangeText={(v) => {
                    setLoginPassword(v);
                    setSubmitError('');
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#6b7280"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={18} color="#9ca3af" />
                  ) : (
                    <Eye size={18} color="#9ca3af" />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  (!loginContact.trim() || !loginPassword || loading) && styles.btnDisabled,
                ]}
                disabled={!loginContact.trim() || !loginPassword || loading}
                onPress={handleLoginSubmit}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.primaryBtnText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {!!submitError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{submitError}</Text>
            </View>
          )}

          <Text style={styles.orDivider}>OR</Text>

          <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} disabled={loading}>
            <Image
              source={{
                uri: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
              }}
              style={{ width: 18, height: 18 }}
            />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.googleBtn, { marginTop: 12, backgroundColor: 'rgba(74, 222, 128, 0.15)', borderColor: '#4ade80' }]}
            onPress={loginAsGuest}
          >
            <Text style={[styles.googleBtnText, { color: '#4ade80', fontWeight: 'bold' }]}>🚀 Skip & Explore App as Guest</Text>
          </TouchableOpacity>

          <View style={styles.switchRow}>
            {authMode === 'signup' ? (
              <Text style={styles.switchText}>
                Already have an account?{' '}
                <Text
                  style={styles.link}
                  onPress={() => {
                    setAuthMode('login');
                    setSubmitError('');
                  }}
                >
                  Sign in
                </Text>
              </Text>
            ) : (
              <Text style={styles.switchText}>
                Don't have an account?{' '}
                <Text
                  style={styles.link}
                  onPress={() => {
                    setAuthMode('signup');
                    setSubmitError('');
                  }}
                >
                  Create account
                </Text>
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.adminBtn}
            onPress={() => {
              // Add an 'AdminLogin' screen to AppNavigator, then
              // uncomment: navigation.navigate('AdminLogin')
            }}
          >
            <Text style={styles.adminBtnText}>🛡️ Admin Portal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  hero: {
    height: 220,
    backgroundColor: '#111827',
    padding: 24,
    justifyContent: 'flex-end',
  },
  heroBrand: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 12 },
  heroHeadline: { color: '#fff', fontSize: 30, fontWeight: '800', lineHeight: 34 },
  heroSub: { color: '#e5e7eb', fontSize: 13, marginTop: 8, lineHeight: 18 },
  formContainer: { padding: 24 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: '#9ca3af', fontSize: 14, marginBottom: 24 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#161c19',
    borderWidth: 1,
    borderColor: '#242c28',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  inputError: { borderColor: '#ef4444' },
  input: { flex: 1, color: '#fff', fontSize: 15 },
  fieldError: { color: '#ef4444', fontSize: 12, marginTop: 6 },
  primaryBtn: {
    backgroundColor: GREEN,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(74,222,128,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  stepTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  stepSub: { color: '#9ca3af', fontSize: 13, marginTop: 6, textAlign: 'center' },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 20 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#4b5563',
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: GREEN, borderColor: GREEN },
  checkboxLabel: { flex: 1, color: '#9ca3af', fontSize: 13, lineHeight: 18 },
  link: { color: GREEN, fontWeight: '700' },
  backLink: { color: '#9ca3af', fontSize: 14, textAlign: 'center' },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorBanner: {
    backgroundColor: '#2a1414',
    borderColor: '#7f1d1d',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
  },
  errorBannerText: { color: '#fca5a5', fontSize: 13 },
  orDivider: { color: '#6b7280', textAlign: 'center', fontSize: 12, marginVertical: 20 },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    height: 48,
  },
  googleBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  switchRow: { marginTop: 24, alignItems: 'center' },
  switchText: { color: '#9ca3af', fontSize: 14 },
  adminBtn: {
    alignSelf: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2a2f2c',
  },
  adminBtnText: { color: '#94a3b8', fontSize: 13 },
});
