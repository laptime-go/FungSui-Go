import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, AppState} from 'react-native';
import { Magnetometer } from 'expo-sensors';

const BANNER_ID = "ca-app-pub-9890149028563226/7565306387";
const INTER_ID = "ca-app-pub-9890149028563226/5859110495";
const OPEN_ID = "ca-app-pub-9890149028563226/1285440667";
const NATIVE_ID = "ca-app-pub-9890149028563226/9108090368";
const MOUNTAINS_24 = ["壬","子","癸","丑","艮","寅","甲","卯","乙","辰","巽","巳","丙","午","丁","未","坤","申","庚","酉","辛","戌","乾","亥"];
const FLYING_2026 = {"正北":"一白偏財💰","西南":"二黑病符","正東":"三碧是非","東南":"四綠文昌正財💰","中宮":"五黃大煞","西北":"六白武曲","正西":"七赤破財","東北":"八白大財💰","正南":"九紫喜慶"};

// 安全 Banner 組件，就算廣告炸都唔會死 app
function SafeBanner({unitId, size}){
  const [ok,setOk]=useState(true);
  if(!ok) return null;
  try{
    const { BannerAd } = require('react-native-google-mobile-ads');
    return <BannerAd unitId={unitId} size={size} onAdFailedToLoad={()=>setOk(false)} onAdFailedToOpen={()=>setOk(false)} />;
  }catch(e){ return null; }
}

