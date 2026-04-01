import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { CATEGORIES } from '@/data/categories';
import type { ContractorType, JobScale } from '@/types/contractor';

type RegStep = 'type' | 'info' | 'area' | 'specialties' | 'description' | 'confirm';
const STEPS: RegStep[] = ['type', 'info', 'area', 'specialties', 'description', 'confirm'];

export default function ContractorRegisterScreen() {
  const insets = useSafeAreaInsets();
  const [stepIdx, setStepIdx] = useState(0);
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 16;

  const [contractorType, setContractorType] = useState<ContractorType>('individual');
  const [displayName, setDisplayName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [radiusKm, setRadiusKm] = useState('20');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [materialsIncluded, setMaterialsIncluded] = useState(false);
  const [jobScales, setJobScales] = useState<JobScale[]>(['small', 'medium']);
  const [website, setWebsite] = useState('');
  const [taxId, setTaxId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const step = STEPS[stepIdx];
  const progress = (stepIdx + 1) / STEPS.length;

  const canGoNext = (): boolean => {
    switch (step) {
      case 'type': return true;
      case 'info': return displayName.trim().length >= 2 && email.includes('@');
      case 'area': return city.trim().length >= 2;
      case 'specialties': return selectedCategories.length > 0;
      case 'description': return shortDescription.trim().length >= 10;
      case 'confirm': return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
  };

  const handleBack = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
    else router.back();
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId],
    );
  };

  const toggleJobScale = (scale: JobScale) => {
    setJobScales((prev) =>
      prev.includes(scale) ? prev.filter((s) => s !== scale) : [...prev, scale],
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Rejestracja',
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.text,
            headerShadowVisible: false,
          }}
        />
        <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: Colors.successBg,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <Feather name="check" size={36} color={Colors.success} />
          </View>
          <Txt w="bold" style={{ fontSize: 22, color: Colors.text, textAlign: 'center', marginBottom: 8 }}>
            Profil zapisany!
          </Txt>
          <Txt style={{ fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginBottom: 32, lineHeight: 22 }}>
            Twój profil fachowca został utworzony. Po weryfikacji przez moderację będzie widoczny w katalogu.
          </Txt>
          <View style={{ width: '100%' }}>
            <Button
              label="Wróć na stronę główną"
              variant="primary"
              onPress={() => router.replace('/(tabs)')}
              fullWidth
            />
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Dołącz jako fachowiec',
          headerBackTitle: 'Wróć',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: Colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
          <View style={{ height: 4, backgroundColor: Colors.surfaceAlt, borderRadius: 2, overflow: 'hidden' }}>
            <View style={{ width: `${progress * 100}%`, height: 4, backgroundColor: Colors.primary, borderRadius: 2 }} />
          </View>
          <Txt style={{ fontSize: 12, color: Colors.textMuted, marginTop: 4, textAlign: 'right' }}>
            Krok {stepIdx + 1} z {STEPS.length}
          </Txt>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: bottomPad + 80 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'type' && (
            <View>
              <Txt w="bold" style={{ fontSize: 22, color: Colors.text, marginBottom: 4 }}>Typ działalności</Txt>
              <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 16 }}>
                Czy działasz jako osoba fizyczna czy firma?
              </Txt>
              <View style={{ gap: 8 }}>
                <OptionCard
                  icon="user"
                  title="Osoba fizyczna"
                  description="Freelancer, rzemieślnik, jednoosobowa działalność"
                  selected={contractorType === 'individual'}
                  onPress={() => setContractorType('individual')}
                />
                <OptionCard
                  icon="briefcase"
                  title="Firma"
                  description="Spółka, ekipa remontowa, firma budowlana"
                  selected={contractorType === 'company'}
                  onPress={() => setContractorType('company')}
                />
              </View>
            </View>
          )}

          {step === 'info' && (
            <View>
              <Txt w="bold" style={{ fontSize: 22, color: Colors.text, marginBottom: 4 }}>Dane kontaktowe</Txt>
              <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 16 }}>
                Te dane będą widoczne w Twoim profilu
              </Txt>
              <RegInput label="Nazwa wyświetlana *" value={displayName} onChangeText={setDisplayName} placeholder="np. Jan Kowalski — Remonty" />
              {contractorType === 'company' && (
                <RegInput label="Nazwa firmy" value={companyName} onChangeText={setCompanyName} placeholder="np. Remonty Kowalski Sp. z o.o." />
              )}
              <RegInput label="Email *" value={email} onChangeText={setEmail} placeholder="jan@email.pl" keyboardType="email-address" />
              <RegInput label="Telefon (opcjonalnie)" value={phone} onChangeText={setPhone} placeholder="+48 600 100 200" keyboardType="phone-pad" />
              <RegInput label="NIP / REGON (opcjonalnie)" value={taxId} onChangeText={setTaxId} placeholder="Numer identyfikacyjny" />
              <RegInput label="Strona www (opcjonalnie)" value={website} onChangeText={setWebsite} placeholder="https://..." />
            </View>
          )}

          {step === 'area' && (
            <View>
              <Txt w="bold" style={{ fontSize: 22, color: Colors.text, marginBottom: 4 }}>Obszar działania</Txt>
              <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 16 }}>
                Gdzie świadczysz usługi?
              </Txt>
              <RegInput label="Miasto *" value={city} onChangeText={setCity} placeholder="np. Warszawa" />
              <RegInput
                label="Zasięg (km)"
                value={radiusKm}
                onChangeText={setRadiusKm}
                placeholder="20"
                keyboardType="numeric"
              />
            </View>
          )}

          {step === 'specialties' && (
            <View>
              <Txt w="bold" style={{ fontSize: 22, color: Colors.text, marginBottom: 4 }}>Specjalizacje</Txt>
              <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 16 }}>
                Wybierz rodzaje prac, które wykonujesz (minimum 1)
              </Txt>
              <View style={{ gap: 8 }}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => toggleCategory(cat.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: selectedCategories.includes(cat.id) ? Colors.primaryBg : Colors.surface,
                      borderRadius: 12,
                      padding: 14,
                      borderWidth: 1.5,
                      borderColor: selectedCategories.includes(cat.id) ? Colors.primary : Colors.border,
                      gap: 10,
                    }}
                    activeOpacity={0.7}
                  >
                    <Feather name={cat.icon as any} size={16} color={selectedCategories.includes(cat.id) ? Colors.primary : Colors.textSecondary} />
                    <Txt
                      w={selectedCategories.includes(cat.id) ? 'semibold' : 'regular'}
                      style={{ fontSize: 14, color: Colors.text, flex: 1 }}
                    >
                      {cat.name}
                    </Txt>
                    {selectedCategories.includes(cat.id) && <Feather name="check" size={16} color={Colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>

              <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginTop: 20, marginBottom: 8 }}>
                Skala zleceń
              </Txt>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['small', 'medium', 'large'] as JobScale[]).map((scale) => {
                  const labels = { small: 'Małe', medium: 'Średnie', large: 'Duże' };
                  const sel = jobScales.includes(scale);
                  return (
                    <TouchableOpacity
                      key={scale}
                      onPress={() => toggleJobScale(scale)}
                      style={{
                        flex: 1,
                        backgroundColor: sel ? Colors.primaryBg : Colors.surface,
                        borderRadius: 10,
                        paddingVertical: 10,
                        alignItems: 'center',
                        borderWidth: 1.5,
                        borderColor: sel ? Colors.primary : Colors.border,
                      }}
                      activeOpacity={0.7}
                    >
                      <Txt w={sel ? 'semibold' : 'regular'} style={{ fontSize: 13, color: sel ? Colors.primary : Colors.textSecondary }}>
                        {labels[scale]}
                      </Txt>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={() => setMaterialsIncluded(!materialsIncluded)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  marginTop: 16,
                  backgroundColor: Colors.surface,
                  borderRadius: 12,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: Colors.border,
                }}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: materialsIncluded ? Colors.primary : Colors.border,
                    backgroundColor: materialsIncluded ? Colors.primary : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {materialsIncluded && <Feather name="check" size={14} color="#fff" />}
                </View>
                <Txt style={{ fontSize: 14, color: Colors.text }}>Zapewniam materiały</Txt>
              </TouchableOpacity>
            </View>
          )}

          {step === 'description' && (
            <View>
              <Txt w="bold" style={{ fontSize: 22, color: Colors.text, marginBottom: 4 }}>Opis profilu</Txt>
              <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 16 }}>
                Opisz swoje doświadczenie i oferowane usługi
              </Txt>
              <RegInput
                label="Krótki opis (widoczny na liście) *"
                value={shortDescription}
                onChangeText={setShortDescription}
                placeholder="np. Malowanie, szpachlowanie, tapetowanie — 10 lat doświadczenia"
                multiline
              />
              <RegInput
                label="Dłuższy opis (opcjonalnie)"
                value={longDescription}
                onChangeText={setLongDescription}
                placeholder="Opisz swoją firmę, doświadczenie, referencje..."
                multiline
              />
            </View>
          )}

          {step === 'confirm' && (
            <View>
              <Txt w="bold" style={{ fontSize: 22, color: Colors.text, marginBottom: 4 }}>Podsumowanie</Txt>
              <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 16 }}>
                Sprawdź dane przed zapisaniem
              </Txt>
              <View style={{ backgroundColor: Colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, gap: 10 }}>
                <ConfirmRow label="Typ" value={contractorType === 'individual' ? 'Osoba fizyczna' : 'Firma'} />
                <ConfirmRow label="Nazwa" value={displayName} />
                {companyName ? <ConfirmRow label="Firma" value={companyName} /> : null}
                <ConfirmRow label="Email" value={email} />
                {phone ? <ConfirmRow label="Telefon" value={phone} /> : null}
                <ConfirmRow label="Miasto" value={city} />
                <ConfirmRow label="Zasięg" value={`${radiusKm} km`} />
                <ConfirmRow label="Specjalizacje" value={selectedCategories.map((id) => CATEGORIES.find((c) => c.id === id)?.name ?? id).join(', ')} />
                <ConfirmRow label="Materiały" value={materialsIncluded ? 'Tak' : 'Nie'} />
                <ConfirmRow label="Opis" value={shortDescription} />
              </View>

              <View style={{ backgroundColor: Colors.infoBg, borderRadius: 14, padding: 14, marginTop: 16, flexDirection: 'row', gap: 10 }}>
                <Feather name="info" size={16} color={Colors.info} style={{ marginTop: 2 }} />
                <Txt style={{ fontSize: 13, color: Colors.info, flex: 1, lineHeight: 20 }}>
                  Twój profil zostanie sprawdzony przez moderację. Po weryfikacji będzie widoczny w katalogu fachowców.
                </Txt>
              </View>
            </View>
          )}
        </ScrollView>

        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: Colors.background,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: bottomPad,
            flexDirection: 'row',
            gap: 12,
          }}
        >
          <TouchableOpacity
            onPress={handleBack}
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: Colors.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            {step === 'confirm' ? (
              <Button
                label="Zapisz profil"
                variant="primary"
                onPress={handleSubmit}
                loading={isSubmitting}
                fullWidth
              />
            ) : (
              <Button
                label="Dalej"
                variant="primary"
                onPress={handleNext}
                disabled={!canGoNext()}
                fullWidth
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

function OptionCard({ icon, title, description, selected, onPress }: {
  icon: string; title: string; description: string; selected: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: selected ? Colors.primaryBg : Colors.surface,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1.5,
        borderColor: selected ? Colors.primary : Colors.border,
        gap: 12,
      }}
      activeOpacity={0.7}
    >
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: selected ? Colors.primary + '20' : Colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name={icon as any} size={18} color={selected ? Colors.primary : Colors.textSecondary} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt w="semibold" style={{ fontSize: 15, color: Colors.text }}>{title}</Txt>
        <Txt style={{ fontSize: 12, color: Colors.textMuted }}>{description}</Txt>
      </View>
      {selected && <Feather name="check-circle" size={20} color={Colors.primary} />}
    </TouchableOpacity>
  );
}

function RegInput({ label, value, onChangeText, placeholder, multiline, keyboardType }: {
  label: string; value: string; onChangeText: (t: string) => void; placeholder: string;
  multiline?: boolean; keyboardType?: any;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Txt w="semibold" style={{ fontSize: 14, color: Colors.text, marginBottom: 6 }}>{label}</Txt>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        multiline={multiline}
        keyboardType={keyboardType}
        style={{
          backgroundColor: Colors.surface,
          borderRadius: 12,
          padding: 14,
          fontSize: 14,
          color: Colors.text,
          borderWidth: 1,
          borderColor: Colors.border,
          minHeight: multiline ? 100 : undefined,
          textAlignVertical: multiline ? 'top' : undefined,
          fontFamily: 'Inter_400Regular',
        }}
      />
    </View>
  );
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Txt w="semibold" style={{ fontSize: 13, color: Colors.textSecondary, width: 100 }}>{label}</Txt>
      <Txt style={{ fontSize: 13, color: Colors.text, flex: 1 }}>{value}</Txt>
    </View>
  );
}
