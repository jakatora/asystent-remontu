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
import { ALL_JOBS } from '@/data/jobs';
import { useLanguage } from '@/context/LanguageContext';
import { useContractor } from '@/context/ContractorContext';
import type { ContractorRegistration, ContractorType, JobScale } from '@/types/contractor';

type RegStep = 'type' | 'info' | 'area' | 'specialties' | 'description' | 'confirm';
const STEPS: RegStep[] = ['type', 'info', 'area', 'specialties', 'description', 'confirm'];

export default function ContractorRegisterScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { registerContractor } = useContractor();
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
    try {
      const specializedJobIds = ALL_JOBS
        .filter((j) => selectedCategories.includes(j.categoryId))
        .map((j) => j.id);

      const registration: ContractorRegistration = {
        type: contractorType,
        displayName: displayName.trim(),
        companyName: companyName.trim() || undefined,
        email: email.trim(),
        phone: phone.trim() || undefined,
        city: city.trim(),
        serviceArea: {
          city: city.trim(),
          radiusKm: parseInt(radiusKm, 10) || 20,
        },
        specialties: selectedCategories.map((catId) => {
          const cat = CATEGORIES.find((c) => c.id === catId);
          return { categoryId: catId, categoryName: cat?.name ?? catId };
        }),
        specializedJobIds,
        shortDescription: shortDescription.trim(),
        longDescription: longDescription.trim() || undefined,
        materialsIncluded,
        jobScales,
        website: website.trim() || undefined,
        taxId: taxId.trim() || undefined,
      };

      await registerContractor(registration);
      setSubmitted(true);
    } catch {
      Alert.alert(t('common.error'), t('wizard.saveError.body'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Stack.Screen
          options={{
            title: t('contractor.register.screenTitleDone'),
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
            {t('contractor.register.doneTitle')}
          </Txt>
          <Txt style={{ fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginBottom: 32, lineHeight: 22 }}>
            {t('contractor.register.doneBody')}
          </Txt>
          <View style={{ width: '100%' }}>
            <Button
              label={t('contractor.register.backHome')}
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
          title: t('contractor.register.screenTitle'),
          headerBackTitle: t('contractor.register.headerBack'),
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
            {t('contractor.register.stepCounter', { current: stepIdx + 1, total: STEPS.length })}
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
              <Txt w="bold" style={{ fontSize: 22, color: Colors.text, marginBottom: 4 }}>{t('contractor.register.type.title')}</Txt>
              <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 16 }}>
                {t('contractor.register.type.subtitle')}
              </Txt>
              <View style={{ gap: 8 }}>
                <OptionCard
                  icon="user"
                  title={t('contractor.register.type.individualTitle')}
                  description={t('contractor.register.type.individualDesc')}
                  selected={contractorType === 'individual'}
                  onPress={() => setContractorType('individual')}
                />
                <OptionCard
                  icon="briefcase"
                  title={t('contractor.register.type.companyTitle')}
                  description={t('contractor.register.type.companyDesc')}
                  selected={contractorType === 'company'}
                  onPress={() => setContractorType('company')}
                />
              </View>
            </View>
          )}

          {step === 'info' && (
            <View>
              <Txt w="bold" style={{ fontSize: 22, color: Colors.text, marginBottom: 4 }}>{t('contractor.register.info.title')}</Txt>
              <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 16 }}>
                {t('contractor.register.info.subtitle')}
              </Txt>
              <RegInput label={t('contractor.register.info.displayName')} value={displayName} onChangeText={setDisplayName} placeholder={t('contractor.register.info.displayNamePlaceholder')} />
              {contractorType === 'company' && (
                <RegInput label={t('contractor.register.info.companyName')} value={companyName} onChangeText={setCompanyName} placeholder={t('contractor.register.info.companyNamePlaceholder')} />
              )}
              <RegInput label={t('contractor.register.info.email')} value={email} onChangeText={setEmail} placeholder={t('contractor.register.info.emailPlaceholder')} keyboardType="email-address" />
              <RegInput label={t('contractor.register.info.phone')} value={phone} onChangeText={setPhone} placeholder={t('contractor.register.info.phonePlaceholder')} keyboardType="phone-pad" />
              <RegInput label={t('contractor.register.info.taxId')} value={taxId} onChangeText={setTaxId} placeholder={t('contractor.register.info.taxIdPlaceholder')} />
              <RegInput label={t('contractor.register.info.website')} value={website} onChangeText={setWebsite} placeholder={t('contractor.register.info.websitePlaceholder')} />
            </View>
          )}

          {step === 'area' && (
            <View>
              <Txt w="bold" style={{ fontSize: 22, color: Colors.text, marginBottom: 4 }}>{t('contractor.register.area.title')}</Txt>
              <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 16 }}>
                {t('contractor.register.area.subtitle')}
              </Txt>
              <RegInput label={t('contractor.register.area.city')} value={city} onChangeText={setCity} placeholder={t('contractor.register.area.cityPlaceholder')} />
              <RegInput
                label={t('contractor.register.area.radius')}
                value={radiusKm}
                onChangeText={setRadiusKm}
                placeholder={t('contractor.register.area.radiusPlaceholder')}
                keyboardType="numeric"
              />
            </View>
          )}

          {step === 'specialties' && (
            <View>
              <Txt w="bold" style={{ fontSize: 22, color: Colors.text, marginBottom: 4 }}>{t('contractor.register.specialties.title')}</Txt>
              <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 16 }}>
                {t('contractor.register.specialties.subtitle')}
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
                {t('contractor.register.specialties.jobScale')}
              </Txt>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['small', 'medium', 'large'] as JobScale[]).map((scale) => {
                  const labels = {
                    small: t('contractor.register.specialties.scaleSmall'),
                    medium: t('contractor.register.specialties.scaleMedium'),
                    large: t('contractor.register.specialties.scaleLarge'),
                  };
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
                <Txt style={{ fontSize: 14, color: Colors.text }}>{t('contractor.register.specialties.materialsToggle')}</Txt>
              </TouchableOpacity>
            </View>
          )}

          {step === 'description' && (
            <View>
              <Txt w="bold" style={{ fontSize: 22, color: Colors.text, marginBottom: 4 }}>{t('contractor.register.description.title')}</Txt>
              <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 16 }}>
                {t('contractor.register.description.subtitle')}
              </Txt>
              <RegInput
                label={t('contractor.register.description.short')}
                value={shortDescription}
                onChangeText={setShortDescription}
                placeholder={t('contractor.register.description.shortPlaceholder')}
                multiline
              />
              <RegInput
                label={t('contractor.register.description.long')}
                value={longDescription}
                onChangeText={setLongDescription}
                placeholder={t('contractor.register.description.longPlaceholder')}
                multiline
              />
            </View>
          )}

          {step === 'confirm' && (
            <View>
              <Txt w="bold" style={{ fontSize: 22, color: Colors.text, marginBottom: 4 }}>{t('contractor.register.confirm.title')}</Txt>
              <Txt style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 16 }}>
                {t('contractor.register.confirm.subtitle')}
              </Txt>
              <View style={{ backgroundColor: Colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, gap: 10 }}>
                <ConfirmRow label={t('contractor.register.confirm.type')} value={contractorType === 'individual' ? t('contractor.register.confirm.typeIndividual') : t('contractor.register.confirm.typeCompany')} />
                <ConfirmRow label={t('contractor.register.confirm.name')} value={displayName} />
                {companyName ? <ConfirmRow label={t('contractor.register.confirm.company')} value={companyName} /> : null}
                <ConfirmRow label={t('contractor.register.confirm.email')} value={email} />
                {phone ? <ConfirmRow label={t('contractor.register.confirm.phone')} value={phone} /> : null}
                <ConfirmRow label={t('contractor.register.confirm.city')} value={city} />
                <ConfirmRow label={t('contractor.register.confirm.radius')} value={t('contractor.register.confirm.radiusValue', { radius: radiusKm })} />
                <ConfirmRow label={t('contractor.register.confirm.specialties')} value={selectedCategories.map((id) => CATEGORIES.find((c) => c.id === id)?.name ?? id).join(', ')} />
                <ConfirmRow label={t('contractor.register.confirm.materials')} value={materialsIncluded ? t('contractor.register.confirm.materialsYes') : t('contractor.register.confirm.materialsNo')} />
                <ConfirmRow label={t('contractor.register.confirm.description')} value={shortDescription} />
              </View>

              <View style={{ backgroundColor: Colors.infoBg, borderRadius: 14, padding: 14, marginTop: 16, flexDirection: 'row', gap: 10 }}>
                <Feather name="info" size={16} color={Colors.info} style={{ marginTop: 2 }} />
                <Txt style={{ fontSize: 13, color: Colors.info, flex: 1, lineHeight: 20 }}>
                  {t('contractor.register.confirm.note')}
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