export default function App(){
  const [heading,setHeading]=useState(0);
  const [bazi,setBazi]=useState('');
  const [baziUnlocked,setBaziUnlocked]=useState(false);
  const [adsReady,setAdsReady]=useState(false);
  const [interLoaded,setInterLoaded]=useState(false);
  const lastAdTime=useRef(0);
  const pendingAction=useRef(null);
  const interstitialRef=useRef(null);
  const appOpenRef=useRef(null);
  const appOpenLoaded=useRef(false);
  const lastH=useRef(0);

  useEffect(()=>{
    let sub=null;
    (async()=>{
      try{
        if(!(await Magnetometer.isAvailableAsync())) return;
        await Magnetometer.setUpdateIntervalAsync(500);
        sub=Magnetometer.addListener(d=>{
          let a=Math.atan2(d.y,d.x)*180/Math.PI; a=90-a; if(a<0) a+=360;
          if(Math.abs(a-lastH.current)>2){ lastH.current=a; setHeading(a);}
        });
      }catch(e){}
    })();
    return()=>{ try{sub&&sub.remove();}catch(e){} };
  },[]);

  useEffect(()=>{
    let listeners=[];
    let t1=setTimeout(async()=>{
      try{
        const mobileAds = require('react-native-google-mobile-ads').default;
        const { InterstitialAd, AppOpenAd, AdEventType } = require('react-native-google-mobile-ads');
        await mobileAds().initialize();
        setAdsReady(true);

        // 1. Interstitial
        try{
          const inter=InterstitialAd.createForAdRequest(INTER_ID,{requestNonPersonalizedAdsOnly:true});
          interstitialRef.current=inter;
          inter.load();
          listeners.push(inter.addAdEventListener(AdEventType.LOADED,()=> setInterLoaded(true)));
          listeners.push(inter.addAdEventListener(AdEventType.CLOSED,()=>{
            setInterLoaded(false);
            try{inter.load();}catch(e){}
            lastAdTime.current=Date.now();
            if(pendingAction.current==='bazi') setBaziUnlocked(true);
            pendingAction.current=null;
          }));
          listeners.push(inter.addAdEventListener(AdEventType.ERROR,()=> setInterLoaded(false)));
        }catch(e){}

        // 2. AppOpen 延後再延後，入到前景先 show，絕對唔開機自動 show
        setTimeout(()=>{
          try{
            const ao=AppOpenAd.createForAdRequest(OPEN_ID,{requestNonPersonalizedAdsOnly:true});
            appOpenRef.current=ao;
            ao.load();
            listeners.push(ao.addAdEventListener(AdEventType.LOADED,()=>{ appOpenLoaded.current=true; }));
            listeners.push(ao.addAdEventListener(AdEventType.CLOSED,()=>{ appOpenLoaded.current=false; try{ao.load();}catch(e){}}));
            listeners.push(ao.addAdEventListener(AdEventType.ERROR,()=>{ appOpenLoaded.current=false; }));
            const sub=AppState.addEventListener('change', ns=>{
              if(ns==='active' && appOpenLoaded.current && appOpenRef.current){
                setTimeout(()=>{ try{appOpenRef.current.show();}catch(e){} }, 1000);
              }
            });
            listeners.push(()=>sub.remove());
          }catch(e){}
        }, 6000);

      }catch(e){ setAdsReady(true); }
    }, 2000);

    return()=>{ clearTimeout(t1); listeners.forEach(f=>{try{f&&f();}catch(e){}}); };
  },[]);

  const showAd=(type)=>{
    const now=Date.now();
    if(now-lastAdTime.current<60000 && type!=='bazi'){ if(type==='bazi') setBaziUnlocked(true); return; }
    pendingAction.current=type;
    const inter=interstitialRef.current;
    if(inter&&interLoaded){ try{inter.show();}catch(e){ if(type==='bazi') setBaziUnlocked(true);} }
    else { try{inter?.load();}catch(e){} if(type==='bazi') setBaziUnlocked(true); }
  };

  const getMountain=()=>MOUNTAINS_24[Math.floor((heading+7.5)/15)%24];
  const getDirection=()=>{ const dirs=["正北","東北","正東","東南","正南","西南","正西","西北"]; return dirs[Math.round(heading/45)%8]; };
  const dir=getDirection();
  const isWealth=FLYING_2026[dir]?.includes("財");
  const baziResult=bazi? (parseInt(bazi.slice(0,4))%2==0? "喜火🔥 宜坐正南，九紫位":"喜水💧 宜坐正北，一白財位"):"";
  const { BannerAdSize } = (()=>{ try{return require('react-native-google-mobile-ads');}catch(e){return {BannerAdSize:{BANNER:'BANNER', MEDIUM_RECTANGLE:'MEDIUM_RECTANGLE'}}} })();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{alignItems:'center', paddingBottom:120}}>
        <Text style={styles.title}>風水佬Go - {Math.round(heading)}°</Text>
        <Text style={styles.sub}>2026丙午年・SDK36終極唔死版 {adsReady?'✓廣告OK':''}</Text>
        <View style={styles.tungBox}><Text style={styles.tungText}>今日 {new Date().toLocaleDateString('zh-HK')} | 煞東 沖兔</Text></View>
        <View style={[styles.luopan,{transform:[{rotate:`${-heading}deg`}]}]}><Text style={styles.n}>▲北 {getMountain()}山</Text></View>
        <View style={[styles.resultBox,isWealth&&styles.wealthBox]}>
          <Text style={styles.result}>{dir} - {FLYING_2026[dir]}</Text>
          <Text style={styles.resultSub}>{isWealth?'💰 搵到財位！':'轉下羅盤搵財位'}</Text>
          {isWealth&&(
            <TouchableOpacity style={styles.goldBtn} onPress={()=>showAd('wealth')}>
              <Text style={styles.goldBtnText}>💰 解鎖催財秘法 (睇廣告)</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.nativeBox}>
          <Text style={styles.nativeTitle}>風水貼士推薦</Text>
          {adsReady && <SafeBanner unitId={NATIVE_ID} size={BannerAdSize.MEDIUM_RECTANGLE} />}
        </View>
        <View style={styles.baziBox}>
          <Text style={styles.label}>八字喜用 (增加留存 + 多1次收益):</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD 例如 1990-05-20" placeholderTextColor="#666" value={bazi} onChangeText={(t)=>{setBazi(t); setBaziUnlocked(false);}} />
          {!baziUnlocked? (
            <TouchableOpacity style={[styles.goldBtn,{backgroundColor:'#222',borderWidth:1,borderColor:'#d4af37',marginTop:10}]} onPress={()=>{ if(bazi.length>=4) showAd('bazi');}}>
              <Text style={[styles.goldBtnText,{color:'#d4af37'}]}>🔓 睇喜用神方位 (睇廣告解鎖)</Text>
            </TouchableOpacity>
          ):(<Text style={styles.baziRes}>{baziResult}</Text>)}
        </View>
      </ScrollView>
      <View style={styles.ad}>
        {adsReady && <SafeBanner unitId={BANNER_ID} size={BannerAdSize.BANNER} />}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0f0f0f',alignItems:'center',paddingTop:60},
  title:{color:'#d4af37',fontSize:22,fontWeight:'bold'},
  sub:{color:'#888',fontSize:12,marginTop:4},
  tungBox:{backgroundColor:'#1a1a1a',borderWidth:1,borderColor:'#d4af37',padding:8,borderRadius:8,marginTop:12,width:'90%'},
  tungText:{color:'#fff',fontSize:12},
  luopan:{width:280,height:280,borderRadius:140,borderWidth:4,borderColor:'#d4af37',alignItems:'center',justifyContent:'center',marginTop:25},
  n:{color:'#fff',fontWeight:'bold'},
  resultBox:{backgroundColor:'#222',padding:14,borderRadius:10,marginTop:20,width:'90%',borderWidth:1,borderColor:'#333', alignItems:'center'},
  wealthBox:{borderColor:'#d4af37',backgroundColor:'#2a2410'},
  result:{color:'#d4af37',fontSize:18,fontWeight:'bold',textAlign:'center'},
  resultSub:{color:'#aaa',fontSize:12,marginTop:4,textAlign:'center'},
  goldBtn:{backgroundColor:'#d4af37',paddingVertical:12, paddingHorizontal:20, borderRadius:10, marginTop:12, width:'100%', alignItems:'center'},
  goldBtnText:{color:'#000',fontWeight:'bold',fontSize:15},
  nativeBox:{width:'90%',backgroundColor:'#1e1e1e',borderRadius:10,padding:10,marginTop:15,borderWidth:1,borderColor:'#333',alignItems:'center'},
  nativeTitle:{color:'#d4af37',fontWeight:'bold',fontSize:13, marginBottom:6},
  baziBox:{width:'90%',marginTop:15},
  label:{color:'#aaa',fontSize:12},
  input:{backgroundColor:'#222',color:'#fff',padding:10,borderRadius:8,marginTop:6,borderWidth:1,borderColor:'#333'},
  baziRes:{color:'#d4af37',marginTop:10, fontSize:16, fontWeight:'bold'},
  ad:{position:'absolute',bottom:0,width:'100%', alignItems:'center'}
});
