import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';

export default function HouseBuildLayout() {
  const { t } = useLanguage();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
        headerBackTitle: t('hb.layout.headerBack'),
      }}
    >
      <Stack.Screen name="index" options={{ title: t('hb.layout.title.index') }} />
      <Stack.Screen name="create" options={{ title: t('hb.layout.title.create'), presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: t('hb.layout.title.id') }} />
      <Stack.Screen name="stage" options={{ title: t('hb.layout.title.stage') }} />
      <Stack.Screen name="documents" options={{ title: t('hb.layout.title.documents') }} />
      <Stack.Screen name="professionals" options={{ title: t('hb.layout.title.professionals') }} />
      <Stack.Screen name="utilities" options={{ title: t('hb.layout.title.utilities') }} />
      <Stack.Screen name="formal-path" options={{ title: t('hb.layout.title.formalPath'), presentation: 'modal' }} />
      <Stack.Screen name="formal-result" options={{ title: t('hb.layout.title.formalResult') }} />
      <Stack.Screen name="formal-documents" options={{ title: t('hb.layout.title.formalDocuments') }} />
      <Stack.Screen name="before-works" options={{ title: t('hb.layout.title.beforeWorks') }} />
      <Stack.Screen name="start-works" options={{ title: t('hb.layout.title.startWorks') }} />
      <Stack.Screen name="edb" options={{ title: t('hb.layout.title.edb') }} />
      <Stack.Screen name="completion" options={{ title: t('hb.layout.title.completion') }} />
      <Stack.Screen name="energy-planning" options={{ title: t('hb.layout.title.energyPlanning') }} />
      <Stack.Screen name="timeline" options={{ title: t('hb.layout.title.timeline') }} />
      <Stack.Screen name="budget" options={{ title: t('hb.layout.title.budget') }} />
      <Stack.Screen name="milestones" options={{ title: t('hb.layout.title.milestones') }} />
      <Stack.Screen name="stage-plan" options={{ title: t('hb.layout.title.stagePlan') }} />
      <Stack.Screen name="doc-dashboard" options={{ title: t('hb.layout.title.docDashboard') }} />
      <Stack.Screen name="official-forms" options={{ title: t('hb.layout.title.officialForms') }} />
      <Stack.Screen name="decisions" options={{ title: t('hb.layout.title.decisions') }} />
      <Stack.Screen name="questions" options={{ title: t('hb.layout.title.questions') }} />
      <Stack.Screen name="completion-package" options={{ title: t('hb.layout.title.completionPackage') }} />
      <Stack.Screen name="investor-docs" options={{ title: t('hb.layout.title.investorDocs') }} />
      <Stack.Screen name="utility-hub" options={{ title: t('hb.layout.title.utilityHub') }} />
      <Stack.Screen name="utility-electricity" options={{ title: t('hb.layout.title.utilityElectricity') }} />
      <Stack.Screen name="utility-water" options={{ title: t('hb.layout.title.utilityWater') }} />
      <Stack.Screen name="utility-sewer" options={{ title: t('hb.layout.title.utilitySewer') }} />
      <Stack.Screen name="utility-gas" options={{ title: t('hb.layout.title.utilityGas') }} />
      <Stack.Screen name="utility-internet" options={{ title: t('hb.layout.title.utilityInternet') }} />
      <Stack.Screen name="utility-alternatives" options={{ title: t('hb.layout.title.utilityAlternatives') }} />
      <Stack.Screen name="pricing-references" options={{ title: t('hb.layout.title.pricingReferences') }} />
      <Stack.Screen name="content-admin-hub" options={{ title: t('hb.layout.title.contentAdminHub') }} />
      <Stack.Screen name="content-dashboard" options={{ title: t('hb.layout.title.contentDashboard') }} />
      <Stack.Screen name="content-stages" options={{ title: t('hb.layout.title.contentStages') }} />
      <Stack.Screen name="content-formal" options={{ title: t('hb.layout.title.contentFormal') }} />
      <Stack.Screen name="content-utilities" options={{ title: t('hb.layout.title.contentUtilities') }} />
      <Stack.Screen name="content-decisions" options={{ title: t('hb.layout.title.contentDecisions') }} />
      <Stack.Screen name="content-questions" options={{ title: t('hb.layout.title.contentQuestions') }} />
      <Stack.Screen name="content-warnings" options={{ title: t('hb.layout.title.contentWarnings') }} />
      <Stack.Screen name="content-sources" options={{ title: t('hb.layout.title.contentSources') }} />
      <Stack.Screen name="content-import-export" options={{ title: t('hb.layout.title.contentImportExport') }} />
      <Stack.Screen name="content-snapshots" options={{ title: t('hb.layout.title.contentSnapshots') }} />
      <Stack.Screen name="content-health" options={{ title: t('hb.layout.title.contentHealth') }} />
      <Stack.Screen name="content-disclaimers" options={{ title: t('hb.layout.title.contentDisclaimers') }} />
      <Stack.Screen name="contractor-board" options={{ title: t('hb.layout.title.contractorBoard') }} />
      <Stack.Screen name="stage-contractors" options={{ title: t('hb.layout.title.stageContractors') }} />
      <Stack.Screen name="stage-request-prep" options={{ title: t('hb.layout.title.stageRequestPrep') }} />
    </Stack>
  );
}
