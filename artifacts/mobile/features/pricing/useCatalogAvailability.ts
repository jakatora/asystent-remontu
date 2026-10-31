import {useCallback,useEffect,useRef,useState} from 'react';
import {ApiError,fetchCatalogAvailability} from './pricingApi';
import {CatalogAvailabilityCache,type CatalogAvailabilityRead} from './catalogAvailability';

const cache = new CatalogAvailabilityCache(fetchCatalogAvailability);

export function useCatalogAvailability(enabled: boolean) {
  const [data,setData] = useState<CatalogAvailabilityRead | null>(null);
  const [loading,setLoading] = useState(false), [error,setError] = useState(false), [expired,setExpired] = useState(false);
  const [retryAt,setRetryAt] = useState<number | null>(null), [now,setNow] = useState(Date.now);
  const version = useRef(0);
  const load = useCallback(async (force: boolean) => {
    const request = ++version.current;
    setLoading(true);setError(false);setExpired(false);setData(null);
    try {
      const read = await cache.read(force);
      if (request !== version.current) return;
      if (read.expiresAt <= Date.now()) setExpired(true);
      else setData(read);
      setRetryAt(null);
    } catch (e) {
      if (request !== version.current) return;
      setError(true);
      setRetryAt(e instanceof ApiError ? e.retryAt : null);
    } finally {if (request === version.current) setLoading(false);}
  },[]);
  useEffect(() => {
    if (enabled) void load(false);
    return () => {version.current++;};
  },[enabled,load]);
  useEffect(() => {
    if (!enabled || !data) return;
    const timer = setTimeout(() => {setData(null);setExpired(true);},Math.max(1,data.expiresAt-Date.now()+1));
    return () => clearTimeout(timer);
  },[enabled,data]);
  useEffect(() => {
    if (!enabled || !retryAt) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()),1000);
    return () => clearInterval(timer);
  },[enabled,retryAt]);
  return {data,loading,error,expired,retrySeconds:retryAt ? Math.max(0,Math.ceil((retryAt-now)/1000)) : 0,retry:() => {void load(true);}};
}
