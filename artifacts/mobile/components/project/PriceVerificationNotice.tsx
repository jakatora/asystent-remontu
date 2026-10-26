import React from 'react';
import {Txt} from '@/components/ui/Txt';
import {Colors} from '@/constants/colors';
import {useLanguage} from '@/context/LanguageContext';
import type {PriceVerification} from '../../../../lib/pricing-service/src/types';

export function PriceVerificationNotice({verification,store}:{verification?:PriceVerification;store?:string}){
 const {language}=useLanguage();
 if(!verification)return null;
 const until=new Date(verification.expiresAt).toLocaleString(language==='pl'?'pl-PL':'en-GB',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
 const prefix=store?store+': ':'';
 return <Txt style={{fontSize:12,lineHeight:18,color:Colors.textSecondary}}>{language==='pl'?`${prefix}Cena sprawdzona ręcznie na stronie sklepu. Potwierdzenie ważne do ${until}. Dostawę i dostępność dla swojego kodu potwierdź w sklepie.`:`${prefix}Price manually checked on the shop's website. Verification valid until ${until}. Confirm delivery and availability for your postcode with the shop.`}</Txt>;
}
