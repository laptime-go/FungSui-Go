import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import mobileAds, { BannerAd, BannerAdSize, InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';

const BANNER = "ca-app-pub-9890149028563226/7565306387";
const INTER = "ca-app-pub-9890149028563226/5859110495";
const NATIVE = "ca-app-pub-9890149028563226/9108090368";

export default function App(){
  const [h,setH]=useState(0); const [ready,setReady]=useState(false); const [bazi,setBazi]=useState(''); const [unlock,setUnlock]=useState(false);
  const interRef=useRef(null); const last=useRef(0);
  useEffect(()=>{ let sub; (async()=>{ if(!(await Magnetometer.isAvailableAsync())) return; await Magnetometer.setUpdateIntervalAsync(500); sub=Magnetometer.addListener(({x,y})=>{ let a=Math.atan2(y,x)*180/Math.PI; a=90-a; if(a<0)a+=360; if(Math.abs(a-last.current)>2){last.current=a; setH(a);} }); })(); return()=>sub?.remove(); },[]);
  useEffect(()=>{ const t=setTimeout(async()=>{ try{ await mobileAds().initialize(); setReady(true); const i=InterstitialAd.createForAdRequest(INTER); interRef.current=i; i.load(); i.addAdEventListener(AdEventType.CLOSED,()=>{ i.load(); setUnlock(true); }); }catch(e){} },2000); return()=>clearTimeout(t); },[]);
  return (
    <View style={s.c}>
      <ScrollView contentContainerStyle={{alignItems:'center',paddingBottom:130,paddingTop:10}} style={{width:'100%'}}>
        <Text style={s.title}>風水佬Go {Math.round(h)}° {ready?'✓':''}</Text>
        <View style={[s.luo,{transform:[{rotate:`${-h}deg`}]}]}><Text style={{color:'#fff'}}>▲ {Math.round(h)}°</Text></View>
        <View style={s.box}><Text style={s.r}>財位: {["正北","東北","正東","東南","正南","西南","正西","西北"][Math.round(h/45)%8]}</Text>
          <TouchableOpacity style={s.btn} onPress={()=>{ try{interRef.current?.show();}catch(e){} }}><Text style={s.btnT}>💰 睇催財秘法</Text></TouchableOpacity>
        </View>
        <View style={s.nativeBox}>{ready&&<BannerAd unitId={NATIVE} size={BannerAdSize.MEDIUM_RECTANGLE} />}</View>
        <View style={{width:'90%',marginTop:15}}><TextInput style={s.input} placeholder="1990-05-20" placeholderTextColor="#666" value={bazi} onChangeText={setBazi} />
        {!unlock?<TouchableOpacity style={s.btnDark} onPress={()=>{ if(bazi.length>=4){ try{interRef.current?.show();}catch(e){ setUnlock(true);} }}}><Text style={s.btnDarkT}>🔓 解鎖喜用神</Text></TouchableOpacity>:<Text style={{color:'#d4af37',marginTop:10}}>已解鎖：喜火🔥</Text>}</View>
      </ScrollView>
      <View style={s.ad}>{ready&&<BannerAd unitId={BANNER} size={BannerAdSize.BANNER} />}</View>
    </View>
  );
}
const s=StyleSheet.create({c:{flex:1,backgroundColor:'#0f0f0f',alignItems:'center'},title:{color:'#d4af37',fontSize:20,fontWeight:'bold',marginTop:50},luo:{width:280,height:280,borderRadius:140,borderWidth:4,borderColor:'#d4af37',alignItems:'center',justifyContent:'center',marginTop:25},box:{backgroundColor:'#222',padding:14,borderRadius:10,marginTop:20,width:'90%',alignItems:'center'},r:{color:'#d4af37',fontSize:16,fontWeight:'bold'},btn:{backgroundColor:'#d4af37',padding:12,borderRadius:10,marginTop:10,width:'100%',alignItems:'center'},btnT:{color:'#000',fontWeight:'bold'},btnDark:{backgroundColor:'#222',borderWidth:1,borderColor:'#d4af37',padding:12,borderRadius:10,marginTop:10,alignItems:'center'},btnDarkT:{color:'#d4af37',fontWeight:'bold'},nativeBox:{width:'90%',backgroundColor:'#1e1e1e',borderRadius:10,padding:10,marginTop:15,alignItems:'center',minHeight:280},input:{backgroundColor:'#222',color:'#fff',padding:12,borderRadius:8,borderWidth:1,borderColor:'#333'},ad:{position:'absolute',bottom:0,width:'100%',alignItems:'center',backgroundColor:'#000',padding:4}});
