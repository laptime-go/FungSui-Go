import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import mobileAds, { BannerAd, BannerAdSize, InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';

const BANNER_ID = "ca-app-pub-9890149028563226/7565306387";
const INTER_ID = "ca-app-pub-9890149028563226/5859110495";
const OPEN_ID = "ca-app-pub-9890149028563226/1285440667";
const NATIVE_ID = "ca-app-pub-9890149028563226/9108090368";
const MOUNTAINS = ["壬","子","癸","丑","艮","寅","甲","卯","乙","辰","巽","巳","丙","午","丁","未","坤","申","庚","酉","辛","戌","乾","亥"];
const FLYING = {"正北":"一白偏財💰","西南":"二黑病符","正東":"三碧是非","東南":"四綠文昌正財💰","中宮":"五黃大煞","西北":"六白武曲","正西":"七赤破財","東北":"八白大財💰","正南":"九紫喜慶"};

export default function App(){
  const [h,setH]=useState(0);
  const [bazi,setBazi]=useState('');
  const [unlocked,setUnlocked]=useState(false);
  const [ready,setReady]=useState(false);
  const [interReady,setInterReady]=useState(false);
  const interRef=useRef(null);
  const last=useRef(0);

  useEffect(()=>{
    let sub;
    (async()=>{
      if(!(await Magnetometer.isAvailableAsync())) return;
      await Magnetometer.setUpdateIntervalAsync(500);
      sub=Magnetometer.addListener(({x,y})=>{
        let a=Math.atan2(y,x)*180/Math.PI; a=90-a; if(a<0) a+=360;
        if(Math.abs(a-last.current)>2){ last.current=a; setH(a); }
      });
    })();
    return()=>sub?.remove();
  },[]);

  useEffect(()=>{
    const t=setTimeout(async()=>{
      try{
        await mobileAds().initialize();
        setReady(true);
        const inter=InterstitialAd.createForAdRequest(INTER_ID);
        interRef.current=inter;
        inter.load();
        inter.addAdEventListener(AdEventType.LOADED,()=>setInterReady(true));
        inter.addAdEventListener(AdEventType.CLOSED,()=>{ setInterReady(false); inter.load(); setUnlocked(true); });
      }catch(e){}
    },2000);
    return()=>clearTimeout(t);
  },[]);

  const showAd=(cb)=>{
    if(interRef.current && interReady){ try{interRef.current.show();}catch(e){cb&&cb();} } else { cb&&cb(); try{interRef.current?.load();}catch(e){} }
  };

  const getM=()=>MOUNTAINS[Math.floor((h+7.5)/15)%24];
  const getDir=()=>{ const d=["正北","東北","正東","東南","正南","西南","正西","西北"]; return d[Math.round(h/45)%8]; };
  const dir=getDir();

  return (
    <View style={styles.c}>
      <ScrollView contentContainerStyle={{alignItems:'center',paddingBottom:130,paddingTop:10}} style={{width:'100%'}}>
        <Text style={styles.t}>風水佬Go - {Math.round(h)}° {ready?'✓':''}</Text>
        <Text style={styles.sub}>2026丙午年・跟LapTime同棧・SDK36</Text>
        <View style={[styles.luo,{transform:[{rotate:`${-h}deg`}]}]}><Text style={{color:'#fff'}}>▲北 {getM()} {Math.round(h)}°</Text></View>
        <View style={styles.box}><Text style={styles.r}>{dir} - {FLYING[dir]}</Text>
          <TouchableOpacity style={styles.btn} onPress={()=>showAd(()=>{})}><Text style={styles.btnT}>💰 解鎖催財秘法 {interReady?'[就緒]':''}</Text></TouchableOpacity>
        </View>
        <View style={styles.nativeBox}><Text style={{color:'#d4af37',fontSize:12}}>風水貼士 (原生廣告)</Text>{ready&&<BannerAd unitId={NATIVE_ID} size={BannerAdSize.MEDIUM_RECTANGLE} />}</View>
        <View style={{width:'90%',marginTop:15}}>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD 1990-05-20" placeholderTextColor="#666" value={bazi} onChangeText={(t)=>{setBazi(t); setUnlocked(false);}} />
          {!unlocked?<TouchableOpacity style={styles.btnDark} onPress={()=>{if(bazi.length>=4)showAd(()=>setUnlocked(true))}}><Text style={styles.btnDarkT}>🔓 解鎖喜用神</Text></TouchableOpacity>:<Text style={{color:'#d4af37',marginTop:10}}>已解鎖：喜火🔥 坐正南</Text>}
        </View>
      </ScrollView>
      <View style={styles.ad}>{ready&&<BannerAd unitId={BANNER_ID} size={BannerAdSize.BANNER} />}</View>
    </View>
  );
}
const styles=StyleSheet.create({
  c:{flex:1,backgroundColor:'#0f0f0f',alignItems:'center'},
  t:{color:'#d4af37',fontSize:20,fontWeight:'bold',marginTop:50},
  sub:{color:'#888',fontSize:11,marginTop:4},
  luo:{width:280,height:280,borderRadius:140,borderWidth:4,borderColor:'#d4af37',alignItems:'center',justifyContent:'center',marginTop:25},
  box:{backgroundColor:'#222',padding:14,borderRadius:10,marginTop:20,width:'90%',alignItems:'center',borderWidth:1,borderColor:'#333'},
  r:{color:'#d4af37',fontSize:16,fontWeight:'bold'},
  btn:{backgroundColor:'#d4af37',padding:12,borderRadius:10,marginTop:10,width:'100%',alignItems:'center'},
  btnT:{color:'#000',fontWeight:'bold'},
  btnDark:{backgroundColor:'#222',borderWidth:1,borderColor:'#d4af37',padding:12,borderRadius:10,marginTop:10,alignItems:'center'},
  btnDarkT:{color:'#d4af37',fontWeight:'bold'},
  nativeBox:{width:'90%',backgroundColor:'#1e1e1e',borderRadius:10,padding:10,marginTop:15,alignItems:'center',minHeight:280,borderWidth:1,borderColor:'#333'},
  input:{backgroundColor:'#222',color:'#fff',padding:12,borderRadius:8,borderWidth:1,borderColor:'#333'},
  ad:{position:'absolute',bottom:0,width:'100%',alignItems:'center',backgroundColor:'#000',padding:4}
});
