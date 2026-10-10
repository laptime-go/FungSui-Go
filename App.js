import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Share } from 'react-native';
import { Magnetometer, Accelerometer } from 'expo-sensors';
import mobileAds, { BannerAd, BannerAdSize, InterstitialAd, AdEventType, AppOpenAd } from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IDS = {
  banner: "ca-app-pub-9890149028563226/7565306387",
  inter: "ca-app-pub-9890149028563226/5859110495",
  appopen: "ca-app-pub-9890149028563226/1285440667",
  native: "ca-app-pub-9890149028563226/9108090368"
};
const MOUNTAINS_24 = ["壬","子","癸","丑","艮","寅","甲","卯","乙","辰","巽","巳","丙","午","丁","未","坤","申","庚","酉","辛","戌","乾","亥"];
const MOUNTAINS_INFO = [
  {m:"壬",gua:"坎",el:"水",deg:"337.5-352.5"}, {m:"子",gua:"坎",el:"水",deg:"352.5-7.5"}, {m:"癸",gua:"坎",el:"水",deg:"7.5-22.5"},
  {m:"丑",gua:"艮",el:"土",deg:"22.5-37.5"}, {m:"艮",gua:"艮",el:"土",deg:"37.5-52.5"}, {m:"寅",gua:"艮",el:"木",deg:"52.5-67.5"},
  {m:"甲",gua:"震",el:"木",deg:"67.5-82.5"}, {m:"卯",gua:"震",el:"木",deg:"82.5-97.5"}, {m:"乙",gua:"震",el:"木",deg:"97.5-112.5"},
  {m:"辰",gua:"巽",el:"土",deg:"112.5-127.5"}, {m:"巽",gua:"巽",el:"木",deg:"127.5-142.5"}, {m:"巳",gua:"巽",el:"火",deg:"142.5-157.5"},
  {m:"丙",gua:"離",el:"火",deg:"157.5-172.5"}, {m:"午",gua:"離",el:"火",deg:"172.5-187.5"}, {m:"丁",gua:"離",el:"火",deg:"187.5-202.5"},
  {m:"未",gua:"坤",el:"土",deg:"202.5-217.5"}, {m:"坤",gua:"坤",el:"土",deg:"217.5-232.5"}, {m:"申",gua:"坤",el:"金",deg:"232.5-247.5"},
  {m:"庚",gua:"兌",el:"金",deg:"247.5-262.5"}, {m:"酉",gua:"兌",el:"金",deg:"262.5-277.5"}, {m:"辛",gua:"兌",el:"金",deg:"277.5-292.5"},
  {m:"戌",gua:"乾",el:"土",deg:"292.5-307.5"}, {m:"乾",gua:"乾",el:"金",deg:"307.5-322.5"}, {m:"亥",gua:"乾",el:"水",deg:"322.5-337.5"},
];
const FLY_2026 = {
  "正北": {star:"一白", name:"偏財位", desc:"2026年一白星，利財運", color:"#D4AF37", lay:"建議：水種富貴竹或一杯清水"},
  "東北": {star:"八白", name:"正財位", desc:"2026年八白最旺財位", color:"#D4AF37", lay:"建議：黃水晶聚寶盆"},
  "正東": {star:"三碧", name:"是非位", desc:"三碧是非口舌", color:"#FF6B6B", lay:"建議：紅色地氈化解"},
  "東南": {star:"四綠", name:"文昌位", desc:"四綠利讀書考試", color:"#51CF66", lay:"建議：文昌塔"},
  "正南": {star:"九紫", name:"喜慶位", desc:"九紫利喜慶人緣", color:"#FF69B4", lay:"建議：紅色佈置"},
  "西南": {star:"二黑", name:"病符位", desc:"二黑注意健康", color:"#888", lay:"建議：銅葫蘆"},
  "正西": {star:"七赤", name:"破財位", desc:"七赤注意財物", color:"#FF8E53", lay:"建議：一杯清水"},
  "西北": {star:"六白", name:"武曲位", desc:"六白利事業貴人", color:"#D4AF37", lay:"建議：六帝錢"},
  "中宮": {star:"五黃", name:"五黃位", desc:"中宮五黃宜靜", color:"#FF4444", lay:"建議：五帝錢"},
};
function calcBazi(dateStr){
  try{
    const d=new Date(dateStr); if(isNaN(d)) return null;
    const stems=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
    const y=d.getFullYear(); const m=d.getMonth()+1; const day=d.getDate();
    const yearStem=stems[(y-4)%10]; const dayStem=stems[(y*5+m*3+day)%10];
    const map={甲:"木",乙:"木",丙:"火",丁:"火",戊:"土",己:"土",庚:"金",辛:"金",壬:"水",癸:"水"};
    const five={木:1,火:1,土:1,金:1,水:1}; five[map[yearStem]]++; five[map[dayStem]]++;
    let weak=Object.entries(five).sort((a,b)=>a[1]-b[1])[0][0];
    let luckyMap={木:"火 正南 紅色",火:"土 西南 黃色",土:"金 正西 白色",金:"水 正北 黑色",水:"木 正東 綠色"};
    return {full:`${y}年 ${yearStem}命 日干${dayStem}`, xi:weak, luckyDir:luckyMap[weak], fiveCount:five};
  }catch{ return null; }
}

