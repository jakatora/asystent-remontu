import React,{useRef,useState} from 'react';
import {Platform,ScrollView,View} from 'react-native';
import {Stack} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Feather} from '@expo/vector-icons';
import {useApp} from '@/context/AppContext';
import {useLanguage} from '@/context/LanguageContext';
import {getDb} from '@/db/client';
import {Colors} from '@/constants/colors';
import {Txt} from '@/components/ui/Txt';
import {Button} from '@/components/ui/Button';
import {canonical,importProjectBackup,parseProjectBackup,readProjectBackup,type ProjectBackup} from '@/features/storage/projectBackup';
import {chooseProjectBackup,downloadProjectBackup,embedBackupPhotos} from '@/features/storage/projectBackupFiles';

export default function ProjectBackupScreen(){
  const {projects,refreshProjects}=useApp(),{language}=useLanguage(),insets=useSafeAreaInsets();
  const say=(pl:string,en:string)=>language==='pl'?pl:en;
  const [busy,setBusy]=useState<'export'|'choose'|'import'|null>(null),working=useRef(false);
  const [preview,setPreview]=useState<ProjectBackup|null>(null),[error,setError]=useState(''),[message,setMessage]=useState('');
  const conflict=preview?.tables.projects.some(row=>projects.some(project=>project.id===row.id));
  const errorMessage=(reason:unknown)=>{
    const code=reason instanceof Error?reason.message:'';
    if(code==='backup_project_conflict')return say('Co najmniej jeden projekt z tej kopii jest już zapisany tutaj. Istniejące dane nie zostały nadpisane.','At least one project from this backup is already saved here. Existing data was not overwritten.');
    if(code==='backup_too_large')return say('Kopia przekracza limit 20 MB. Nie zapisano częściowej kopii.','This backup exceeds the 20 MB limit. No partial backup was saved.');
    if(code==='backup_photo_unreadable'||code==='backup_photo_not_portable')return say('Nie można przenieść jednego ze zdjęć. Otwórz zdjęcia w projekcie źródłowym i spróbuj ponownie. Kopia musi zawierać dostępne zdjęcia.','A photo cannot be transferred. Open the photos in the source project and try again. Photos must be available for a complete backup.');
    if(code==='backup_import_unconfirmed')return say('Nie udało się potwierdzić zapisu. Otwórz ponownie aplikację i sprawdź projekty przed kolejnym importem.','The save could not be confirmed. Reopen the app and check your projects before importing again.');
    if(code==='backup_empty')return say('Ta kopia nie zawiera projektów remontu.','This backup contains no renovation projects.');
    if(code==='backup_changed_during_export')return say('Projekty zmieniły się w trakcie tworzenia kopii. Zaczekaj na zapis zmian i pobierz kopię ponownie.','Projects changed while preparing the backup. Wait for changes to save and download it again.');
    return say('Nie udało się wykonać operacji. Sprawdź plik kopii i spróbuj ponownie. Istniejące projekty pozostają zachowane.','The operation could not be completed. Check the backup file and try again. Existing projects are preserved.');
  };
  const run=async(action:'export'|'choose'|'import',task:()=>Promise<void>)=>{
    if(working.current)return;working.current=true;setBusy(action);setError('');setMessage('');
    try{await task();}catch(reason){setError(errorMessage(reason));}finally{working.current=false;setBusy(null);}
  };
  const exportProjects=()=>void run('export',async()=>{
    const db=await getDb(),snapshot=await readProjectBackup(db,AsyncStorage),check=await readProjectBackup(db,AsyncStorage);
    if(canonical([snapshot.tables,snapshot.preferences])!==canonical([check.tables,check.preferences]))throw Error('backup_changed_during_export');
    if(!snapshot.tables.projects.length)throw Error('backup_empty');
    const portable=await embedBackupPhotos(snapshot),raw=JSON.stringify(portable,null,2);parseProjectBackup(raw);
    downloadProjectBackup(raw);setMessage(say('Plik kopii został przygotowany do pobrania. Zachowaj go na swoim urządzeniu.','Your backup file is ready to download. Keep it on your device.'));
  });
  const choose=()=>void run('choose',async()=>{setPreview(null);const raw=await chooseProjectBackup();if(raw!==null){const backup=parseProjectBackup(raw);if(!backup.tables.projects.length)throw Error('backup_empty');setPreview(backup);}});
  const restore=()=>void run('import',async()=>{
    if(!preview)return;const result=await importProjectBackup(preview,await getDb(),AsyncStorage);setPreview(null);await refreshProjects();
    setMessage(say(`Przeniesiono projektów: ${result.projects}. Odśwież ceny i dostawy przed zakupem.${result.keptBasketSettings?' Zachowano ustawienia Twojego obecnego wspólnego koszyka.':''}`,`Projects transferred: ${result.projects}. Refresh prices and delivery before buying.${result.keptBasketSettings?' Your current shared basket settings were preserved.':''}`));
  });
  const card={backgroundColor:Colors.surface,borderRadius:16,padding:20,borderWidth:1,borderColor:Colors.border,gap:14} as const;
  return <><Stack.Screen options={{headerShown:true,title:say('Kopia projektów','Project backup')}}/>
    <ScrollView style={{flex:1,backgroundColor:Colors.background}} contentContainerStyle={{padding:20,paddingBottom:insets.bottom+32,gap:20}}>
      <View style={{maxWidth:760,width:'100%',alignSelf:'center',gap:20}}>
        <Txt w="bold" style={{fontSize:24,color:Colors.text}}>{say('Zachowaj swój remont','Keep your renovation safe')}</Txt>
        <Txt style={{fontSize:15,lineHeight:23,color:Colors.textSecondary}}>{say('Pobierz projekty do pliku i wczytaj je w innej przeglądarce lub na stronie aplikacji. Kopia obejmuje obmiary, zakupy, wybrane produkty, notatki, checklisty i zdjęcia remontu.','Download your projects to a file and import them in another browser or on the app website. The backup includes measurements, shopping, selected products, notes, checklists and renovation photos.')}</Txt>
        <Txt style={{fontSize:13,lineHeight:20,color:Colors.textMuted}}>{say('To kopia projektów remontowych, bez modułu budowy domu i kont wykonawców. Plik jest przechowywany u Ciebie; może zawierać prywatne notatki i zdjęcia. Limit: 20 MB.','This backup covers renovation projects, excluding house-building and contractor accounts. You keep the file; it may contain private notes and photos. Limit: 20 MB.')}</Txt>
        {Platform.OS==='web'?<>
          <View style={card}>
            <Feather name="download" size={24} color={Colors.primary}/>
            <Txt w="semibold" style={{fontSize:18,color:Colors.text}}>{say('1. Pobierz kopię','1. Download a backup')}</Txt>
            <Txt style={{fontSize:14,lineHeight:21,color:Colors.textSecondary}}>{say(`Zapisane projekty w tej przeglądarce: ${projects.length}. Zdjęcia zostaną dołączone do pliku.`,`Projects saved in this browser: ${projects.length}. Photos will be included in the file.`)}</Txt>
            <Button label={say('Pobierz kopię projektów','Download project backup')} onPress={exportProjects} loading={busy==='export'} disabled={busy!==null||projects.length===0}/>
          </View>
          <View style={card}>
            <Feather name="upload" size={24} color={Colors.primary}/>
            <Txt w="semibold" style={{fontSize:18,color:Colors.text}}>{say('2. Wczytaj na drugim urządzeniu','2. Import on another device')}</Txt>
            <Txt style={{fontSize:14,lineHeight:21,color:Colors.textSecondary}}>{say('Wybierz pobrany plik. Najpierw zobaczysz jego zawartość. Import dodaje projekty i zatrzymuje się przy powtórzonych identyfikatorach — nie zastępuje istniejących zapisów.','Choose your downloaded file to preview its contents. Import adds projects and stops on duplicate IDs, preserving existing records.')}</Txt>
            <Button label={say('Wybierz plik z kopią','Choose a backup file')} variant="outline" onPress={choose} loading={busy==='choose'} disabled={busy!==null}/>
            {preview&&<View style={{gap:12}}>
              <Txt w="semibold" style={{fontSize:16,color:Colors.text}}>{say(`Do wczytania: ${preview.tables.projects.length} projektów, ${preview.tables.shopping_items.length} pozycji zakupów, ${preview.tables.project_photos.length} zdjęć`,`Ready to import: ${preview.tables.projects.length} projects, ${preview.tables.shopping_items.length} shopping items, ${preview.tables.project_photos.length} photos`)}</Txt>
              <Txt style={{fontSize:13,color:Colors.textMuted}}>{say('Utworzono kopię: ','Backup created: ')+new Date(preview.createdAt).toLocaleString(language==='pl'?'pl-PL':'en-GB')}</Txt>
              {preview.tables.projects.slice(0,20).map(row=><Txt key={String(row.id)} style={{fontSize:14,color:Colors.text}}>{String(row.name)}</Txt>)}
              {preview.tables.projects.length>20&&<Txt>{say(`…oraz ${preview.tables.projects.length-20} pozostałych`,`…and ${preview.tables.projects.length-20} more`)}</Txt>}
              <Txt style={{fontSize:13,lineHeight:20,color:Colors.textSecondary}}>{say('Przenosimy poprzednio widziane ceny do historii. Aktualne ceny i koszty dostawy zostaną sprawdzone ponownie przy wycenie.','Previously seen prices move with your history. Current prices and delivery costs will be checked again when quoting.')}</Txt>
              {projects.length>0&&<Txt style={{fontSize:13,color:Colors.textSecondary}}>{say('Ustawienia obecnego wspólnego koszyka i jego dodatkowe produkty pozostaną bez zmian.','Your current shared basket settings and additional products will be preserved.')}</Txt>}
              {conflict&&<Txt accessibilityRole="alert" style={{color:Colors.danger,fontSize:14}}>{say('Jeden z tych projektów już tu istnieje. Import tej kopii jest zablokowany, żeby zachować zapisane zmiany.','One of these projects already exists here. Import is blocked to preserve your saved changes.')}</Txt>}
              <Button label={say('Wczytaj projekty z kopii','Import projects from backup')} onPress={restore} loading={busy==='import'} disabled={busy!==null||Boolean(conflict)}/>
              <Button label={say('Anuluj wczytywanie','Cancel import')} variant="ghost" onPress={()=>setPreview(null)} disabled={busy!==null}/>
            </View>}
          </View>
        </>:<Txt>{say('Kopie projektów są obecnie dostępne w wersji przeglądarkowej aplikacji.','Project backups are currently available in the browser version of the app.')}</Txt>}
        {error&&<View accessibilityRole="alert" style={{...card,backgroundColor:Colors.dangerBg}}><Txt style={{color:Colors.danger,lineHeight:22}}>{error}</Txt></View>}
        {message&&<View accessibilityLiveRegion="polite" style={{...card,backgroundColor:Colors.successBg}}><Txt style={{color:Colors.text,lineHeight:22}}>{message}</Txt></View>}
      </View>
    </ScrollView></>;
}
