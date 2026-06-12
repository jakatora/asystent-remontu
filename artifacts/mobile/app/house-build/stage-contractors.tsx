import { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useFocusEffect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { getStageByKey } from '@/features/house-build/stages';
import { useLanguage } from '@/context/LanguageContext';
import {
  getExtendedMappingForStage,
  getHiringQuestionsForStage,
  getProfessionalGuidanceForStage,
} from '@/features/house-build/contractor-mapping';
import { houseBuildContractorsRepo } from '@/db/repositories/house-build-contractors.repo';
import type {
  ContractorNeedStatus,
  StageContractorNeed,
  StageContractorShortlistEntry,
} from '@/types/house-build';
import { CONTRACTOR_NEED_STATUS_LABELS, CONTRACTOR_NEED_STATUS_COLORS } from '@/types/house-build';

const HB_ACCENT = '#2563EB';

const STATUS_CYCLE: ContractorNeedStatus[] = [
  'needed', 'browsing', 'request-prepared', 'request-sent',
  'shortlisted', 'selected', 'not-needed', 'unresolved',
];

export default function StageContractorsScreen() {
  const { projectId, stageKey } = useLocalSearchParams<{ projectId: string; stageKey: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const stage = getStageByKey(stageKey);
  const mapping = getExtendedMappingForStage(stageKey);
  const guidance = getProfessionalGuidanceForStage(stageKey);
  const hiringQs = getHiringQuestionsForStage(stageKey);

  const [need, setNeed] = useState<StageContractorNeed | null>(null);
  const [shortlist, setShortlist] = useState<StageContractorShortlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editNote, setEditNote] = useState('');
  const [showQuestions, setShowQuestions] = useState(false);

  const load = useCallback(async () => {
    if (!projectId || !stageKey) return;
    try {
      const [n, sl] = await Promise.all([
        houseBuildContractorsRepo.getNeed(projectId, stageKey),
        houseBuildContractorsRepo.getShortlist(projectId, stageKey),
      ]);
      setNeed(n);
      setShortlist(sl);
      setEditNote(n?.notes ?? '');
    } catch (err) {
      console.error('Stage contractors load error:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, stageKey]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleStatusChange = async (status: ContractorNeedStatus) => {
    if (!projectId) return;
    try {
      await houseBuildContractorsRepo.upsertNeed(projectId, stageKey, { status });
      await load();
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const handleSaveNotes = async () => {
    if (!projectId) return;
    try {
      await houseBuildContractorsRepo.upsertNeed(projectId, stageKey, { notes: editNote });
      await load();
    } catch (err) {
      console.error('Save notes error:', err);
    }
  };

  const handleRemoveShortlist = (entry: StageContractorShortlistEntry) => {
    Alert.alert(t('hb.stageContractors.removeTitle'), t('hb.stageContractors.removeBody', { name: entry.contractorName }), [
      { text: t('hb.stageContractors.removeCancel'), style: 'cancel' },
      { text: t('hb.stageContractors.removeConfirm'), style: 'destructive', onPress: async () => {
        try {
          await houseBuildContractorsRepo.removeFromShortlist(entry.id);
          await load();
        } catch (err) {
          console.error('Remove shortlist error:', err);
        }
      }},
    ]);
  };

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}><ActivityIndicator size="large" color={HB_ACCENT} /></View>;
  }

  const currentStatus: ContractorNeedStatus = need?.status ?? 'needed';
  const statusColor = CONTRACTOR_NEED_STATUS_COLORS[currentStatus];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 }}>
        <Txt w="bold" style={{ fontSize: 15, color: HB_ACCENT }}>{stage?.name ?? stageKey}</Txt>
        {mapping && <Txt style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>{mapping.label}</Txt>}

        <Txt w="semibold" style={{ fontSize: 12, color: Colors.text, marginTop: 12, marginBottom: 6 }}>{t('hb.stageContractors.statusSection')}</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {STATUS_CYCLE.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => handleStatusChange(s)}
              style={{
                backgroundColor: currentStatus === s ? CONTRACTOR_NEED_STATUS_COLORS[s] + '20' : '#F8FAFC',
                borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4,
                borderWidth: 1, borderColor: currentStatus === s ? CONTRACTOR_NEED_STATUS_COLORS[s] : '#E2E8F0',
              }}
            >
              <Txt style={{ fontSize: 10, color: currentStatus === s ? CONTRACTOR_NEED_STATUS_COLORS[s] : Colors.textMuted }}>
                {CONTRACTOR_NEED_STATUS_LABELS[s]}
              </Txt>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/house-build/stage-request-prep' as any, params: { projectId, stageKey } })}
          style={{ flex: 1, backgroundColor: HB_ACCENT, borderRadius: 10, padding: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
        >
          <Feather name="edit-3" size={14} color="#FFFFFF" />
          <Txt style={{ fontSize: 12, color: '#FFFFFF' }}>{t('hb.stageContractors.prepRequest')}</Txt>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/contractor/results' as any, params: { fromHouseBuild: '1', stageKey, projectId } })}
          style={{ flex: 1, backgroundColor: '#059669', borderRadius: 10, padding: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
        >
          <Feather name="search" size={14} color="#FFFFFF" />
          <Txt style={{ fontSize: 12, color: '#FFFFFF' }}>{t('hb.stageContractors.searchContractor')}</Txt>
        </TouchableOpacity>
      </View>

      {guidance && (
        <View style={{ backgroundColor: '#EFF6FF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#BFDBFE', marginBottom: 12 }}>
          <Txt w="semibold" style={{ fontSize: 12, color: HB_ACCENT, marginBottom: 6 }}>{t('hb.stageContractors.guidanceTitle')}</Txt>
          <View style={{ marginBottom: 6 }}>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{t('hb.stageContractors.commonRoles')}</Txt>
            <Txt style={{ fontSize: 11, color: Colors.text }}>{guidance.commonRoles.join(', ')}</Txt>
          </View>
          <View style={{ marginBottom: 6 }}>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{t('hb.stageContractors.whenToStart')}</Txt>
            <Txt style={{ fontSize: 11, color: Colors.text }}>{guidance.whenToStartLooking}</Txt>
          </View>
          <View style={{ marginBottom: 6 }}>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{t('hb.stageContractors.offers')}</Txt>
            <Txt style={{ fontSize: 11, color: Colors.text }}>{guidance.whenToCollectOffers}</Txt>
          </View>
          <View>
            <Txt style={{ fontSize: 10, color: Colors.textMuted }}>{t('hb.stageContractors.whatToConfirm')}</Txt>
            <Txt style={{ fontSize: 11, color: Colors.text }}>{guidance.whatToConfirm}</Txt>
          </View>
        </View>
      )}

      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 }}>
        <TouchableOpacity onPress={() => setShowQuestions(!showQuestions)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Txt w="semibold" style={{ fontSize: 12, color: Colors.text }}>{t('hb.stageContractors.hiringQuestions', { count: hiringQs.length })}</Txt>
          <Feather name={showQuestions ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textMuted} />
        </TouchableOpacity>
        {showQuestions && (
          <View style={{ marginTop: 8 }}>
            {hiringQs.map((q, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 6, marginBottom: 6, alignItems: 'flex-start' }}>
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: q.priority === 'high' ? '#DC2626' : Colors.textMuted, marginTop: 5 }} />
                <Txt style={{ fontSize: 11, color: Colors.text, flex: 1 }}>{q.question}</Txt>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 }}>
        <Txt w="semibold" style={{ fontSize: 12, color: Colors.text, marginBottom: 6 }}>{t('hb.stageContractors.shortlist', { count: shortlist.length })}</Txt>
        {shortlist.length === 0 ? (
          <View style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 12, alignItems: 'center' }}>
            <Feather name="user-plus" size={16} color={Colors.textMuted} />
            <Txt style={{ fontSize: 10, color: Colors.textMuted, marginTop: 4 }}>{t('hb.stageContractors.emptyShortlist')}</Txt>
            <Txt style={{ fontSize: 9, color: Colors.textMuted }}>{t('hb.stageContractors.emptyShortlistHint')}</Txt>
          </View>
        ) : (
          shortlist.map((entry) => (
            <View key={entry.id} style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Txt w="semibold" style={{ fontSize: 12, color: Colors.text }}>{entry.contractorName}</Txt>
                {entry.note ? <Txt style={{ fontSize: 10, color: Colors.textMuted, marginTop: 2 }}>{entry.note}</Txt> : null}
                <Txt style={{ fontSize: 8, color: Colors.textMuted, marginTop: 2 }}>{new Date(entry.createdAt).toLocaleDateString('pl-PL')}</Txt>
              </View>
              <TouchableOpacity onPress={() => handleRemoveShortlist(entry)}>
                <Feather name="x" size={14} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 }}>
        <Txt w="semibold" style={{ fontSize: 12, color: Colors.text, marginBottom: 6 }}>{t('hb.stageContractors.notesSection')}</Txt>
        <TextInput
          style={{ backgroundColor: '#F8FAFC', borderRadius: 6, padding: 8, fontSize: 12, borderWidth: 1, borderColor: '#E2E8F0', minHeight: 60, textAlignVertical: 'top' }}
          value={editNote}
          onChangeText={setEditNote}
          multiline
          placeholder={t('hb.stageContractors.notesPlaceholder')}
          placeholderTextColor={Colors.textMuted}
        />
        <TouchableOpacity onPress={handleSaveNotes} style={{ backgroundColor: HB_ACCENT, borderRadius: 8, padding: 8, alignItems: 'center', marginTop: 8 }}>
          <Txt style={{ fontSize: 11, color: '#FFFFFF' }}>{t('hb.stageContractors.saveNotes')}</Txt>
        </TouchableOpacity>
      </View>

      {need?.selectedContractorName && (
        <View style={{ backgroundColor: '#F0FDF4', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#BBF7D0' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="check-circle" size={16} color="#16A34A" />
            <Txt w="semibold" style={{ fontSize: 13, color: '#16A34A' }}>{t('hb.stageContractors.selectedTitle')}</Txt>
          </View>
          <Txt style={{ fontSize: 12, color: Colors.text, marginTop: 4 }}>{need.selectedContractorName}</Txt>
        </View>
      )}
    </ScrollView>
  );
}
