import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Magnetometer } from 'expo-sensors';

const BANNER_ID = "ca-app-pub-9890149028563226/7565306387";
const INTER_ID = "ca-app-pub-9890149028563226/5859110495";
const OPEN_ID = "ca-app-pub-9890149028563226/1285440667";
const NATIVE_ID = "ca-app-pub-9890149028563226/9108090368";
const MOUNTAINS_24 = ["壬","子","癸","丑","艮","寅","甲","卯","乙","辰","巽","巳","丙","午","丁","未","坤","申","庚","酉","辛","戌","乾","亥"];
const FLYING_2026 = {"正北":"一白偏財💰","西南":"二黑病符","正東":"三碧是非","東南":"四綠文昌正財💰","中宮":"五黃大煞","西北":"六白武曲","正西":"七赤破財","東北":"八白大財💰","正南":"九紫喜慶"};

let Ads = null;
try { Ads = require('react-native-google-mobile-ads'); } catch(e){}

export default function App(){
  const [heading,setHeading]=useState(0);
  const [bazi,setBazi]=useState('');
  const [baziUnlocked,setBaziUnlocked]=useState(false);
  const [adsReady,setAdsReady]=useState(false);
  const [interReady,setInterReady]=useState(false);
  const interRef = useRef(null);
  const lastH = useRef(0);

  // 1. 羅盤 - 絕對唔會死
  useEffect(()=>{
    let sub=null;
    (async()=>{
      try{
        const ok = await Magnetometer.isAvailableAsync();
        if(!ok) return;
        await Magnetometer.setUpdateIntervalAsync(600);
        sub = Magnetometer.addListener(({x,y})=>{
          let a = Math.atan2(y,x)*180/Math.PI;
          a = 90 - a; if(a<0) a+=360;
          if(Math.abs(a-lastH.current)>2){ lastH.current=a; setHeading(a); }
        });
      }catch(e){}
    })();
    return()=>{ try{sub&&sub.remove();}catch(e){} };
  },[]);

  // 2. 廣告 - 2秒後先初始化，保證App開到
  useEffect(()=>{
    if(!Ads) return;
    let listeners=[];
    const t = setTimeout(async()=>{
      try{
        await Ads.default().initialize();
        setAdsReady(true);
        // 只初始化 Interstitial，AppOpen 唔主動load，避免死app
        const inter = Ads.InterstitialAd.createForAdRequest(INTER_ID, {requestNonPersonalizedAdsOnly:true});
        interRef.current = inter;
        inter.load();
        listeners.push(inter.addAdEventListener(Ads.AdEventType.LOADED, ()=>setInterReady(true)));
        listeners.push(inter.addAdEventListener(Ads.AdEventType.CLOSED, ()=>{
          setInterReady(false);
          try{inter.load();}catch(e){}
          if(baziRef.current) setBaziUnlocked(true);
        }));
        listeners.push(inter.addAdEventListener(Ads.AdEventType.ERROR, ()=>setInterReady(false)));
      }catch(e){ setAdsReady(false); }
    }, 2500);
    return()=>{ clearTimeout(t); listeners.forEach(u=>{try{u&&u();}catch(e){}}); };
  },[]);

  const baziRef = useRef('');
  useEffect(()=>{ baziRef.current = bazi; },[bazi]);

  const showInter = (after=()=>{})=>{
    if(interRef.current && interReady){
      try{ interRef.current.show(); baziRef.current=after; }catch(e){ after(); }
    } else { after(); try{interRef.current?.load();}catch(e){} }
  };

  const getMountain=()=>MOUNTAINS_24[Math.floor((heading+7.5)/15)%24];
  const getDir=()=>{ const d=["正北","東北","正東","東南","正南","西南","正西","西北"]; return d[Math.round(heading/45)%8]; };
  const dir=getDir();
  const fly=FLYING_2026[dir];
  const isWealth=fly?.includes("財");
  const baziRes=bazi? (parseInt(bazi.slice(0,4))%2===0? "喜火🔥 宜坐正南，九紫喜慶位":"喜水💧 宜坐正北，一白財位"):"";

  const Banner = ({id,size})=>{
    if(!adsReady ||!Ads) return null;
    try{
      return <Ads.BannerAd unitId={id} size={size} onAdFailedToLoad={(e)=>{console.log('banner fail',e)}} />
    }catch(e){ return null; }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{alignItems:'center', paddingBottom:130, paddingTop:10}} style={{width:'100%'}}>
        <Text style={styles.title}>風水佬Go - {Math.round(heading)}°</Text>
        <Text style={styles.sub}>2026丙午年・SDK36穩定版 {adsReady?'✓':''}</Text>
        <View style={styles.tungBox}><Text style={styles.tungText}>今日 {new Date().toLocaleDateString('zh-HK')} | 煞東 沖兔 | 羅盤已啟動</Text></View>
        <View style={[styles.luopan,{transform:[{rotate:`${-heading}deg`}]}]}><Text style={styles.n}>▲北 {getMountain()}山</Text><Text style={styles.n2}>{Math.round(heading)}°</Text></View>
        <View style={[styles.resultBox,isWealth&&styles.wealthBox]}>
          <Text style={styles.result}>{dir} - {fly}</Text>
          <Text style={styles.resultSub}>{isWealth?'💰 搵到財位！':'轉下羅盤搵財位'}</Text>
          {isWealth&&(
            <TouchableOpacity style={styles.goldBtn} onPress={()=>showInter(()=>{})}>
              <Text style={styles.goldBtnText}>💰 解鎖催財秘法 {interReady?'[廣告就緒]':'(載入中)'}</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.nativeBox}>
          <Text style={styles.nativeTitle}>風水貼士推薦</Text>
          <Banner id={NATIVE_ID} size={Ads?.BannerAdSize?.MEDIUM_RECTANGLE} />
        </View>
        <View style={styles.baziBox}>
          <Text style={styles.label}>八字喜用 (睇廣告解鎖)：</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD 例如 1990-05-20" placeholderTextColor="#666" value={bazi} onChangeText={(t)=>{setBazi(t); setBaziUnlocked(false);}} />
          {!baziUnlocked? (
            <TouchableOpacity style={styles.goldBtnDark} onPress={()=>{ if(bazi.length>=4) showInter(()=>setBaziUnlocked(true)); }}>
              <Text style={styles.goldBtnTextDark}>🔓 睇喜用神方位 (睇廣告解鎖)</Text>
            </TouchableOpacity>
          ):(<Text style={styles.baziRes}>{baziRes}</Text>)}
        </View>
      </ScrollView>
      <View style={styles.ad}>
        <Banner id={BANNER_ID} size={Ads?.BannerAdSize?.BANNER} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0f0f0f',alignItems:'center'},
  title:{color:'#d4af37',fontSize:22,fontWeight:'bold', marginTop:50},
  sub:{color:'#888',fontSize:11,marginTop:4},
  tungBox:{backgroundColor:'#1a1a1a',borderWidth:1,borderColor:'#d4af37',padding:8,borderRadius:8,marginTop:12,width:'90%'},
  tungText:{color:'#fff',fontSize:12, textAlign:'center'},
  luopan:{width:280,height:280,borderRadius:140,borderWidth:4,borderColor:'#d4af37',alignItems:'center',justifyContent:'center',marginTop:25},
  n:{color:'#fff',fontWeight:'bold', fontSize:16},
  n2:{color:'#d4af37', fontSize:12, marginTop:4},
  resultBox:{backgroundColor:'#222',padding:14,borderRadius:10,marginTop:20,width:'90%',borderWidth:1,borderColor:'#333', alignItems:'center'},
  wealthBox:{borderColor:'#d4af37',backgroundColor:'#2a2410'},
  result:{color:'#d4af37',fontSize:18,fontWeight:'bold',textAlign:'center'},
  resultSub:{color:'#aaa',fontSize:12,marginTop:4,textAlign:'center'},
  goldBtn:{backgroundColor:'#d4af37',paddingVertical:12, paddingHorizontal:20, borderRadius:10, marginTop:12, width:'100%', alignItems:'center'},
  goldBtnText:{color:'#000',fontWeight:'bold',fontSize:15},
  goldBtnDark:{backgroundColor:'#222',borderWidth:1,borderColor:'#d4af37',paddingVertical:12, borderRadius:10, marginTop:10, width:'100%', alignItems:'center'},
  goldBtnTextDark:{color:'#d4af37',fontWeight:'bold',fontSize:14},
  nativeBox:{width:'90%',backgroundColor:'#1e1e1e',borderRadius:10,padding:10,marginTop:15,borderWidth:1,borderColor:'#333',alignItems:'center', minHeight:280},
  nativeTitle:{color:'#d4af37',fontWeight:'bold',fontSize:13, marginBottom:6},
  baziBox:{width:'90%',marginTop:15},
  label:{color:'#aaa',fontSize:12},
  input:{backgroundColor:'#222',color:'#fff',padding:12,borderRadius:8,marginTop:6,borderWidth:1,borderColor:'#333'},
  baziRes:{color:'#d4af37',marginTop:10, fontSize:16, fontWeight:'bold'},
  ad:{position:'absolute',bottom:0,width:'100%', alignItems:'center', backgroundColor:'#000', paddingVertical:4}
});
