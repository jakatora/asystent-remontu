import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';

export default function NotFoundScreen() {
  const { t } = useLanguage();
  return (
    <>
      <Stack.Screen options={{ title: t('notFound.title') }} />
      <View style={styles.container}>
        <Text style={styles.title}>{t('notFound.heading')}</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>{t('notFound.link')}</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: Colors.background },
  title: { fontSize: 20, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  link: { marginTop: 15, paddingVertical: 15 },
  linkText: { fontSize: 14, color: Colors.primary },
});
