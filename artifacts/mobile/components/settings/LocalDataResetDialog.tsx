import React,{useEffect,useRef,useState} from 'react';
import {Modal,Platform,ScrollView,TextInput,View} from 'react-native';
import {reloadAppAsync} from 'expo';
import {useRouter,type Href} from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useLanguage} from '@/context/LanguageContext';
import {getDb} from '@/db/client';
import {resetLocalData} from '@/features/storage/localDataReset';
import {Button} from '@/components/ui/Button';
import {Txt} from '@/components/ui/Txt';
import {Colors} from '@/constants/colors';

export function LocalDataResetDialog({visible,onClose}:{visible:boolean;onClose:()=>void}){
  const {language}=useLanguage(),router=useRouter(),working=useRef(false);
  const say=(pl:string,en:string)=>language==='pl'?pl:en,word=language==='pl'?'USUŃ':'DELETE';
  const [confirmation,setConfirmation]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[finished,setFinished]=useState(false);
  useEffect(()=>{if(visible){setConfirmation('');setError('');setFinished(false);}},[visible]);
  const restart=async()=>{
    if(Platform.OS==='web')window.location.replace('/');
    else await reloadAppAsync('local-data-reset');
  };
  const remove=async()=>{
    if(working.current||confirmation!==word)return;
    working.current=true;setBusy(true);setError('');
    try{
      await resetLocalData(await getDb(),AsyncStorage);setFinished(true);
      try{await restart();}catch{setError(say('Dane lokalne zostały usunięte. Zamknij i ponownie otwórz aplikację, aby zacząć od nowa.','Local data was deleted. Close and reopen the app to start again.'));}
    }catch(reason){
      setError(reason instanceof Error&&reason.message==='local_reset_preferences_unconfirmed'
        ?say('Dane w bazie zostały usunięte, ale nie udało się potwierdzić usunięcia ustawień. Zamknij inne karty aplikacji i spróbuj ponownie.','Database data was deleted, but settings removal could not be confirmed. Close other app tabs and try again.')
        :say('Nie udało się potwierdzić pełnego usunięcia danych. Zamknij inne karty aplikacji, ponownie ją otwórz i sprawdź zapisane projekty przed kolejną próbą.','Complete deletion could not be confirmed. Close other app tabs, reopen the app and check saved projects before trying again.'));
    }finally{working.current=false;setBusy(false);}
  };
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={()=>{if(!busy&&!finished)onClose();}}>
    <View style={{flex:1,backgroundColor:'rgba(15,23,42,0.55)',alignItems:'center',justifyContent:'center',padding:20}}>
      <View accessibilityViewIsModal style={{width:'100%',maxWidth:560,maxHeight:'90%',backgroundColor:Colors.surface,borderRadius:20,padding:20}}>
        <ScrollView contentContainerStyle={{gap:16}} keyboardShouldPersistTaps="handled">
          <Txt accessibilityRole="header" w="bold" style={{fontSize:22,color:Colors.text}}>{say('Usuń dane z tego urządzenia','Delete data from this device')}</Txt>
          {finished?<>
            <Txt style={{fontSize:15,lineHeight:23,color:Colors.text}}>{say('Dane lokalne zostały usunięte. Aplikacja uruchomi się ponownie.','Local data was deleted. The app will restart.')}</Txt>
            <Button label={say('Uruchom ponownie','Restart app')} onPress={()=>void restart().catch(()=>setError(say('Zamknij i ponownie otwórz aplikację.','Close and reopen the app.')))}/>
          </>:<>
            <Txt style={{fontSize:15,lineHeight:23,color:Colors.textSecondary}}>{say('Usuniesz wszystkie zapisane tutaj projekty remontu i budowy domu, zdjęcia, zakupy, lokalne dane wykonawców oraz ustawienia. Tej operacji nie można cofnąć w aplikacji.','This removes all renovation and house-building projects, photos, shopping, local contractor data and settings saved here. This cannot be undone in the app.')}</Txt>
            <Txt style={{fontSize:14,lineHeight:21,color:Colors.textSecondary}}>{say('Zamknij inne karty aplikacji przed usunięciem. Pobrane wcześniej pliki kopii pozostaną na Twoim urządzeniu. Ta operacja nie usuwa kont ani zamówień w zewnętrznych usługach.','Close other app tabs before deleting. Previously downloaded backup files remain on your device. This does not delete accounts or orders in external services.')}</Txt>
            {Platform.OS==='web'&&<>
              <Button label={say('Najpierw zrób kopię remontów','Back up renovations first')} variant="outline" disabled={busy} onPress={()=>{onClose();router.push('/project-backup' as Href);}}/>
              <Txt style={{fontSize:13,lineHeight:20,color:Colors.textMuted}}>{say('Kopia remontów nie obejmuje modułu budowy domu ani danych wykonawców.','Renovation backups exclude the house-building module and contractor data.')}</Txt>
            </>}
            <Txt style={{fontSize:14,color:Colors.text}}>{say('Aby potwierdzić, wpisz: ','To confirm, type: ')+word}</Txt>
            <TextInput accessibilityLabel={say('Potwierdzenie usunięcia','Deletion confirmation')} value={confirmation} onChangeText={setConfirmation} editable={!busy} autoCapitalize="characters" autoCorrect={false} placeholder={word} style={{minHeight:48,borderWidth:1,borderColor:Colors.border,borderRadius:12,padding:12,fontSize:16,color:Colors.text}}/>
            <Button label={say('Usuń lokalne dane','Delete local data')} variant="danger" onPress={()=>void remove()} disabled={confirmation!==word||busy} loading={busy}/>
            <Button label={say('Anuluj','Cancel')} variant="ghost" onPress={onClose} disabled={busy}/>
          </>}
          {error&&<Txt accessibilityRole="alert" style={{color:Colors.danger,fontSize:14,lineHeight:21}}>{error}</Txt>}
        </ScrollView>
      </View>
    </View>
  </Modal>;
}