export default function App(){
  const [tab,setTab]=useState('compass');
  const [heading,setHeading]=useState(0); const [smooth,setSmooth]=useState(0);
  const [adsReady,setAdsReady]=useState(false); const [interReady,setInterReady]=useState(false);
  const [baziInput,setBaziInput]=useState(''); const [baziRes,setBaziRes]=useState(null);
  const [unlockedCai,setUnlockedCai]=useState(false);
  const [needCalib,setNeedCalib]=useState(false); const [lastInterTime,setLastInterTime]=useState(0);
  const interRef=useRef(null); const lastRaw=useRef(0);
  const accData=useRef({x:0,y:0,z:9.81}); const magFiltered=useRef({x:0,y:0,z:0});

  // 修復核心：濾波 + 防NaN + 一定會轉
  useEffect(()=>{
    let magSub, accSub;
    let first=true;
    (async()=>{
      const avail = await Magnetometer.isAvailableAsync();
      if(!avail){ setNeedCalib(true); return; }
      await Magnetometer.setUpdateIntervalAsync(80);
      await Accelerometer.setUpdateIntervalAsync(80);
      accSub = Accelerometer.addListener(d=>{ accData.current=d; });
      magSub = Magnetometer.addListener(d=>{
        // 低通濾波
        if(first){ magFiltered.current=d; first=false; }
        else{
          magFiltered.current.x = magFiltered.current.x*0.85 + d.x*0.15;
          magFiltered.current.y = magFiltered.current.y*0.85 + d.y*0.15;
          magFiltered.current.z = magFiltered.current.z*0.85 + d.z*0.15;
        }
        const {x,y,z} = magFiltered.current;
        const {x:ax,y:ay,z:az} = accData.current;
        if(!isFinite(ax) || Math.abs(az)<0.1) return;
        const roll = Math.atan2(ay, az);
        const pitch = Math.atan2(-ax, Math.hypot(ay,az));
        const mx = x*Math.cos(pitch)+z*Math.sin(pitch);
        const my = x*Math.sin(roll)*Math.sin(pitch)+y*Math.cos(roll)-z*Math.sin(roll)*Math.cos(pitch);
        if(!isFinite(mx) ||!isFinite(my)) return;
        let a = Math.atan2(-my, mx)*180/Math.PI;
        a = (a+360)%360;
        const strength = Math.hypot(x,y,z);
        setNeedCalib(strength<20 || strength>75);
        let diff=a-lastRaw.current; if(diff>180) diff-=360; if(diff<-180) diff+=360;
        lastRaw.current=(lastRaw.current+diff*0.25+360)%360;
        setHeading(lastRaw.current);
      });
      const saved=await AsyncStorage.getItem('bazi_v1'); if(saved) setBaziInput(saved);
    })();
    return()=>{magSub?.remove(); accSub?.remove();};
  },[]);

  useEffect(()=>{ const t=setInterval(()=>{ let d=heading-smooth; if(d>180)d-=360; if(d<-180)d+=360; setSmooth(s=>(s+d*0.12+360)%360); },16); return()=>clearInterval(t); },[heading,smooth]);

  useEffect(()=>{
    const tm=setTimeout(async()=>{
      try{
        await mobileAds().initialize(); setAdsReady(true);
        const inter=InterstitialAd.createForAdRequest(IDS.inter,{requestNonPersonalizedAdsOnly:true});
        interRef.current=inter; inter.load();
        inter.addAdEventListener(AdEventType.LOADED,()=>setInterReady(true));
        inter.addAdEventListener(AdEventType.CLOSED,()=>{ setLastInterTime(Date.now()); inter.load(); });
        AppOpenAd.createForAdRequest(IDS.appopen,{requestNonPersonalizedAdsOnly:true}).load();
      }catch{}
    },1200); return()=>clearTimeout(tm);
  },[]);

  const currentMountain = useMemo(()=>{ const idx=Math.floor((smooth+7.5)/15)%24; return MOUNTAINS_INFO[idx]; },[smooth]);
  const currentDir = useMemo(()=>{ const dirs=["正北","東北","正東","東南","正南","西南","正西","西北"]; return dirs[Math.round(smooth/45)%8]; },[smooth]);
  const fly = FLY_2026[currentDir];

  const showInter = (cb)=>{ const now=Date.now(); if(interReady&&now-lastInterTime>60000&&interRef.current){ const u=interRef.current.addAdEventListener(AdEventType.CLOSED,()=>{cb();u();}); interRef.current.show().catch(()=>cb()); } else cb(); };

  if(tab==='settings'){
    return (
      <View style={s.container}>
        <ScrollView style={{width:'100%'}} contentContainerStyle={{padding:16,paddingTop:45,paddingBottom:130}}>
          <Text style={s.title}>設定</Text><Text style={s.sub}>v1.0 (1) • {Math.round(smooth)}° 實時</Text>
          <View style={s.setCard}><Text style={s.setT}>羅盤 {needCalib?'⚠️需校準':`✓ ${Math.round(smooth)}° 正常`}</Text><Text style={s.setD}>當前 {currentMountain.m}山 {currentMountain.gua}卦 {currentMountain.el}{'\n'}此版已修復0°卡死，會跟手轉。</Text>
            <TouchableOpacity style={s.goldBtn} onPress={()=>Alert.alert('校準','平放畫8字5次')}><Text style={s.goldBtnText}>校準教學</Text></TouchableOpacity>
          </View>
          <View style={s.setCard}><Text style={s.setT}>資料</Text><Text style={s.setD}>生日：{baziInput||'未設定'}</Text>
            <TouchableOpacity style={s.darkBtn} onPress={async()=>{await AsyncStorage.setItem('bazi_v1',baziInput); Alert.alert('已儲存');}}><Text style={s.darkBtnText}>儲存</Text></TouchableOpacity>
          </View>
        </ScrollView>
        <View style={s.tabBar}><TouchableOpacity style={s.tab} onPress={()=>setTab('compass')}><Text style={s.tabOff}>羅盤</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={()=>setTab('bazi')}><Text style={s.tabOff}>八字</Text></TouchableOpacity><TouchableOpacity style={[s.tab,s.tabOn]}><Text style={s.tabOnT}>設定</Text></TouchableOpacity></View>
        <View style={s.bottomAd}>{adsReady && <BannerAd unitId={IDS.banner} size={BannerAdSize.BANNER} />}</View>
      </View>
    );
  }
  if(tab==='bazi'){
    return (
      <View style={s.container}>
        <ScrollView style={{width:'100%'}} contentContainerStyle={{alignItems:'center',paddingTop:40,paddingBottom:130}}>
          <Text style={s.title}>八字參考</Text>
          <View style={[s.card,{width:'92%'}]}>
            <TextInput style={s.input} placeholder="YYYY-MM-DD" placeholderTextColor="#666" value={baziInput} onChangeText={setBaziInput} />
            <TouchableOpacity style={s.goldBtn} onPress={()=>{ const r=calcBazi(baziInput); if(!r) setBaziRes({error:"格式 YYYY-MM-DD"}); else { setBaziRes(r); AsyncStorage.setItem('bazi_v1',baziInput); }}}><Text style={s.goldBtnText}>查看分析</Text></TouchableOpacity>
            {baziRes && <View style={s.unlockedBox}><Text style={s.unlockedText}>{baziRes.error||`${baziRes.full}\n喜${baziRes.xi} 宜${baziRes.luckyDir}`}</Text></View>}
          </View>
          <View style={s.nativeBox}>{adsReady && <BannerAd unitId={IDS.native} size={BannerAdSize.MEDIUM_RECTANGLE} />}</View>
        </ScrollView>
        <View style={s.tabBar}><TouchableOpacity style={s.tab} onPress={()=>setTab('compass')}><Text style={s.tabOff}>羅盤</Text></TouchableOpacity><TouchableOpacity style={[s.tab,s.tabOn]}><Text style={s.tabOnT}>八字</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={()=>setTab('settings')}><Text style={s.tabOff}>設定</Text></TouchableOpacity></View>
        <View style={s.bottomAd}>{adsReady && <BannerAd unitId={IDS.banner} size={BannerAdSize.BANNER} />}</View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <ScrollView style={{width:'100%'}} contentContainerStyle={{alignItems:'center', paddingBottom:140, paddingTop:35}}>
        <Text style={s.title}>風水佬Go {Math.round(smooth)}° {needCalib?'需校準':''}</Text>
        <Text style={s.sub}>2026 • {currentDir} {fly.star}{fly.name} • {currentMountain.m}山</Text>
        <View style={s.luoPanWrap}>
          <View style={[s.luoPan, {transform:[{rotate:`${-smooth}deg`}]}]}>
            <View style={s.luoInner}>
              {MOUNTAINS_24.map((m,i)=>(<View key={m} style={[s.mountainMark, {transform:[{rotate:`${i*15}deg`}, {translateY:-110}]}]}><Text style={[s.mountainText, currentMountain?.m===m && s.mountainActive]}>{m}</Text></View>))}
              <View style={s.centerDot}><Text style={{color:'#000',fontWeight:'bold',fontSize:12}}>{currentMountain.m}</Text></View>
            </View>
            <Text style={s.northMark}>北 {Math.round(smooth)}°</Text>
          </View>
          <View style={s.fixedNeedle}><Text style={{color:'red',fontSize:20}}>▼</Text></View>
        </View>
        <View style={[s.card, {borderColor: fly.color}]}>
          <Text style={[s.cardTitle, {color:fly.color}]}>{currentDir} - {fly.star} {fly.name}</Text>
          <Text style={s.cardDesc}>{fly.desc}</Text>
          <Text style={s.mountainDetail}>坐{currentMountain.m}山 {currentMountain.deg}° {currentMountain.gua}卦</Text>
          {!unlockedCai? (<TouchableOpacity style={s.goldBtn} onPress={()=>showInter(()=>setUnlockedCai(true))}><Text style={s.goldBtnText}>查看詳細佈局</Text></TouchableOpacity>) : (<View style={s.unlockedBox}><Text style={s.unlockedText}>{fly.lay}</Text></View>)}
        </View>
        <View style={s.nativeBox}><Text style={s.adLabel}>推薦</Text>{adsReady && <BannerAd unitId={IDS.native} size={BannerAdSize.MEDIUM_RECTANGLE} />}</View>
      </ScrollView>
      <View style={s.tabBar}><TouchableOpacity style={[s.tab,s.tabOn]}><Text style={s.tabOnT}>羅盤</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={()=>setTab('bazi')}><Text style={s.tabOff}>八字</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={()=>setTab('settings')}><Text style={s.tabOff}>設定</Text></TouchableOpacity></View>
      <View style={s.bottomAd}>{adsReady && <BannerAd unitId={IDS.banner} size={BannerAdSize.BANNER} />}</View>
    </View>
  );
}
const s=StyleSheet.create({
  container:{flex:1, backgroundColor:'#0f0f0f', alignItems:'center'},
  title:{color:'#d4af37', fontSize:22, fontWeight:'bold'}, sub:{color:'#888', fontSize:12, marginTop:4},
  luoPanWrap:{width:300,height:300, alignItems:'center', justifyContent:'center', marginTop:20},
  luoPan:{width:280,height:280, borderRadius:140, borderWidth:3, borderColor:'#d4af37', backgroundColor:'#1a1a1a', alignItems:'center', justifyContent:'center'},
  luoInner:{width:220,height:220, borderRadius:110, borderWidth:1, borderColor:'#333', alignItems:'center', justifyContent:'center'},
  mountainMark:{position:'absolute', top:'50%', left:'50%', width:20, marginLeft:-10, marginTop:-10, alignItems:'center'},
  mountainText:{color:'#888', fontSize:11}, mountainActive:{color:'#000', fontWeight:'bold', fontSize:13, backgroundColor:'#d4af37', borderRadius:4, paddingHorizontal:3},
  centerDot:{width:40,height:40,borderRadius:20,backgroundColor:'#d4af37',alignItems:'center',justifyContent:'center'},
  northMark:{position:'absolute', top:-24, color:'#fff', fontSize:11}, fixedNeedle:{position:'absolute', top:0},
  card:{width:'92%', backgroundColor:'#1e1e1e', borderRadius:12, padding:14, marginTop:16, borderWidth:1, borderColor:'#333'},
  cardTitle:{color:'#d4af37', fontSize:16, fontWeight:'bold'}, cardDesc:{color:'#ccc', fontSize:13, marginTop:6}, mountainDetail:{color:'#888', fontSize:11, marginTop:6},
  goldBtn:{backgroundColor:'#d4af37', padding:12, borderRadius:10, marginTop:12, alignItems:'center'}, goldBtnText:{color:'#000', fontWeight:'bold'},
  darkBtn:{backgroundColor:'#222', borderWidth:1, borderColor:'#d4af37', padding:12, borderRadius:10, marginTop:10, alignItems:'center'}, darkBtnText:{color:'#d4af37', fontWeight:'bold'},
  unlockedBox:{backgroundColor:'#2a2a2a', padding:10, borderRadius:8, marginTop:10}, unlockedText:{color:'#ddd', fontSize:13, marginTop:4, lineHeight:18},
  nativeBox:{width:'92%', backgroundColor:'#151515', borderRadius:12, padding:8, marginTop:16, alignItems:'center', minHeight:270, borderWidth:1, borderColor:'#333'},
  adLabel:{color:'#666', fontSize:10, marginBottom:4}, input:{backgroundColor:'#222', color:'#fff', padding:12, borderRadius:8, borderWidth:1, borderColor:'#333', marginTop:10},
  bottomAd:{position:'absolute', bottom:0, width:'100%', alignItems:'center', backgroundColor:'#000', height:52},
  tabBar:{position:'absolute', bottom:52, flexDirection:'row', width:'100%', backgroundColor:'#111', borderTopWidth:1, borderColor:'#222', height:50},
  tab:{flex:1, alignItems:'center', justifyContent:'center'}, tabOn:{backgroundColor:'#1e1e1e'}, tabOnT:{color:'#d4af37', fontWeight:'bold'}, tabOff:{color:'#666'},
  setCard:{width:'100%', backgroundColor:'#161616', borderRadius:12, padding:14, marginTop:12, borderWidth:1, borderColor:'#2a2a2a'},
  setT:{color:'#fff', fontSize:15, fontWeight:'bold'}, setD:{color:'#888', fontSize:12, marginTop:6, lineHeight:18},
});
