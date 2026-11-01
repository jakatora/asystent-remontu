import {useCallback,useEffect,useRef,useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {PackageChoice} from './packageChoiceModel';
import type {createPackageChoiceStorage} from './packageChoiceStorage';
const EMPTY:readonly PackageChoice[]=[];
export function usePackageChoices(projectId:string|undefined,enabled:boolean,storage:ReturnType<typeof createPackageChoiceStorage>){
  const key=projectId??'preview',current=useRef(key);current.current=key;
  const pending=useRef<string|null>(null);
  const[state,setState]=useState<{key:string;choices:readonly PackageChoice[]}>({key:'',choices:EMPTY});
  const[readFailed,setReadFailed]=useState(false),[saveFailed,setSaveFailed]=useState(false),[saving,setSaving]=useState(false),[retry,setRetry]=useState(0);
  useEffect(()=>{
    if(!enabled)return;
    let active=true;setReadFailed(false);setSaveFailed(false);setSaving(false);setState({key:'',choices:EMPTY});
    void storage.read(AsyncStorage,key).then(choices=>{if(active)setState({key,choices});}).catch(()=>{if(active)setReadFailed(true);});
    return()=>{active=false;if(current.current===key)current.current='';};
  },[key,enabled,retry,storage]);
  const ready=!enabled||state.key===key&&!readFailed,choices=enabled&&state.key===key?state.choices:EMPTY;
  const onChange=useCallback(async(next:readonly PackageChoice[])=>{
    if(!enabled||!ready||saving||pending.current===key||current.current!==key)return false;
    if(JSON.stringify(next)===JSON.stringify(choices))return true;
    pending.current=key;setSaving(true);setSaveFailed(false);
    try{const saved=await storage.write(AsyncStorage,key,next);if(current.current===key)setState({key,choices:saved});return true;}
    catch{if(current.current===key)setSaveFailed(true);return false;}
    finally{if(pending.current===key)pending.current=null;if(current.current===key)setSaving(false);}
  },[enabled,ready,saving,key,choices,storage]);
  return{choices,ready,readFailed:enabled&&readFailed,saveFailed,saving,onChange,onRetry:()=>setRetry(n=>n+1)};
}
