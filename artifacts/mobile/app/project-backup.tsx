import React,{useEffect,useRef,useState} from 'react';
import {AccessibilityInfo,Platform,ScrollView,View} from 'react-native';
import {Stack,useRouter} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Feather} from '@expo/vector-icons';
import {useApp} from '@/context/AppContext';
import {useHouseBuild} from '@/context/HouseBuildContext';
import {useLanguage} from '@/context/LanguageContext';
import {getDb} from '@/db/client';
import {Colors} from '@/constants/colors';
import {Txt} from '@/components/ui/Txt';
import {Button} from '@/components/ui/Button';
import {backupExtraCount,backupToolChoiceCount,canonical,checkBackupSize,hasBackupContent,importProjectBackup,parseProjectBackup,readProjectBackup,type ProjectBackup} from '@/features/storage/projectBackup';
import {HOUSE_BACKUP_FORMAT,importHouseBuildBackup,parseHouseBuildBackup,readHouseBuildBackup,type HouseBuildBackup} from '@/features/storage/houseBuildBackup';
import {chooseProjectBackup,downloadProjectBackup,embedBackupPhotos} from '@/features/storage/projectBackupFiles';

export default function ProjectBackupScreen(){
  const router=useRouter();
  const {projects,refreshProjects}=useApp(),{language}=useLanguage(),insets=useSafeAreaInsets();
  const {projects:houseProjects,refreshProjects:refreshHouseProjects}=useHouseBuild();
  const say=(pl:string,en:string)=>language==='pl'?pl:en;
  type Action='export'|'export-house'|'choose'|'import';
  type Destination='/projects'|'/house-build'|'/renovation-basket';
  type Feedback={action:Action;text:string;error?:boolean;destination?:Destination};
  const [busy,setBusy]=useState<Action|null>(null),working=useRef(false);
  const [feedback,setFeedback]=useState<Feedback|null>(null);
  useEffect(()=>{
    if(feedback&&Platform.OS==='ios')AccessibilityInfo.announceForAccessibility(feedback.text);
  },[feedback]);
  const [preview,setPreview]=useState<ProjectBackup|null>(null);
  const [housePreview,setHousePreview]=useState<HouseBuildBackup|null>(null);
  const conflict=preview?.tables.projects.some(row=>projects.some(project=>project.id===row.id));
  const houseConflict=housePreview?.tables.house_build_projects.some(row=>houseProjects.some(project=>project.id===row.id));
  const errorMessage=(reason:unknown)=>{
    const code=reason instanceof Error?reason.message:'';
    if(code==='backup_project_conflict')return say('Co najmniej jeden projekt z tej kopii jest już zapisany tutaj. Istniejące dane nie zostały nadpisane.','At least one project from this backup is already saved here. Existing data was not overwritten.');
    if(code==='backup_basket_conflict')return say('Ta kopia zawiera sam wspólny koszyk, a tutaj są już dane remontu. Import został zatrzymany; obecny koszyk i projekty pozostają zachowane. Sam koszyk można przywrócić w pustej aplikacji.','This file contains only a shared basket, and renovation data already exists here. Import stopped; your current basket and projects are preserved. A basket-only file can be restored in an empty app.');
    if(code==='backup_too_large')return say('Kopia przekracza limit 20 MB. Nie zapisano częściowej kopii.','This backup exceeds the 20 MB limit. No partial backup was saved.');
    if(code==='backup_photo_not_portable')return say('Plik kopii zawiera zdjęcie w nieprawidłowym formacie. Zapisz nową kopię na urządzeniu źródłowym.','The backup contains a photo in an invalid format. Save a new backup on the source device.');
    if(code==='backup_photo_unreadable')return say('Nie można przenieść jednego ze zdjęć. Otwórz zdjęcia w projekcie źródłowym i spróbuj ponownie. Kopia musi zawierać dostępne zdjęcia.','A photo cannot be transferred. Open the photos in the source project and try again. Photos must be available for a complete backup.');
    if(code==='backup_import_unconfirmed')return say('Nie udało się potwierdzić zapisu. Otwórz ponownie aplikację i sprawdź projekty przed kolejnym importem.','The save could not be confirmed. Reopen the app and check your projects before importing again.');
    if(code==='backup_share_unavailable')return say('Systemowe udostępnianie plików jest niedostępne na tym urządzeniu.','System file sharing is unavailable on this device.');
    if(code==='backup_empty')return say('Wybrana kopia jest pusta.','The selected backup is empty.');
    if(code==='backup_changed_during_export')return say('Projekty zmieniły się w trakcie tworzenia kopii. Zaczekaj na zapis zmian i pobierz kopię ponownie.','Projects changed while preparing the backup. Wait for changes to save and download it again.');
    return say('Nie udało się wykonać operacji. Sprawdź plik kopii i spróbuj ponownie. Istniejące projekty pozostają zachowane.','The operation could not be completed. Check the backup file and try again. Existing projects are preserved.');
  };
  const run=async(action:Action,task:()=>Promise<void>)=>{
    if(working.current)return;working.current=true;setBusy(action);setFeedback(null);
    try{await task();}catch(reason){setFeedback({action,text:errorMessage(reason),error:true});}finally{working.current=false;setBusy(null);}
  };
  const exportProjects=()=>void run('export',async()=>{
    const db=await getDb(),snapshot=await readProjectBackup(db,AsyncStorage),check=await readProjectBackup(db,AsyncStorage);
    if(canonical([snapshot.tables,snapshot.preferences])!==canonical([check.tables,check.preferences]))throw Error('backup_changed_during_export');
    if(!hasBackupContent(snapshot))throw Error('backup_empty');
    const portable=await embedBackupPhotos(snapshot),raw=JSON.stringify(portable,null,2);parseProjectBackup(raw);
    await downloadProjectBackup(raw);
    if(Platform.OS==='web')setFeedback({action:'export',text:say('Plik kopii został przygotowany do pobrania. Zachowaj go na swoim urządzeniu.','Your backup file is ready to download. Keep it on your device.')});
  });
  const exportHouse=()=>void run('export-house',async()=>{
    const backup=await readHouseBuildBackup(await getDb());
    if(!backup.tables.house_build_projects.length)throw Error('backup_empty');
    await downloadProjectBackup(JSON.stringify(backup),'house');
    if(Platform.OS==='web')setFeedback({action:'export-house',text:say('Plik kopii budowy domu jest gotowy do pobrania.','Your house-building backup is ready to download.')});
  });
  const choose=()=>void run('choose',async()=>{
    setPreview(null);setHousePreview(null);
    const raw=await chooseProjectBackup();
    if(raw===null)return;
    checkBackupSize(raw);
    if(JSON.parse(raw)?.format===HOUSE_BACKUP_FORMAT){
      const backup=parseHouseBuildBackup(raw);
      if(!backup.tables.house_build_projects.length)throw Error('backup_empty');
      setHousePreview(backup);
      return;
    }
    const backup=parseProjectBackup(raw);
    if(!hasBackupContent(backup))throw Error('backup_empty');
    setPreview(backup);
  });
  const restoreHouse=()=>void run('import',async()=>{
    if(!housePreview)return;
    const count=await importHouseBuildBackup(housePreview,await getDb());
    setHousePreview(null);
    await refreshHouseProjects();
    setFeedback({action:'import',destination:'/house-build',text:say(`Przywrócono projekty budowy domu: ${count}.`,`House-building projects restored: ${count}.`)});
  });
  const restore=()=>void run('import',async()=>{
    if(!preview)return;
    const result=await importProjectBackup(preview,await getDb(),AsyncStorage);
    setPreview(null);
    if(result.projects===0){
      setFeedback({action:'import',destination:'/renovation-basket',text:say(
        'Wczytano wspólny koszyk i jego ustawienia. Odśwież ceny i dostawy przed zakupem.',
        'The shared basket and its settings were restored. Refresh prices and delivery before buying.',
      )});
      return;
    }
    const restored=say(`Przeniesiono projektów: ${result.projects}.`,`Projects transferred: ${result.projects}.`);
    const preserved=result.keptBasketSettings?say(
      ' Zachowano ustawienia Twojego obecnego wspólnego koszyka.',
      ' Your current shared basket settings were preserved.',
    ):'';
    try{
      await refreshProjects();
    }catch{
      setFeedback({action:'import',text:restored+preserved+say(
        ' Nie udało się odświeżyć listy. Otwórz ponownie aplikację, aby zobaczyć zapisane projekty.',
        ' The list could not be refreshed. Reopen the app to see the saved projects.',
      )});
      return;
    }
    setFeedback({action:'import',destination:'/projects',text:restored+say(
      ' Odśwież ceny i dostawy przed zakupem.',
      ' Refresh prices and delivery before buying.',
    )+preserved});
  });
  const card={backgroundColor:Colors.surface,borderRadius:16,padding:20,borderWidth:1,borderColor:Colors.border,gap:14} as const;
  const renderFeedback=(action:Action)=>{
    const current=feedback?.action===action?feedback:null;
    const destination=current?.destination;
    const destinationLabel=destination==='/house-build'
      ?say('Zobacz przywróconą budowę','View restored house-building projects')
      :destination==='/renovation-basket'
        ?say('Zobacz przywrócony koszyk','View restored basket')
        :say('Zobacz przywrócone projekty','View restored projects');
    return <View accessibilityLiveRegion="polite" aria-live="polite" style={current?undefined:{position:'absolute'}}>
      {current&&<View style={{...card,backgroundColor:current.error?Colors.dangerBg:Colors.successBg}}>
        <Txt style={{color:Colors.text,lineHeight:22}}>{current.text}</Txt>
        {destination&&<Button label={destinationLabel} variant="outline" onPress={()=>router.replace(destination)}/>}
      </View>}
    </View>;
  };
  return <><Stack.Screen options={{headerShown:true,title:say('Kopia projektów','Project backup')}}/>
    <ScrollView style={{flex:1,backgroundColor:Colors.background}} contentContainerStyle={{padding:20,paddingBottom:insets.bottom+32,gap:20}}>
      <View style={{maxWidth:760,width:'100%',alignSelf:'center',gap:20}}>
        <Txt w="bold" style={{fontSize:24,color:Colors.text}}>{say('Kopie remontów i budowy domu','Renovation and house-building backups')}</Txt>
        <Txt style={{fontSize:15,lineHeight:23,color:Colors.textSecondary}}>{say('Zapisz remont do pliku i wczytaj go w aplikacji na innym urządzeniu lub w przeglądarce. Kopia obejmuje projekty, obmiary, zakupy, wybrane produkty, notatki, checklisty i zdjęcia. Zawiera również wspólny koszyk z dodatkowymi materiałami i wybranymi opakowaniami, nawet gdy nie masz jeszcze projektu.','Save your renovation to a file and import it on another device or in the browser. The backup includes projects, measurements, shopping, selected products, notes, checklists and photos. It also includes the shared basket, additional materials and selected packaging, even without a project.')}</Txt>
        <Txt style={{fontSize:13,lineHeight:20,color:Colors.textMuted}}>{say('Każdy plik kopii może zawierać prywatne dane i ma limit 20 MiB. Kopie remontów i budowy domu zapisujesz osobno.','Each backup file can contain private data and has a 20 MiB limit. Save renovation and house-building backups separately.')}</Txt>
          <View style={card}>
            <Feather name="download" size={24} color={Colors.primary}/>
            <Txt w="semibold" style={{fontSize:18,color:Colors.text}}>{say('1. Zapisz kopię','1. Save a backup')}</Txt>
            <Txt style={{fontSize:14,lineHeight:21,color:Colors.textSecondary}}>{say(`Zapisane projekty: ${projects.length}. Zdjęcia zostaną dołączone do pliku.`,`Saved projects: ${projects.length}. Photos will be included in the file.`)}</Txt>
            <Button label={Platform.OS==='web'?say('Pobierz kopię remontu','Download renovation backup'):say('Zapisz lub udostępnij kopię','Save or share backup')} onPress={exportProjects} loading={busy==='export'} disabled={busy!==null}/>
            {renderFeedback('export')}
            <Txt style={{fontSize:14,lineHeight:21,color:Colors.textSecondary}}>{say(`Projekty budowy domu: ${houseProjects.length}. Kopia obejmuje harmonogram, budżet, dokumentację, notatki i powiązane szkice zapytań. Zewnętrzne załączniki i konta wymagają osobnego przeniesienia.`,`House-building projects: ${houseProjects.length}. Includes schedules, budgets, document records, notes and linked request drafts. Transfer external attachments and accounts separately.`)}</Txt>
            <Button label={say('Zapisz kopię budowy domu','Save house-building backup')} variant="outline" onPress={exportHouse} loading={busy==='export-house'} disabled={busy!==null}/>
            {renderFeedback('export-house')}
          </View>
          <View style={card}>
            <Feather name="upload" size={24} color={Colors.primary}/>
            <Txt w="semibold" style={{fontSize:18,color:Colors.text}}>{say('2. Wczytaj na drugim urządzeniu','2. Import on another device')}</Txt>
            <Txt style={{fontSize:14,lineHeight:21,color:Colors.textSecondary}}>{say('Wybierz pobrany plik. Najpierw zobaczysz jego zawartość. Import dodaje projekty i zatrzymuje się przy powtórzonych identyfikatorach — nie zastępuje istniejących zapisów.','Choose your downloaded file to preview its contents. Import adds projects and stops on duplicate IDs, preserving existing records.')}</Txt>
            <Button label={say('Wybierz plik z kopią','Choose a backup file')} variant="outline" onPress={choose} loading={busy==='choose'} disabled={busy!==null}/>
            {renderFeedback('choose')}
            {housePreview&&<View style={{gap:12}}>
              <Txt w="semibold" style={{fontSize:16,color:Colors.text}}>{say(`Do wczytania: ${housePreview.tables.house_build_projects.length} projektów budowy domu`,`Ready to import: ${housePreview.tables.house_build_projects.length} house-building projects`)}</Txt>
              {housePreview.tables.house_build_projects.slice(0,20).map(row=><Txt key={String(row.id)} style={{fontSize:14,color:Colors.text}}>{String(row.name)}</Txt>)}
              {houseConflict&&<Txt accessibilityRole="alert" style={{color:Colors.danger,fontSize:14}}>{say('Projekt budowy z tego pliku jest już na urządzeniu. Wybierz kopię innych projektów.','A house-building project in this file already exists on this device. Choose a backup of other projects.')}</Txt>}
              <Button label={say('Wczytaj projekty budowy domu','Import house-building projects')} onPress={restoreHouse} loading={busy==='import'} disabled={busy!==null||Boolean(houseConflict)}/>
              <Button label={say('Anuluj wczytywanie','Cancel import')} variant="ghost" onPress={()=>{setHousePreview(null);setFeedback(null);}} disabled={busy!==null}/>
            </View>}
            {preview&&<View style={{gap:12}}>
              <Txt w="semibold" style={{fontSize:16,color:Colors.text}}>{say(`Do wczytania: ${preview.tables.projects.length} projektów, ${preview.tables.shopping_items.length} pozycji zakupów, ${preview.tables.project_photos.length} zdjęć`,`Ready to import: ${preview.tables.projects.length} projects, ${preview.tables.shopping_items.length} shopping items, ${preview.tables.project_photos.length} photos`)}</Txt>
              <Txt style={{fontSize:14,color:Colors.text}}>{say(`Dodatkowe produkty: ${backupExtraCount(preview)}. Zapisane wybory narzędzi: ${backupToolChoiceCount(preview)}. Kopia obejmuje też wybory modeli i opakowań.`,`Additional products: ${backupExtraCount(preview)}. Saved tool choices: ${backupToolChoiceCount(preview)}. The backup also includes model and packaging choices.`)}</Txt>
              <Txt style={{fontSize:13,color:Colors.textMuted}}>{say('Utworzono kopię: ','Backup created: ')+new Date(preview.createdAt).toLocaleString(language==='pl'?'pl-PL':'en-GB')}</Txt>
              {preview.tables.projects.slice(0,20).map(row=><Txt key={String(row.id)} style={{fontSize:14,color:Colors.text}}>{String(row.name)}</Txt>)}
              {preview.tables.projects.length>20&&<Txt>{say(`…oraz ${preview.tables.projects.length-20} pozostałych`,`…and ${preview.tables.projects.length-20} more`)}</Txt>}
              <Txt style={{fontSize:13,lineHeight:20,color:Colors.textSecondary}}>{say('Przenosimy poprzednio widziane ceny do historii. Aktualne ceny i koszty dostawy zostaną sprawdzone ponownie przy wycenie.','Previously seen prices move with your history. Current prices and delivery costs will be checked again when quoting.')}</Txt>
              {projects.length>0&&<Txt style={{fontSize:13,color:Colors.textSecondary}}>{say('Ustawienia obecnego wspólnego koszyka i jego dodatkowe produkty pozostaną bez zmian.','Your current shared basket settings and additional products will be preserved.')}</Txt>}
              {conflict&&<Txt accessibilityRole="alert" style={{color:Colors.danger,fontSize:14}}>{say('Jeden z tych projektów już tu istnieje. Import tej kopii jest zablokowany, żeby zachować zapisane zmiany.','One of these projects already exists here. Import is blocked to preserve your saved changes.')}</Txt>}
              <Button label={preview.tables.projects.length?say('Wczytaj projekty z kopii','Import projects from backup'):say('Wczytaj koszyk z kopii','Import basket from backup')} onPress={restore} loading={busy==='import'} disabled={busy!==null||Boolean(conflict)}/>
              <Button label={say('Anuluj wczytywanie','Cancel import')} variant="ghost" onPress={()=>{setPreview(null);setFeedback(null);}} disabled={busy!==null}/>
            </View>}
            {renderFeedback('import')}
          </View>
        <Button label={say('Otwórz moje projekty','Open my projects')} variant="ghost" onPress={()=>router.replace('/projects')} disabled={busy!==null}/>
        <Button label={say('Otwórz budowę domu','Open house-building projects')} variant="ghost" onPress={()=>router.replace('/house-build')} disabled={busy!==null}/>
        <Button label={say('Otwórz wspólny koszyk','Open shared basket')} variant="ghost" onPress={()=>router.replace('/renovation-basket')} disabled={busy!==null}/>
      </View>
    </ScrollView></>;
}
