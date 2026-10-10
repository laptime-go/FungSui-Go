import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, AppState} from 'react-native';
import { Magnetometer } from 'expo-sensors';
let BannerAd, BannerAdSize, InterstitialAd, AppOpenAd, AdEventType, MobileAds;
try{
  const A=require('react-native-google-mobile-ads');
  BannerAd=A.BannerAd; BannerAdSize=A.BannerAdSize;
  InterstitialAd=A.InterstitialAd; AppOpenAd=A.AppOpenAd;
  AdEventType=A.AdEventType; MobileAds=A.default;
}catch(e){}
const BANNER_ID = "ca-app-pub-9890149028563226/7565306387";
const INTER_ID = "ca-app-pub-9890149028563226/5859110495";
const OPEN_ID = "ca-app-pub-9890149028563226/1285440667";
const NATIVE_ID = "ca-app-pub-9890149028563226/9108090368";
const MOUNTAINS_24 = ["壬","子","癸","丑","艮","寅","甲","卯","乙","辰","巽","巳","丙","午","丁","未","坤","申","庚","酉","辛","戌","乾","亥"];
const FLYING_2026 = {"正北":"一白偏財💰","西南":"二黑病符","正東":"三碧是非","東南":"四綠文昌正財💰","中宮":"五黃大煞","西北":"六白武曲","正西":"七赤破財","東北":"八白大財💰","正南":"九紫喜慶"};
export default function App(){
  const [heading,setHeading]=useState(0); const [bazi,setBazi]=useState(''); const [baziUnlocked,setBaziUnlocked]=useState(false);
  const [interLoaded,setInterLoaded]=useState(false); const [adsReady,setAdsReady]=useState(false);
  const lastAdTime=useRef(0); const pendingAction=useRef(null); const interstitialRef=useRef(null);
  const appOpenRef=useRef(null); const appOpenLoaded=useRef(false); const isMounted=useRef(true);
  const lastH=useRef(0); const appState=useRef(AppState.currentState);
  useEffect(()=>{ isMounted.current=true; let mSub=null;
    (async()=>{ try{ await Magnetometer.setUpdateIntervalAsync(400); mSub=Magnetometer.addListener(d=>{
      let a=Math.atan2(d.y,d.x)*180/Math.PI; a=90-a; if(a<0) a+=360;
      if(Math.abs(a-lastH.current)>2){ lastH.current=a; if(isMounted.current) setHeading(a); }
    }); }catch(e){} })(); return()=>{ isMounted.current=false; try{mSub&&mSub.remove();}catch(e){}};
  },[]);
  useEffect(()=>{
    let ls=[]; const sub=AppState.addEventListener('change', next=>{
      if(appState.current.match(/inactive|background/) && next==='active'){
        if(appOpenLoaded.current && appOpenRef.current){ setTimeout(()=>{ try{ appOpenRef.current.show(); }catch(e){} }, 800); }
      } appState.current=next;
    });
    let t1=setTimeout(async()=>{
      if(!MobileAds){ return; }
      try{
        await MobileAds().initialize(); if(!isMounted.current) return; setAdsReady(true);
        if(InterstitialAd){
          const inter=InterstitialAd.createForAdRequest(INTER_ID,{requestNonPersonalizedAdsOnly:true});
          interstitialRef.current=inter; inter.load();
          ls.push(inter.addAdEventListener(AdEventType.LOADED,()=> isMounted.current && setInterLoaded(true)));
          ls.push(inter.addAdEventListener(AdEventType.CLOSED,()=>{ if(isMounted.current) setInterLoaded(false); try{inter.load();}catch(e){} lastAdTime.current=Date.now(); if(pendingAction.current==='bazi'&&isMounted.current) setBaziUnlocked(true); pendingAction.current=null; }));
        }
        if(AppOpenAd){
          const appOpen=AppOpenAd.createForAdRequest(OPEN_ID,{requestNonPersonalizedAdsOnly:true});
          appOpenRef.current=appOpen; appOpen.load();
          ls.push(appOpen.addAdEventListener(AdEventType.LOADED,()=>{ appOpenLoaded.current=true; }));
          ls.push(appOpen.addAdEventListener(AdEventType.CLOSED,()=>{ appOpenLoaded.current=false; try{appOpen.load();}catch(e){}}));
        }
      }catch(e){}
    },1200);
    return()=>{ clearTimeout(t1); sub.remove(); ls.forEach(f=>{try{f&&f();}catch(e){}}); };
  },[]);
  const showAd=(type)=>{ const now=Date.now(); if(now-lastAdTime.current<60000&&type!=='bazi') return; pendingAction.current=type; const inter=interstitialRef.current; if(inter&&interLoaded){ try{inter.show();}catch(e){ if(type==='bazi') setBaziUnlocked(true);} } else { if(type==='bazi') setBaziUnlocked(true); } };
  const getMountain=()=>MOUNTAINS_24[Math.floor((heading+7.5)/15)%24];
  const getDirection=()=>{ const dirs=["正北","東北","正東","東南","正南","西南","正西","西北"]; return dirs[Math.round(heading/45)%8]; };
  const dir=getDirection(); const isWealth=FLYING_2026[dir]?.includes("財");
  const baziResult=bazi? (parseInt(bazi.slice(0,4))%2==0? "喜火🔥 宜坐正南，九紫位":"喜水💧 宜坐正北，一白財位"):"";
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{alignItems:'center', paddingBottom:120}}>
        <Text style={styles.title}>風水佬Go - {Math.round(heading)}°</Text>
        <Text style={styles.sub}>2026丙午年・跟 laptime 穩定版 {adsReady?'✓':''}</Text>
        <View style={[styles.luopan,{transform:[{rotate:`${-heading}deg`}]}]}><Text style={styles.n}>▲北 {getMountain()}山</Text></View>
        <View style={[styles.resultBox,isWealth&&styles.wealthBox]}>
          <Text style={styles.result}>{dir} - {FLYING_2026[dir]}</Text>
          {isWealth&&(<TouchableOpacity style={styles.goldBtn} onPress={()=>showAd('wealth')}><Text style={styles.goldBtnText}>💰 解鎖催財秘法</Text></TouchableOpacity>)}
        </View>
        <View style={styles.nativeBox}>
          <Text style={styles.nativeTitle}>推薦</Text>
          {adsReady&&BannerAd?<BannerAd unitId={NATIVE_ID} size={BannerAdSize.MEDIUM_RECTANGLE} />:null}
        </View>
        <View style={styles.baziBox}>
          <Text style={styles.label}>八字:</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor="#666" value={bazi} onChangeText={(t)=>{setBazi(t); setBaziUnlocked(false);}} />
          {!baziUnlocked? (<TouchableOpacity style={styles.goldBtn2} onPress={()=>{ if(bazi.length>=4) showAd('bazi');}}><Text style={styles.goldBtnText2}>🔓 睇喜用</Text></TouchableOpacity>):(<Text style={styles.baziRes}>{baziResult}</Text>)}
        </View>
      </ScrollView>
      <View style={styles.ad}>{adsReady&&BannerAd?<BannerAd unitId={BANNER_ID} size={BannerAdSize.BANNER} />:null}</View>
    </View>
  );
}
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0f0f0f',alignItems:'center',paddingTop:60},
  title:{color:'#d4af37',fontSize:22,fontWeight:'bold'}, sub:{color:'#888',fontSize:12,marginTop:4},
  luopan:{width:280,height:280,borderRadius:140,borderWidth:4,borderColor:'#d4af37',alignItems:'center',justifyContent:'center',marginTop:25},
  n:{color:'#fff',fontWeight:'bold'}, resultBox:{backgroundColor:'#222',padding:14,borderRadius:10,marginTop:20,width:'90%',alignItems:'center'},
  wealthBox:{borderColor:'#d4af37',borderWidth:1,backgroundColor:'#2a2410'}, result:{color:'#d4af37',fontSize:18,fontWeight:'bold'},
  goldBtn:{backgroundColor:'#d4af37',padding:12,borderRadius:10,marginTop:12,width:'100%',alignItems:'center'}, goldBtnText:{color:'#000',fontWeight:'bold'},
  nativeBox:{width:'90%',backgroundColor:'#1e1e1e',borderRadius:10,padding:10,marginTop:15,alignItems:'center'},
  nativeTitle:{color:'#d4af37',fontWeight:'bold',fontSize:13,marginBottom:6},
  baziBox:{width:'90%',marginTop:15}, label:{color:'#aaa',fontSize:12},
  input:{backgroundColor:'#222',color:'#fff',padding:10,borderRadius:8,marginTop:6,borderWidth:1,borderColor:'#333'},
  goldBtn2:{backgroundColor:'#222',borderWidth:1,borderColor:'#d4af37',padding:10,borderRadius:8,marginTop:10,alignItems:'center'}, goldBtnText2:{color:'#d4af37',fontWeight:'bold'},
  baziRes:{color:'#d4af37',marginTop:10,fontSize:16,fontWeight:'bold'}, ad:{position:'absolute',bottom:0,width:'100%',alignItems:'center'}
});
