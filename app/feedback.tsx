import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { X } from 'phosphor-react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth/get-user-id';

const MAX_MESSAGE = 500;

export default function FeedbackScreen() {
  const router = useRouter();
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const insets = useSafeAreaInsets();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const isValid = subject.trim().length > 0 && message.trim().length > 0;

  const handleSend = async () => {
    if (!isValid || sending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSending(true);
    try {
      await (supabase.from as any)('feedback').insert({
        user_id: getCurrentUserId(),
        subject: subject.trim(),
        message: message.trim(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Thanks!', 'Your feedback has been sent.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to send feedback');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: bgColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.stickyClose, { marginTop: 4 }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.closeCircle, { backgroundColor: surfaceColor }]}
        >
          <X size={18} color={secondaryColor} weight="bold" />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>Send feedback</Text>

        <View style={styles.fields}>
          <View style={[styles.field, { backgroundColor: surfaceColor }]}>
            {subject.length > 0 && (
              <Text style={[styles.fieldLabel, { color: secondaryColor }]}>Subject</Text>
            )}
            <TextInput
              style={[styles.fieldInput, { color: textColor }]}
              placeholder="Subject"
              placeholderTextColor={secondaryColor}
              value={subject}
              onChangeText={setSubject}
              autoFocus
            />
          </View>

          <View style={[styles.messageField, { backgroundColor: surfaceColor }]}>
            {message.length > 0 && (
              <Text style={[styles.fieldLabel, { color: secondaryColor }]}>Message</Text>
            )}
            <TextInput
              style={[styles.messageInput, { color: textColor }]}
              placeholder="Tell us what's on your mind..."
              placeholderTextColor={secondaryColor}
              value={message}
              onChangeText={(t) => setMessage(t.slice(0, MAX_MESSAGE))}
              multiline
              textAlignVertical="top"
              maxLength={MAX_MESSAGE}
            />
            <Text style={[styles.charCount, { color: secondaryColor }]}>
              {message.length}/{MAX_MESSAGE}
            </Text>
          </View>

          <Pressable
            onPress={handleSend}
            style={[styles.sendButton, { backgroundColor: textColor, opacity: isValid && !sending ? 1 : 0.25 }]}
          >
            <Text style={[styles.sendButtonText, { color: bgColor }]}>
              {sending ? 'Sending...' : 'Send feedback'}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stickyClose: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 },
  closeCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  content: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 36, fontFamily: Fonts.medium, lineHeight: 36, letterSpacing: 36 * -0.05, marginBottom: 32, marginTop: 8 },
  fields: { gap: 12 },
  field: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: 56,
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    marginBottom: 2,
  },
  fieldInput: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    padding: 0,
  },
  messageField: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: 160,
  },
  messageInput: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    padding: 0,
    flex: 1,
    lineHeight: 24,
  },
  charCount: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    textAlign: 'right',
    marginTop: 4,
  },
  sendButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
});
